import view from '../view';
import Enhancer from './Activity/Enhancer';
import Selections from './Activity/Selections';
import fireEvent from './Events';
import ActivityPicker from './ActivityPicker';

const addSelectionPickerToToolbar = (selectionPicker) => {
  document.querySelector('body').append(selectionPicker);
};

export default class Topic {
  constructor(title, spec, language) {
    this.language = language;
    this.title = spec;
    this.spec = spec;

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
    this.selections.onUpdate(newSelections => enhancer.update(newSelections));
  }

  show() {
    
  }

  hide() {
    
  }

  start() {
    const toolbar = document.getElementById('wertiview-toolbar');
    const enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
    const topicSelect = document.getElementById(`wertiview-toolbar-topic-menu-${this.language}`);

    const activityPicker = new ActivityPicker(this.spec.activities);

    this.onTopicReady(() => {
      enhanceButton.setAttribute('disabled', false);
    });

    toolbar.insertBefore(activityPicker.render(), enhanceButton);

    const topicView = this;
    activityPicker.onActivitySelected((activity) => {
      try {
        topicView.selectActivity(activity);
      } catch (e) {
        view.notification.add(e.message);
      }
    });

    enhanceButton.onclick = () => {
      try {
        topicView.runActivity();
      } catch (e) {
        view.notification.add(e.message);
      }
    };

    topicSelect.onchange = () => {
      activityPicker.destroy();
    };
  }
}
