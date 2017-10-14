import { createStore, applyMiddleware } from 'redux';
import logger from 'redux-logger';

import v2Reducer from './Reducers';
import Browser from '../../../Browser';
import Toolbar from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';
import * as Action from './Actions';

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
      console.log('selected v2 topic');
    }
  });

  Object.keys(view.topics).forEach((topicName) => {
    const topic = view.topics[topicName];
    if (topic.version && topic.version === 2) {
      Object.keys(topic.languages).forEach((language) => {
        const topicView = new Topic(topicName, topic.languages[language], language, server, store.dispatch);
        toolbar.onSelectTopic(data => topicView.selectTopic(data));
      });
    }
  });
};

export default initialize;
