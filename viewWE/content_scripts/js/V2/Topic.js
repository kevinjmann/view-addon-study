import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import TopicView from './TopicView';

import * as Action from './Actions';

export default (store, topicConfiguration) => {
  const dispatch = store.dispatch;

  function startTopic({ title, activities, selections }, language) {
    const { activity, markup: { currently } } = store.getState();
    const activityPicker = new ActivityPicker(activities, activity);
    const selectionsWindow = new Selections(activityPicker, selections);

    activityPicker.onActivitySelected(
      activity => dispatch(Action.selectActivity(activity))
    );
    selectionsWindow.onUpdate(
      newSelections => dispatch(Action.changeSelections(newSelections))
    );
    selectionsWindow.onCloseButtonClick(
      () => dispatch(Action.hideSelections())
    );

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
