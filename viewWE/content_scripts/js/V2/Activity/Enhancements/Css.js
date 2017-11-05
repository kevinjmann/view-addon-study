// Helper class to apply style sheets

export default class Css {
  constructor() {
    this.indices = [];
    this.styleSheet = document.styleSheets[0];
  }

  apply(css) {
    this.indices.push(this.styleSheet.insertRule(css));
  }

  remove() {
    const styleSheet = this.styleSheet;
    this.indices.forEach(index => styleSheet.deleteRule(index));
  }
}
