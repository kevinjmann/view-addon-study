import view from '../view';
import Enhancer from './Enhancer';
import Selections from './Selections';

const addSelectionPickerToToolbar = (selectionPicker) => {
  const enhance = document.querySelector('#wertiview-toolbar-enhance-button');
  const toolbar = document.querySelector('#wertiview-toolbar');
  toolbar.insertBefore(selectionPicker, enhance);
};

export default class Topic {
  constructor(spec, language) {
    this.spec = spec[language];

    this.selections = new Selections(this.spec.selections);
    addSelectionPickerToToolbar(this.selections.render());

    this.enhancer = null;
  }

  selectEnhancement(enhancement) {
    if (!this.spec[enhancement]) {
      view.notification.add(`The enhancement ${enhancement} is unavailable for ${this.spec.title}.`);
      return;
    }

    this.enhancer = new Enhancer(enhancement, this.spec[enhancement]);
  }

  runActivity() {
    if (this.enhancer === null) {
      view.notification.add('Please select an enhancement type first.');
      return;
    }

    const enhancer = this.enhancer;
    enhancer.enhance(this.selections.getSelections());
    this.selections.onUpdate((newSelections) => enhancer.update(newSelections));
  }
}
