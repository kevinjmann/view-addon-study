import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import createStore from './Store';
import selectionStream from './Activity/Selections';
import activityPicker from './ActivityPicker';
import TopicView from './TopicView';

export default (topicConfiguration, container) => {
  const configuration = new Subject();

  function startTopic({ title, activities, selections }, language) {
    const activitySelect = activityPicker(activities, 'color');
    const selections$ = selectionStream(container, selections, activitySelect);
    configuration.next(selections$);
    const topicView = new TopicView();
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

  return configuration;
};
