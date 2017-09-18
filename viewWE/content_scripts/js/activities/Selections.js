import fireEvent from '../Events';

const renderSelectionItem = (base, item, selectionIndex, itemIndex) => {
  const id = `selection-${selectionIndex}-${itemIndex}`;
  const checked = item.checked ? 'checked' : '';

  // title
  const label = document.createElement('label');
  label.innerHTML = `<label for="${id}">${item.title}<label>`;

  // input
  const input = document.createElement('input');
  input.innerHTML = `<input type="checkbox" id="${id} ${checked} />`;

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
  container.innerHTML = `<div class="selection-container"><h2>${selection.title}</h2></div>`;

  const selectionItems = selection.selectionItems.map(
    (selectionItem, index) => renderSelectionItem(base, selectionItem, selectionIndex, index)
  );
  container.append(selectionItems);

  return container;
};

const renderSelections = (base, selections) => {
  // container
  const container = document.createElement('div');
  container.innerHTML = `<div id="selections-container"><h1>Selections</h1></div>`;

  // add selections to container
  const selections = selections.map(
    (selection, index) => renderSelection(base, selection, index)
  );
  container.append(selections);

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

  getStatus() {
    return this.selections;
  }

  onUpdate() {
    const status = this.getStatus();
    fireEvent(this.onUpdateHandlers, status);
  }
}
