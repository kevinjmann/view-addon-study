import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

export default (topicConfiguration) => {
  function startTopic({ title, activities, selections }, language) {
    const activityPicker = new ActivityPicker(activities, 'color');
    const selectionsWindow = new Selections(activityPicker, selections);
    const topicView = new TopicView(selectionsWindow);

    return topicView;
  };

  topicConfiguration
    .map(({ topic, language }) => {
      return (topic !== null) ? startTopic(topic, language) : null;
    })
    .scan((oldView, newView) => {
      oldView && oldView.hide();
      newView && newView.show();
      return newView;
    }, null)
    .subscribe();
};
