import { Observable } from 'rxjs/Observable';

function checkAnswer(enhancement) {
  return enhancement.getAttribute('data-view-selected') === "true"
    ? 'view-click-correct'
    : 'view-click-incorrect';
}

export default class Click {
  constructor() {
    this.allEnhancements = [];
    const addEnhancement = this.addEnhancement.bind(this);
    this.clickStream = Observable.fromEvent(document, 'click')
      .filter(event => event.target.tagName === 'VIEWENHANCEMENT')
      .map(event => event.target)
      .subscribe(enhancement => addEnhancement(enhancement));
  }

  addEnhancement(enhancement) {
    this.allEnhancements.push(enhancement);
    enhancement.classList.add(checkAnswer(enhancement));
  }

  enhance(node) {
    node.setAttribute('data-view-selected', true);
  }

  clear(node) {
    node.removeAttribute('data-view-selected');
  }

  destroy() {
    this.clickStream.unsubscribe();
    this.allEnhancements.forEach(
      enhancement => enhancement.classList.remove(
        'view-click-incorrect',
        'view-click-correct'
      )
    );
  }
}
