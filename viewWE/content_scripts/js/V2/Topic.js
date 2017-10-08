import view from '../view';
import Enhancer from './Activity/Enhancer';
import Selections from './Activity/Selections';
import fireEvent from './Events';
import ActivityPicker from './ActivityPicker';

export default class Topic {
  constructor(topicName, title, spec, language) {
    this.topicName = topicName;
    this.language = language;
    this.title = spec;
    this.spec = spec;

    this.readyHandlers = [];
    this.selections = new Selections(this.spec.selections);

    this.enhancer = null;

    this.toolbar = document.getElementById('wertiview-toolbar');
    this.enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
    this.activityMenu = document.querySelector('#wertiview-toolbar-activity-menu');
    this.activityPicker = new ActivityPicker(this.spec.activities);
    this.activitySelect = this.activityPicker.render();
    this.selectionsWindow = this.selections.render();
    this.isShown = false;

    this.activityPicker.onActivitySelected((activity) => {
      try {
        this.selectActivity(activity);
      } catch (e) {
        view.notification.add(e.message);
      }
    });
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

  selectTopic({ language, topic }) {
    if (this.topicName === topic && this.language === language) {
      this.show();
    } else if (this.isShown) {
      this.hide();
    }
  }

  show() {
    this.isShown = true;
    this.toolbar.insertBefore(this.activitySelect, this.enhanceButton);
    this.activityMenu.classList.add('hidden');
    document.querySelector('body').append(this.selectionsWindow);
  }

  hide() {
    this.activitySelect.parentNode.removeChild(this.activitySelect);
    this.selectionsWindow.parentNode.removeChild(this.selectionsWindow);
    this.activityMenu.classList.remove('hidden');
  }
}
