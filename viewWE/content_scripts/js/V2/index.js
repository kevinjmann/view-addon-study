import { createStore } from 'redux'
import v2Reducer from './Reducers';

import Browser from '../../../Browser';
import Toolbar from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';

const initialize = async chrome => {
  const store = createStore(v2Reducer);
  console.log(store.getState());

  const browser = new Browser(chrome);
  const toolbar = new Toolbar().start();
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);

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
