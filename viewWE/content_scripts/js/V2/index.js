import Browser from '../../../Browser';
import Toolbar from './Toolbar';
import ViewServer from '../../../ViewServer';
import Topic from './Topic';
import view from '../view';

const initialize = async chrome => {
  const browser = new Browser(chrome);
  const toolbar = new Toolbar().start();
  const { serverURL } = await browser.storage.local.get('serverURL');
  const server = new ViewServer(serverURL);

  Object.keys(view.topics).forEach((topicName) => {
    const topic = view.topics[topicName];
    if (topic.version && topic.version === 2) {
      Object.keys(topic.languages).forEach((language) => {
        const topicView = new Topic(topicName, topic.languages[language], language, server);
        toolbar.onSelectTopic(data => topicView.selectTopic(data));
      });
    }
  });
};

export default initialize;
