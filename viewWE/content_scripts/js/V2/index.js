import Browser from '../../../Browser';
import makeToolbarConfiguration from './Toolbar';
import ViewServer from '../../../ViewServer';
import subscribeTopicInterface from './Topic';
import view from '../view';
import subscribeMarkup from './Markup';
import subscribeEnhancer from './Activity/Enhancer';
import statusObservable from './Status';
import { Subject } from 'rxjs/Subject';
import control from './Control';

const initialize = async chrome => {
  const browser = new Browser(chrome);
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);
  const commands = control(view.topics);

  const toolbar = document.getElementById('wertiview-toolbar');

  const markup = subscribeMarkup(commands, server);
  const selections = subscribeTopicInterface(commands, toolbar);
  const enhancer = subscribeEnhancer(selections.concatAll(), markup);

  const statusDisplay = statusObservable({ markup, enhancer });
};

export default initialize;
