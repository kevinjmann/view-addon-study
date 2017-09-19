import view from '../view';
import Enhancer from './Enhancer';
import Selections from './Selections';
import fireEvent from './Events';

const addSelectionPickerToToolbar = (selectionPicker) => {
  const enhance = document.querySelector('#wertiview-toolbar-enhance-button');
  const toolbar = document.querySelector('#wertiview-toolbar');
  toolbar.insertBefore(selectionPicker, enhance);
};

export default class Topic {
  constructor(spec, language) {
    this.spec = spec[language];
    this.readyHandlers = [];

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
    fireEvent(this.readyHandlers, this.enhancer);
  }

  onTopicReady(f) {
    this.readyHandlers.push(f);
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
