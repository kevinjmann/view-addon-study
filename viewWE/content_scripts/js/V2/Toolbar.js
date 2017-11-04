import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';

import createStore from './Store';

const idPrefix = 'wertiview-toolbar';

// register with all topic & language selects. Returns an observable of the lang/topic state
export default (viewTopics) => {
  // FIXME this needs a refactor, as the code to retrieve the topic is somewhat
  // duplicated between the language event handler and the topic event handler.

  // Returns null if topic is not v2
  function getV2TopicConfiguration(topic, language) {
    if (topic && viewTopics[topic].version === 2) {
      return {
        topic,
        ...viewTopics[topic].languages[language],
      };
    };

    return null;
  }

  function getSelectedTopic(language) {
    const topicSelect = document.getElementById(`${idPrefix}-topic-menu-${language}`);
    const topicName = topicSelect ? topicSelect.value : null;
    if (topicName && topicName.indexOf('unselected') === 0) {
      return null;
    }
    return getV2TopicConfiguration(topicName, language);
  }

  const languageSelect = document.getElementById(`${idPrefix}-language-menu`);
  const language = Observable.fromEvent(languageSelect, 'change')
        .map(() => store => ({
          ...store,
          topic: getSelectedTopic(languageSelect.value),
          language: languageSelect.value
        }));

  const topics = [ 'de', 'en', 'ru' ].map(language => {
    const topicSelect = document.getElementById(`${idPrefix}-topic-menu-${language}`);
    return Observable.fromEvent(topicSelect, 'change')
      .map(() => ({ language, ...store }) => ({
        ...store,
        language,
        topic: getV2TopicConfiguration(topicSelect.value, language),
      }));
  });

  const configuration = createStore({ language: null, topic: null }, [language].concat(topics));
  return configuration.multicast(new Subject());
};
