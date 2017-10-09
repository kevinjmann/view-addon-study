import morph from 'nanomorph';

export default class Markup {
  constructor(server) {
    this.content = document.getElementById('wertiview-content');
    this.original = this.content.innerHTML;
    this.markupPromise = null;
  }

  fetchMarkup(data) {
    this.markupPromise = this.server.view(data);
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
