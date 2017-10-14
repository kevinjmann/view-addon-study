import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

import * as Action from './Actions';

export default class Topic {
  constructor(store, topics, getMarkup) {
    this.showing = false;
    this.dispatch = store.dispatch;
    this.store = store;
    this.topics = topics;
    this.getMarkup = getMarkup;
  }

  isV2Topic(topic) {
    return this.topics[topic].version === 2;
  }

  selectTopic(language, topic) {
    if (this.showing && (language !== this.showing.language || topic !== this.showing.topic)) {
      this.hide();
    }

    if (this.isV2Topic(topic)
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
      const getState = this.store.getState;
      this.store.subscribe(() => {
        const { isFetching, enhanced } = this.store.getState().markup;
        topicView.update(isFetching, !!enhanced);
      });

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
