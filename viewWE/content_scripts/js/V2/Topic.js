import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

import * as Action from './Actions';

export default class Topic {
  constructor(dispatch, topics, getMarkup) {
    this.showing = false;
    this.dispatch = dispatch;
    this.topics = topics;
    this.getMarkup = getMarkup;
  }

  selectTopic(language, topic) {
    if (this.showing && (language !== this.showing.language || topic !== this.showing.topic)) {
      this.hide();
    }

    if (this.topics[topic].version === 2
        && (!this.showing
            || this.showing.language !== language
            || this.showing.topic !== topic)) {
      const dispatch = this.dispatch;
      const spec = this.topics[topic].languages[language];
      const selections = new Selections(spec.selections);

      selections.onUpdate(
        newSelections => dispatch(Action.changeSelections(newSelections))
      );
      const activityPicker = new ActivityPicker(spec.activities);
      activityPicker.onActivitySelected(
        activity => dispatch(Action.selectActivity(activity))
      );
      const topicView = new TopicView(activityPicker, selections);

      this.showing = {
        selections,
        activityPicker,
        topicView,
        topic,
        language,
      };

      topicView.show();
      return this.getMarkup({ topic, language });
    }
    return null;
  }

  hide() {
    if (this.showing) {
      const { topic, language } = this;
      this.showing.topicView.hide();
      this.dispatch(Action.restoreMarkup(this.getMarkup({ topic, language })));
      this.showing = false;
    }
  }
}
