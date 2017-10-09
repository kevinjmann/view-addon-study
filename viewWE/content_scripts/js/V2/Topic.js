import view from '../view';
import Enhancer from './Activity/Enhancer';
import Selections from './Activity/Selections';
import fireEvent from './Events';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

export default class Topic {
  constructor(topicName, spec, language) {
    this.topicName = topicName;
    this.language = language;

    this.readyHandlers = [];
    const selections = new Selections(spec.selections);
    const activityPicker = new ActivityPicker(spec.activities);
    this.topicView = new TopicView(activityPicker, selections, {
      onEnhance: () => console.log('enhancing'),
      onSelectionsChange: ({ selections, activity }) => console.log(selections, activity),
    });
  }

  onTopicReady(f) {
    this.readyHandlers.push(f);
  }

  selectTopic({ language, topic }) {
    if (this.topicName === topic && this.language === language) {
      this.topicView.show();
      fireEvent(this.readyHandlers, { language, topic });
    } else {
      this.topicView.hide();
    }
  }
}
