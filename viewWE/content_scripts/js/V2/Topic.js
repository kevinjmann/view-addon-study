import view from '../view';
import Enhancer from './Activity/Enhancer';
import Selections from './Activity/Selections';
import fireEvent from './Events';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';
import Markup from './Markup';

import * as Action from './Actions';

export default class Topic {
  constructor(topicName, spec, language, server, store) {
    this.topicName = topicName;
    this.language = language;

    const markup = new Markup(server, {
      language,
      topic: topicName,
      activity: "click",
      url: window.location.href,
    });
    this.markup = markup;

    const selections = new Selections(spec.selections);
    const activityPicker = new ActivityPicker(spec.activities);
    const enhancer = new Enhancer(
      this.topicName, activityPicker.getActivity()
    );

    selections.onUpdate(
      newSelections => store.dispatch(Action.changeSelections(newSelections))
    );

    this.topicView = new TopicView(activityPicker, selections, {
    });
  }

  selectTopic({ language, topic }) {
    if (this.topicName === topic && this.language === language) {
      this.topicView.show();
      this.markup.fetchMarkup();
    } else {
      this.topicView.hide();
      this.markup.restore();
    }
  }
}
