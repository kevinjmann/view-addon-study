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
import Enhancer from './Activity/Enhancer';

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

  const topicViewModel = new Topic(store.dispatch, view.topics);
  store.subscribe(() => {
    const { language, topic } = store.getState();
    if (topic && view.topics[topic].version === 2) {
      topicViewModel.selectTopic(language, topic);
    } else {
      topicViewModel.hide();
    }
  });
};

export default initialize;
