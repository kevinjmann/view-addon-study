import Browser from '../../../Browser';
import makeToolbarConfiguration from './Toolbar';
import ViewServer from '../../../ViewServer';
import subscribeTopic from './Topic';
import view from '../view';
import subscribeMarkup from './Markup';
import subscribeEnhancer from './Activity/Enhancer';
import subscribeStatus from './Status';
import subscribeSelections from './Activity/Selections';
import { Subject } from 'rxjs/Subject';
import control from './Control';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';

const initialize = async chrome => {
  const browser = new Browser(chrome);
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);
  const toolbar = document.getElementById('wertiview-toolbar');

  const commands = control(view.topics);

  const update = subscribeTopic(commands, toolbar);
  const status = subscribeMarkup(commands, server);
  const selections = subscribeSelections(commands, toolbar);
  selections.subscribe(console.log.bind(null, 'selections'));

  // const enhancer = subscribeEnhancer(selections.concatAll(), status);
  // const statusDisplay = subscribeStatus({ status, enhancer: Observable.empty() , update });
};

export default initialize;
