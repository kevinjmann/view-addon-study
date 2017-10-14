const createInput = () => {
  const input = document.createElement('input');
  input.classList.add('cloze-style-input');
  input.classList.add('view-input');
  input.setAttribute('type', 'text');
  return input;
};

export default class Cloze {
  enhance(node) {
    node.innerHTML = '';
    const input = createInput();
    node.append(input);
    const clearNode = () => this.clear(node);
    input.onchange = () => {
      const correctAnswer = node.getAttribute('data-original-text');
      if (correctAnswer === input.value) {
        clearNode();
        node.classList.add('view-cloze-correct');
      } else {
        input.classList.add('view-cloze-incorrect');
      }
    };
  }

  clear(node) {
    node.innerHTML = '';
    node.textContent = node.getAttribute('data-original-text');
  }
}
