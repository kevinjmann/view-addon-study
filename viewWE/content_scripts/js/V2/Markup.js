import morph from 'nanomorph';

const createNode = (string) => {
  const node = document.createElement('div');
  node.innerHTML = string;
  return node;
}

export default class Markup {
  constructor(server, data) {
    this.data = data;
    this.server = server;
    this.content = document.getElementById('wertiview-content');
    this.markupPromise = null;
  }

  fetchMarkup() {
    this.original = this.content.innerHTML;
    this.markupPromise = this.server.view({
      ...this.data,
      filter: 'no-filter',
      document: this.original,
    });
  }

  async apply() {
    const markup = await this.markupPromise;
    this.content = morph(this.content, createNode(markup));
  }

  async restore() {
    morph(this.content, createNode(this.original));
    this.original = null;
  }
}
