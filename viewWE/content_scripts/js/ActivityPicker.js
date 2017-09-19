import fireEvent from './Events';

export default class ActivityPicker {
  construct(activities) {
    this.listeners = [];
    this.activities = activities;
  }

  onActivitySelected(f) {
    this.listeners.push(f);
  }

  render() {
    // render options and register fireEvent on this.listeners for onchange
    // remove old activity selector
  }
}
