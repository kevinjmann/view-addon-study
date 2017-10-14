import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

import * as Action from './Actions';

export default class Topic {
  constructor(dispatch, topics) {
    this.showing = false;
    this.dispatch = dispatch;
    this.topics = topics;
  }

  selectTopic(language, topic) {
    const dispatch = this.dispatch;

    if (this.showing && (language !== this.showing.language || topic !== this.showing.topic)) {
      this.showing.topicView.hide();
      this.showing = null;
      dispatch(Action.cancelOutstandingRequests());
      dispatch(Action.restoreMarkup());
    }

    if (!this.showing || this.showing.language !== language || this.showing.topic !== topic) {
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
      dispatch(Action.enhance(topic, language));
    }
  }

  hide() {
    if (this.showing) {
      this.showing.topicView.hide();
      this.showing = false;
    }
  }
}
