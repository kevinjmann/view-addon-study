import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import Color from './Enhancements/Color';
import Cloze from './Enhancements/Cloze';
import MultipleChoice from './Enhancements/MultipleChoice';
import Click from './Enhancements/Click';
import { combineStore } from '../Store';
import selectionsToConstraints from './SelectionsToConstraints';

// FIXME: getHits should return a generator

const matchesSelections = (node, selections) => {
  const entries = Object.entries(selections);
  for (const [attribute, { match }] of entries) {
    const value = node.getAttribute(attribute);
    if (!match.has(value)) {
      return false;
    }
  }
  return true;
};

const getHits = (selections) => {
  const attributes = Object.keys(selections);
  attributes.push('data-view-hit');
  const cssQuery = 'viewEnhancement' + attributes.map(attr => `[${attr}]`).join('');
  const nodeList = document.querySelectorAll(cssQuery);
  const nodes = [];
  for (var node of nodeList) {
    if (matchesSelections(node, selections)) {
      nodes.push(node);
    }
  }
  return nodes;
};

class Enhancer {
  constructor() {
    this.enhancement = null;
    this.nodes = [];
    this.enhanced = false;

    this.enhancements = {
      'color': Color,
      'click': Click,
      'mc': MultipleChoice,
      'cloze': Cloze,
    };
  }

  start(activity, selections) {
    const anchors = document.querySelectorAll('a');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      anchor.removeAttribute('href');
      anchor.setAttribute('data-view-href', href);
    }
    this.enhancement = new this.enhancements[activity]();
    this.nodes = getHits(selections);
    for (const node of this.nodes) {
      this.enhancement.enhance(node, activity);
    }
  }

  stop() {
    const anchors = document.querySelectorAll('a');

    for (const anchor of anchors) {
      const href = anchor.getAttribute('data-href');
      anchor.setAttribute('href', href);
      anchor.removeAttribute('data-view-href');
    }

    for (const node of this.nodes) {
      this.enhancement.clear(node);
    }

    typeof this.enhancement.destroy === 'function'
      && this.enhancement.destroy();

    this.nodes = [];
    this.enhancement = null;
  }

  update(activity, selections) {
    this.enhanced && this.stop();
    this.start(activity, selections);
    this.enhanced = true;
  }
}

export default (selections$, markup$) => {
  const status = new Subject();
  const enhancer = new Enhancer();
  combineStore({ selectionConfig: selections$, markup: markup$ })
    .filter(({ markup }) => markup === 'markup done')
    .map(({ selectionConfig: { ...selectionConfig, selections }, ...config }) => ({
      ...config, selectionConfig, constraints: selectionsToConstraints(selections)
    }))
    .subscribe(({ selectionConfig: { activity }, constraints }) => {
      status.next('updating enhancements');
      enhancer.update(activity, constraints);
      status.next('ready');
    }
  );
  return status;
};
