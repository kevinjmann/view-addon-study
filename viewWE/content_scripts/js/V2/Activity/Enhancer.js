import Color from './Enhancements/Color';
import Cloze from './Enhancements/Cloze';
import MultipleChoice from './Enhancements/MultipleChoice';
import Click from './Enhancements/Click';
import Simple from './Enhancements/Simple';
import * as Action from '../Actions';

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

export default class Enhancer {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.enhancement = null;
    this.nodes = [];

    this.enhancements = {
      'color': Color,
      'click': Click,
      'mc': MultipleChoice,
      'cloze': Cloze,
    };
  }

  async start() {
    const anchors = document.querySelectorAll('a');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      anchor.removeAttribute('href');
      anchor.setAttribute('data-view-href', href);
    }
    this.enhancement = new this.enhancements[this.activity]();
    this.nodes = getHits(this.selections);
    for (const node of this.nodes) {
      this.enhancement.enhance(node, this.activity, this.topic);
    }
  }

  async stop() {
    const anchors = document.querySelectorAll('a');
    for (const anchor of anchors) {
      const href = anchor.getAttribute('data-href');
      anchor.setAttribute('href', href);
      anchor.removeAttribute('data-view-href');
    }
    for (const node of this.nodes) {
      this.enhancement.clear(node);
    }
    this.nodes = [];
    this.enhancement = null;
  }

  needsUpdate(topic, activity, selections) {
    return this.nodes.length === 0
      || this.topic !== topic
      || this.activity !== activity
      || this.selections !== selections;
  }

  async update(currently, isV2Topic, topic, activity, selections) {
    if ((currently === 'ready' || currently === 'enhancing') && !isV2Topic) {
      this.dispatch(Action.destroyMarkup());
      await this.stop();
      return;
    }

    console.log('update', currently, isV2Topic, this.needsUpdate(topic, activity, selections));
    if ((currently === 'ready for enhancement' || currently === 'ready')
        && isV2Topic && (this.needsUpdate(topic, activity, selections))) {
      this.dispatch(Action.enhancing());
      await this.stop();
      this.topic = topic;
      this.activity = activity;
      this.selections = selections;
      await this.start();
      this.dispatch(Action.enhancementReady());
    }
  }
}
