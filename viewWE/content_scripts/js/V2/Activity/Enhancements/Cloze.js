const createInput = () => {
  const input = document.createElement('input');
  input.classList.add('cloze-style-input');
  input.classList.add('view-input');
  input.setAttribute('type', 'text');
  return input;
};

export default class Cloze {
  constructor() {
    this.last = { setAttribute: () => undefined };
  }

  enhance(node) {
    node.innerHTML = '';
    const input = createInput();
    node.append(input);
    const clearNode = () => this.clear(node);

    input.setAttribute('placeholder', node.getAttribute('data-lemma'));
    this.last.setAttribute('data-view-next', input);
    input.setAttribute('data-view-previous', this.last);
    this.last = node;
    node.classList.add('wide');

    input.onchange = () => {
      const correctAnswer = node.getAttribute('data-original-text');
      if (correctAnswer === input.value) {
        clearNode();
        node.classList.add('view-cloze-correct');
        const next = input.getAttribute('data-view-next');
        const previous = input.getAttribute('data-view-previous');
        if (next) {
          window.setTimeout(() => next.focus(), 500);
        }
        if (next && previous) {
          next.setAttribute('data-view-previous', previous);
          previous.setAttribute('data-view-next', next);
        }
      } else {
        input.classList.add('view-cloze-incorrect');
      }
    };
  }

  clear(node) {
    node.classList.remove('wide');
    node.innerHTML = '';
    node.textContent = node.getAttribute('data-original-text');
  }
}
