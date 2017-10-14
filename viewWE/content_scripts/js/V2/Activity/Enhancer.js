import Color from './Enhancements/Color';
import Cloze from './Enhancements/Cloze';
import MultipleChoice from './Enhancements/MultipleChoice';
import Click from './Enhancements/Click';

// FIXME: getEnhancements should return a generator

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

const getEnhancements = (selections) => {
  const attributes = Object.keys(selections);
  const cssQuery = attributes.map(attr => `[${attr}]`).join('');
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
  constructor() {
    this.enhancement = null;
    this.nodes = [];

    this.enhancements = {
      'color': Color,
      'click': Click,
      'mc': MultipleChoice,
      'cloze': Cloze,
    };
  }

  start() {
    this.enhancement = new this.enhancements[this.activity]();
    this.nodes = getEnhancements(this.selections);
    for (const node of this.nodes) {
      this.enhancement.enhance(node, this.activity, this.topic);
    }
  }

  stop() {
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

  update(ready, topic, activity, selections) {
    if (ready && (this.needsUpdate(topic, activity, selections))) {
      this.stop();
      this.topic = topic;
      this.activity = activity;
      this.selections = selections;
      this.start();
    }
  }
}
