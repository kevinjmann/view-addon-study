import fireEvent from '../Events';

const renderSelectionItem = (base, item, selectionIndex, itemIndex) => {
  const id = `selection-${selectionIndex}-${itemIndex}`;
  const checked = item.checked ? 'checked' : '';

  // title
  const labelHtml = `<label for="${id}">${item.title}<label>`;
  const label = document.createElement('label');
  label.innerHTML = labelHtml;

  // input
  const inputHtml = `<input type="checkbox" id="${id} ${checked} />`;
  const input = document.createElement('input');
  input.innerHTML = inputHtml;

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
  container.classList.add('selection-container');

  // title
  const title = document.createElement('h2');
  title.textContent = selection.title;
  container.append(title);

  const selectionItems = selection.selectionItems.map(
    (selectionItem, index) => renderSelectionItem(base, selectionItem, selectionIndex, index)
  );

  // add to container
  container.append(selectionItems);

  return container;
};

const renderSelections = (base, selections) => {
  console.log('rendering', base, selections);
  // container
  const container = document.createElement('div');
  container.id = 'selections-container';

  const heading = document.createElement('h1');
  heading.textContent = 'Selections';
  container.append(heading);

  // add selections to container
  const selections = selections.map((selection, index) => renderSelection(base, selection, index));
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
