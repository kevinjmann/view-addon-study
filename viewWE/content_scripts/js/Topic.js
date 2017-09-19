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

  selectActivity(activity) {
    if (!this.spec[activity]) {
      view.notification.add(`The activity ${activity} is unavailable for ${this.spec.title}.`);
      return;
    }

    this.enhancer = new Enhancer(activity, this.spec[activity]);
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
