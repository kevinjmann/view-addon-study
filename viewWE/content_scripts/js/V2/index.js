import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

import v2Reducer from './Reducers';
import Browser from '../../../Browser';
import Toolbar from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';
import Markup from './Markup';
import MarkupUpdater from './MarkupUpdater';
import * as Action from './Actions';
import Enhancer from './Activity/Enhancer';

const initialize = async chrome => {
  const store = createStore(
    v2Reducer,
    applyMiddleware(
      thunkMiddleware,
      logger
    ),
  );
  console.log(store.getState());

  const browser = new Browser(chrome);
  const toolbar = new Toolbar().start();
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);

  const getMarkup = ({ topic, language }) => new Markup(server, {
    language,
    topic,
    activity: 'click',
    url: window.location.href,
  });

  const updater = new MarkupUpdater();
  const topicViewModel = new Topic(store.dispatch, view.topics, getMarkup);
  toolbar.onSelectTopic(data => store.dispatch(Action.selectTopic(topicViewModel)(data)));
  toolbar.onSelectLanguage(data => store.dispatch(Action.selectLanguage(data)));
};

export default initialize;
