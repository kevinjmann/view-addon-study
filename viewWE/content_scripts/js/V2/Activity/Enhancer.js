import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import Color from './Enhancements/Color';
import Cloze from './Enhancements/Cloze';
import MultipleChoice from './Enhancements/MultipleChoice';
import Click from './Enhancements/Click';
import { combineStore } from '../Store';
import selectionsToConstraints from './SelectionsToConstraints';

import CamdenTownExercises from './CamdenTownExercises';
import view from '../../view';
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

const selectifyTargets = (targets) => {
  const selections = {};
  targets.forEach(({ data, match }) => selections[`data-${data}`] = { match: new Set(match) }) ;
  console.log('newSelections', selections);
  return selections;
};

const getHits = (selections, targets) => {
  const attributes = Object.keys(selections);
  const cssQuery = 'viewEnhancement' + attributes.map(attr => `[${attr}]`).join('');
  console.log('cssQuery', cssQuery);
  console.log('selections', selections);
  const nodeList = document.querySelectorAll(cssQuery);
  const nodes = [];
  const constraints = Object.assign({}, selectifyTargets(targets), selections);
  for (var node of nodeList) {
    if (matchesSelections(node, constraints)) {
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
    this.changedNodes=[];

    this.enhancements = {
      'color': Color,
      'click': Click,
      'mc': MultipleChoice,
      'cloze': Cloze,
    };
  }

  start(activity, selections, targets, topic, language) {
    const anchors = document.querySelectorAll('a');
    const toolbar = document.getElementById('wertiview-toolbar-container');
    var convertLinks = true;
    if (toolbar){
      var style = getComputedStyle(toolbar);
      if(style.display==='none'){
        convertLinks=false;
      }
    }
    if(convertLinks){
      for (const anchor of anchors) {
        const href = anchor.getAttribute('href');
        anchor.removeAttribute('href');
        anchor.setAttribute('data-view-href', href);
      }
    }
    
    this.enhancement = new this.enhancements[activity](topic, language);
    this.nodes = getHits(selections, targets);
    [this.nodes, this.changedNodes]=CamdenTownExercises.filter(this.nodes, topic);
    for (const node of this.nodes) {
      this.enhancement.enhance(node, topic);
    }
    //start tracking for task
    view.language=language;
    view.topic=topic;
    view.activity=activity;
    view.timestamp=Date.now();
    view.requestToSendTaskDataAndGetTaskId();

    view.study.handleTooltips();

  }

  stop() {
    const anchors = document.querySelectorAll('a');
    for (var anchor of anchors) {
    //   console.log('hello?');
    //   if(anchor.hasAttribute('data-view-href')){
    //     console.log('is this even getting triggered?');
        var href = anchor.getAttribute('href');
        anchor.setAttribute('data-view-href', href);
        anchor.setAttribute('href', href);
        // anchor.removeAttribute('data-view-href');

    //   }
      
    }

    for (const node of this.nodes) {
      if(node.hasAttribute('text-before-chunking')){ //restores original text before chunking operation
        node.setAttribute('data-original-text', node.getAttribute('text-before-chunking'));
        node.removeAttribute('text-before-chunking');
      }
      this.enhancement.clear(node);
    }
    for (const changedNode of this.changedNodes){ //restores nodes removed due to chunking
      if(changedNode.textContent!=changedNode.getAttribute('data-original-text')){
        changedNode.textContent=changedNode.getAttribute('data-original-text');
      }
    }
    typeof this.enhancement.destroy === 'function'
      && this.enhancement.destroy();

    this.nodes = [];
    this.enhancement = null;
    this.changedNodes=[];
  }

  update(activity, selections, targets, topic, language) {
    this.enhanced && this.stop();
    this.start(activity, selections, targets, topic, language);
    this.enhanced = true;

  }
}

export default (selections$, markup$, command$) => {
  const status = new Subject();
  const enhancer = new Enhancer();
  combineStore({ selectionConfig: selections$, markup: markup$, control: command$ })
    .filter(({ markup }) => markup === 'markup done')
    .filter(({ control: { command } }) => command === 'start')
    .map(({ selectionConfig: { ...selectionConfig, selections }, ...config }) => ({
      ...config, selectionConfig, constraints: selectionsToConstraints(selections)
    }))
    .subscribe(({
      selectionConfig: { activity },
      constraints,
      control: { configuration: { targets, topic, language }}
    }) => {
      status.next('updating enhancements');
      enhancer.update(activity, constraints, targets, topic, language);
      status.next('ready');
    }
  );
  return status;
};
