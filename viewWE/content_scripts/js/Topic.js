import view from './view';
import Enhancer from './activities/Enhancer';
import Selections from './activities/Selections';
import fireEvent from './Events';

const addSelectionPickerToToolbar = (selectionPicker) => {
  document.querySelector('body').append(selectionPicker);
};

export default class Topic {
  constructor(spec, language) {
    this.title = spec.title;
    this.spec = spec[language];
    this.readyHandlers = [];

    this.selections = new Selections(this.spec.selections);
    addSelectionPickerToToolbar(this.selections.render());

    this.enhancer = null;
  }

  selectActivity(activity) {
    if (!this.spec.activities[activity]) {
      throw new Error(`The activity ${activity} is unavailable for ${this.title}.`);
    }

    this.enhancer = new Enhancer(activity, this.spec[activity]);
    fireEvent(this.readyHandlers, this.enhancer);
  }

  onTopicReady(f) {
    this.readyHandlers.push(f);
  }

  runActivity() {
    if (this.enhancer === null) {
      throw new Error('Please select an enhancement type first.');
    }

    const enhancer = this.enhancer;
    enhancer.enhance(this.selections.getSelections());
    this.selections.onUpdate((newSelections) => enhancer.update(newSelections));
  }
}
