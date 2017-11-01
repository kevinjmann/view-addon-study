import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { Subject } from 'rxjs/Subject';

import v2Reducer from './Reducers';
import Browser from '../../../Browser';
import makeToolbarConfiguration from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';
import markup from './Markup';
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
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);

  const toolbarObservable = makeToolbarConfiguration(view.topics);
  const toolbarConfiguration = toolbarObservable.multicast(new Subject());

  const topicViewModel = new Topic(store, toolbarConfiguration);
  markup(server, toolbarConfiguration);

  const enhancer = new Enhancer(store.dispatch);
  store.subscribe(() => {
    const { markup, topic, activity, selections } = store.getState();
    enhancer.update(markup.currently, topic.isV2Topic, topic.name, activity, selections);
  });

  toolbarConfiguration.connect(); // TODO unsubscribe on Toolbar closing
};

export default initialize;
