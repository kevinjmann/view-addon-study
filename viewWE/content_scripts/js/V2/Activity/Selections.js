import fireEvent from '../Events';

const renderSelectionItem = (base, item, selectionIndex, itemIndex) => {
  const id = `selection-${selectionIndex}-${itemIndex}`;
  const checked = item.checked ? 'checked' : '';

  // title
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = item.title;

  // input
  const input = document.createElement('input');
  input.setAttribute('type', 'checkbox');
  input.setAttribute('id', id);
  if (checked) {
    input.setAttribute('checked', true);
  }

  // event, use base.selections
  input.onchange = () => {
    base.selections[selectionIndex]['selectionItems'][itemIndex]['checked'] = input.checked;
  };
  label.prepend(input);

  return label;
};

const renderSelection = (base, selection, selectionIndex) => {
  // container for items
  const container = document.createElement('div');
  container.classList.add('selectionContainer');
  container.innerHTML = `<h2>${selection.title}</h2>`;

  const selectionItems = selection.selectionItems.map(
    (selectionItem, index) => renderSelectionItem(base, selectionItem, selectionIndex, index)
  );
  selectionItems.map(selectionItem => container.append(selectionItem));

  return container;
};

const renderSelections = (base, selections) => {
  // container
  const container = document.createElement('div');
  container.setAttribute('id', 'selections-container');
  container.innerHTML = `<h1>Selections</h1>`;

  // add selections to container
  const renderedSelections = selections.map(
    (selection, index) => renderSelection(base, selection, index)
  );
  renderedSelections.map(renderedSelection => container.append(renderedSelection));

  return container;
};

export default class Selections {
  constructor(baseSelections) {
    this.selections = baseSelections;
    this.onUpdateHandlers = [];
  }

  render() {
    return renderSelections(this, this.selections);
  }

  getSelections() {
    return this.selections;
  }

  onUpdate() {
    const status = this.getSelections();
    fireEvent(this.onUpdateHandlers, status);
  }
}
