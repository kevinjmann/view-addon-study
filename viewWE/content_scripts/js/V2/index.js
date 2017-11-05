import Browser from '../../../Browser';
import makeToolbarConfiguration from './Toolbar';
import ViewServer from '../../../ViewServer';
import subscribeTopicInterface from './Topic';
import view from '../view';
import subscribeMarkup from './Markup';
import subscribeEnhancer from './Activity/Enhancer';
import statusObservable from './Status';
import { Subject } from 'rxjs/Subject';

const initialize = async chrome => {
  const browser = new Browser(chrome);
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);
  const toolbarConfiguration = makeToolbarConfiguration(view.topics);

  const toolbar = document.getElementById('wertiview-toolbar');

  const markup = subscribeMarkup(server, toolbarConfiguration);
  const selections = subscribeTopicInterface(toolbarConfiguration, toolbar);
  const enhancer = subscribeEnhancer(selections.concatAll(), markup);
  const statusDisplay = statusObservable({ markup, enhancer });

  toolbarConfiguration.connect(); // TODO unsubscribe on Toolbar closing
};

export default initialize;
