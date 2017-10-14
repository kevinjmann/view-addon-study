import morph from 'nanomorph';

function createNode(string, id) {
  const node = document.createElement('div');
  node.setAttribute('id', id);
  node.innerHTML = string;
  return node;
};

function getContentElement() {
  return document.getElementById('wertiview-content');
}

export default class Markup {
  constructor(server, data) {
    this.data = data;
    this.server = server;
  }

  getOriginal() {
    return getContentElement().innerHTML;
  }

  fetch(original) {
    return this.server.view({
      ...this.data,
      filter: 'no-filter',
      document: original,
    });
  }

  apply(enhanced) {
    morph(
      document.getElementById('wertiview-content'),
      createNode(enhanced, 'wertiview-enhanced-content'),
    );
  }

  restore(original) {
    morph(
      document.getElementById('wertiview-enhanced-content'),
      createNode(original, 'wertiview-content'),
    );
  }

  error(error) {
    console.error(error);
  }
}
