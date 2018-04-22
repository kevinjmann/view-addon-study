import view from '../../../view.js';
const $ = require('jquery');


const createInput = () => {
  const input = document.createElement('input');
  input.classList.add('cloze-style-input');
  input.classList.add('view-input');
  input.setAttribute('type', 'text');
  return input;
};

export default class Cloze {
  constructor() {
    this.last = {};
  }

  enhance(node) {
    node.innerHTML = '';
    const input = createInput();
    node.append(input);
    const clearNode = () => this.clear(node);

    const lemma = node.getAttribute('data-lemma');
    if (typeof lemma === 'string') { // null and undefined aren't 'string'
      input.setAttribute('placeholder', lemma);
    }
    this.last['data-view-next'] = input;
    input['data-view-previous'] = this.last;
    this.last = input;
    node.classList.add('wide');

    input.onchange = () => {
      const correctAnswer = node.getAttribute('data-original-text');
      var isCorrect=false;
      var usedSolution=false;
      if (correctAnswer === input.value) {
        console.log('input', input);
        clearNode();
        node.classList.add('view-cloze-correct');
        const next = input['data-view-next'];
        const previous = input['data-view-previous'];
        if (next) {
          window.setTimeout(() => next.focus(), 500);
        }
        if (next && previous) {
          next['data-view-previous'] = previous;
          previous['data-view-next'] = next;
        }
        isCorrect=true;
        this.trackData(node, input.value, isCorrect, usedSolution);

      } else {
        input.classList.add('view-cloze-incorrect');
        this.trackData(node, input.value, isCorrect, usedSolution);
        
      }
    };
  }

  clear(node) {
    node.classList.remove('wide');
    node.innerHTML = '';
    node.textContent = node.getAttribute('data-original-text');
  }

  trackData(node, submission, isCorrect, usedSolution){
    if (view.userid) {
        return view.getToken().then(token => {
          const trackingData = {};
          const $EnhancementElement=$(node);
          trackingData["task-id"] = view.taskId;
          trackingData["token"] = token;
          trackingData["enhancement-id"] = $EnhancementElement.attr("id");
          trackingData["submission"] = submission;
          trackingData["sentence"] = view.tracker.extractRawSentenceWithMarkedElement($EnhancementElement);
          trackingData["is-correct"] = isCorrect;

          const capType = view.lib.detectCapitalization($EnhancementElement.data("original-text"));
          trackingData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
          trackingData["used-solution"] = usedSolution;

          trackingData["timestamp"] = view.timestamp;

          return trackingData;
        }).then(
          trackingData => view.tracker.requestToSendTrackingData(trackingData)
        );
      }

      return new Promise(resolve => resolve());
  }
}
