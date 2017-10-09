import morph from 'nanomorph';

export default class Markup {
  constructor(server, data) {
    this.data = data;
    this.server = server;
    this.content = document.getElementById('wertiview-content');
    this.original = this.content.innerHTML;
    this.markupPromise = null;
  }

  fetchMarkup() {
    this.markupPromise = this.server.view({
      ...this.data,
      filter: 'no-filter',
      document: this.original,
    });
  }

  async applyMarkup() {
    const markup = await this.markupPromise;
    morph(this.content, markup);
  }

  async restore() {
    morph(this.content, this.original);
    this.original = null;
  }
}
