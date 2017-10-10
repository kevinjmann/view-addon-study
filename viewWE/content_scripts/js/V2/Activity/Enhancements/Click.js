export default class Click {
  enhance(node) {
    node.classList.add('colorize-style-agreement');
  }

  clear(node) {
    node.classList.remove('colorize-style-agreement');
  }
}
