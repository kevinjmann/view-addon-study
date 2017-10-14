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
    languageSelect.addEventListener('change', () => {
      fireEvent(handlers.onSelectLanguage, languageSelect.value);
    });

    [ 'de', 'en', 'ru' ].forEach(language => {
      const topicSelect = document.getElementById(`${idPrefix}-topic-menu-${language}`);
      topicSelect.addEventListener('change', () => {
        fireEvent(handlers.onSelectTopic, topicSelect.value);
      });
    });

    return this;
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
}
