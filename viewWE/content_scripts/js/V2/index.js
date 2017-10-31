import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

import v2Reducer from './Reducers';
import Browser from '../../../Browser';
import makeToolbarConfiguration from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';
import Markup from './Markup';
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

  const browser = new Browser(chrome);
  const toolbarConfiguration = makeToolbarConfiguration(view.topics);
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);

  const getMarkup = ({ topic, language }) => new Markup(server, {
    language,
    topic,
    activity: 'click',
    url: window.location.href,
  });

  const topicViewModel = new Topic(
    store,
    toolbarConfiguration
  );

  const enhancer = new Enhancer(store.dispatch);
  store.subscribe(() => {
    const { markup, topic, activity, selections } = store.getState();
    enhancer.update(markup.currently, topic.isV2Topic, topic.name, activity, selections);
  });
};

export default initialize;

// this.dispatch(Action.restoreMarkup(this.getMarkup({ topic, language })));
// return getMarkup({ title, language });
