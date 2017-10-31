import { Observable } from 'rxjs';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import createStore from './Store';

const idPrefix = 'wertiview-toolbar';

// register with all topic & language selects. Returns an observable of the lang/topic state
export default (viewTopics) => {

  // Returns null if topic is not v2
  function getV2TopicConfiguration(topic, language) {
    if (viewTopics[topic].version === 2) {
      return {
        title: viewTopics[topic].title,
        ...viewTopics[topic].languages[language],
      };
    };

    return null;
  }

  const languageSelect = document.getElementById(`${idPrefix}-language-menu`);
  const language = Observable.fromEvent(languageSelect, 'change')
        .map(() => store => ({ ...store, topic: null, language: languageSelect.value }));

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
  configuration.subscribe(store => console.log(store));

  return configuration;
};
