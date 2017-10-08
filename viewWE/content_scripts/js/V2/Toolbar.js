import fireEvent from './Events';

const idPrefix = 'wertiview-toolbar';

export default class Toolbar {

  constructor() {
    this.handlers = {
      onSelectLanguage: [],
      onSelectTopic: [],
      onEnhance: [],
      onReadyToEnhance: [],
    };
  }

  start() {
    const handlers = this.handlers;

    // register with all topic & language selects;
    const languageSelect = document.getElementById(`${idPrefix}-language-menu`);
    languageSelect.onchange = () => {
      fireEvent(handlers.onSelectLanguage, languageSelect.value);
    };

    [ 'de', 'en', 'ru' ].forEach(language => {
      const topicSelect = document.getElementById(`${idPrefix}-topic-menu-${language}`);
      topicSelect.onchange = () => {
        fireEvent(handlers.onSelectTopic, { language, topic: topicSelect.value });
      };
    });
  }

  onSelectLanguage(f) {
    this.handlers.onSelectLanguage.push(f);
  }

  onSelectTopic(f) {
    this.handlers.onSelectTopic.push(f);
  }

  onEnhance(f) {
    this.handlers.onEnhance.push(f);
  }

  onReadyToEnhance(f) {
    this.handlers.onReadyToEnhance.push(f);
  }

  readyToEnhance() {
    // fire readyToEnhance
    // enable enhance button
  }

  disallowEnhancement() {
    // disable enhance button
  }
}
