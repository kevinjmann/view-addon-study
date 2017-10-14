import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import v2Reducer from './Reducers';
import Browser from '../../../Browser';
import Toolbar from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';
import Markup from './Markup';
import * as Action from './Actions';
import Selections from './Activity/Selections';
import ActivityPicker from './ActivityPicker';
import Enhancer from './Activity/Enhancer';
import TopicView from './TopicView';

const initialize = async chrome => {
  const store = createStore(
    v2Reducer,
    applyMiddleware(logger),
  );
  console.log(store.getState());

  const browser = new Browser(chrome);
  const toolbar = new Toolbar().start();
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);
  toolbar.onSelectTopic(data => store.dispatch(Action.selectTopic(data)));
  toolbar.onSelectLanguage(data => store.dispatch(Action.selectLanguage(data)));

  store.subscribe(state => {
    const { language, topic } = store.getState();
    if (topic && view.topics[topic].version === 2) {
      const spec = view.topics[topic].languages[language];
      const markup = new Markup(server, {
        language,
        topic,
        activity: 'click',
        url: window.location.href,
      });

      const selections = new Selections(spec.selections);
      selections.onUpdate(
        newSelections => store.dispatch(Action.changeSelections(newSelections))
      );

      const activityPicker = new ActivityPicker(spec.activities);
      activityPicker.onActivitySelected(
        activity => store.dispatch(Action.selectActivity(activity))
      );

      const topicView = new TopicView(activityPicker, selections);
      topicView.show();

      const enhancer = new Enhancer(
        topic, activityPicker.getActivity()
      );
    }
  });

  Object.keys(view.topics).forEach((topicName) => {
    const topic = view.topics[topicName];
    if (topic.version && topic.version === 2) {
      Object.keys(topic.languages).forEach((language) => {
        const topicView = new Topic(topicName, topic.languages[language], language, server, store.dispatch);
      });
    }
  });
};

export default initialize;
