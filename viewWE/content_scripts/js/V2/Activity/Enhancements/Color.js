export default class Color {
  enhance(node) {
    node.classList.add('view-colorize-style');
  }

  clear(node) {
    node.classList.remove('view-colorize-style',);
  }
}
