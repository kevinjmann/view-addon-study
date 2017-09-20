import fireEvent from './Events';

const getActivityList = function(activities) {
  const options = [];

  Object.keys(activities).map((activityKey) => {
    options.push({
      value: activityKey,
      title: activities[activityKey].instruction.title
    });
  });

  return options;
};

const renderOption = ({ title, value }) => {
  const option = document.createElement('option');
  option.setAttribute('value', value);
  option.textContent = title;
  return option;
};

const renderSelect = (activityList) => {
  const selectElement = document.createElement('select');
  selectElement.setAttribute('id', 'activityV2-picker');
  selectElement.classList.add('wertiview-toolbar-menu');

  activityList.map(activity => {
    const option = renderOption(activity);
    selectElement.append(option);
  });

  return selectElement;
};

export default class ActivityPicker {
  construct(activities) {
    this.listeners = [];
    this.activities = activities;
    this.oldSelector = document.querySelector('#wertiview-toolbar-activity-menu');
  }

  onActivitySelected(f) {
    this.listeners.push(f);
  }

  render() {
    // render options and register fireEvent on this.listeners for onchange
    const select = renderSelect(getActivityList(this.activities));

    // remove old activity selector
    this.oldSelector.classList.add('hidden');
  }

  // reinstate old activity selector
  destroy() {
    document.querySelector('activityV2-picker').remove();
    this.listeners = [];
    this.oldSelector.classList.remove('hidden');
  }
}
