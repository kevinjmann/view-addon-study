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
  constructor(activities) {
    this.listeners = [];
    this.activities = activities;
    this.activityPicker = null;
  }

  onActivitySelected(f) {
    this.listeners.push(f);
  }

  render() {
    // render options and register fireEvent on this.listeners for onchange
    const select = renderSelect(getActivityList(this.activities));
    const listeners = this.listeners;
    select.onchange = () => {
      fireEvent(listeners, select.value);
    };

    // remove old activity selector
    document.querySelector('#wertiview-toolbar-activity-menu').classList.add('hidden');
    this.activityPicker = select;
    return select;
  }

  // reinstate old activity selector
  destroy() {
    console.log('destroying');
    if (this.activityPicker) {
      this.activityPicker.parentNode.removeChild(this.activityPicker);
    }
    document.querySelector('#wertiview-toolbar-activity-menu').classList.remove('hidden');
    this.listeners = [];
  }
}
