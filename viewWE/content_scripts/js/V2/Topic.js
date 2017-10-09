import view from '../view';
import Enhancer from './Activity/Enhancer';
import Selections from './Activity/Selections';
import fireEvent from './Events';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';
import Markup from './Markup';

export default class Topic {
  constructor(topicName, spec, language, server) {
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
      activityPicker.getActivity(), selections.getSelections(),
    );

    this.topicView = new TopicView(activityPicker, selections, {
      onEnhance: () => { markup.apply(); enhancer.start(); },
      onSelectionsChange: ({ selections, activity }) => enhancer.update(activity, selections),
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
