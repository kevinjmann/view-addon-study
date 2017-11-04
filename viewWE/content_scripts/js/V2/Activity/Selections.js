import { Observable } from 'rxjs/Observable';

import { combineStore } from '../Store';
import render from './SelectionsView';
import { connectSelections, connectActivities } from './SelectionsModel';

function show(container, view) {
  const showButton = document.createElement('button');
  showButton.textContent = 'selections';

  const hideButton = document.createElement('button');
  hideButton.textContent = 'OK';

  function showSelections() {
    container.append(view);
    container.removeChild(showButton);
  }

  function hideSelections() {
    container.append(showButton);
    container.removeChild(view);
  }

  view.append(hideButton);
  container.append(showButton);

  return Observable.merge(
    Observable.fromEvent(showButton, 'click').map(() => showSelections),
    Observable.fromEvent(hideButton, 'click').map(() => hideSelections)
  ).startWith(showSelections);
}

export default (container, baseSelections, activitySelect) => {
  const view = render(activitySelect, baseSelections);
  show(container, view).subscribe(f => f());
  const activities = connectActivities(activitySelect);
  const selections = connectSelections(baseSelections, view);

  combineStore({ activity: activities, selections }).subscribe(console.log);

  return selections;
};
