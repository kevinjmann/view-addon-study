export default class TopicView {
  constructor(activityPicker, selections, { onSelectionsChange }) {
    this.activityPicker = activityPicker;
    this.shown = false;

    this.toolbar = document.getElementById('wertiview-toolbar');
    this.enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
    this.activityMenu = document.querySelector('#wertiview-toolbar-activity-menu');
    this.activitySelect = this.activityPicker.render();
    this.selectionsWindow = selections.render();

    activityPicker.onActivitySelected(activity => onSelectionsChange({
      selections: selections.getSelections(),
      activity,
    }));
  }

  show() {
    this.shown = true;
    this.activityMenu.classList.add('hidden');
    this.enhanceButton.classList.add('hidden');

    this.toolbar.insertBefore(this.activitySelect, this.enhanceButton);
    this.toolbar.insertBefore(this.v2EnhanceButton, this.enhanceButton);
    this.toolbar.append(this.selectionsWindow);
  }

  hide() {
    if (this.shown) {
      this.activityMenu.classList.remove('hidden');
      this.enhanceButton.classList.remove('hidden');

      this.activitySelect.parentNode.removeChild(this.activitySelect);
      this.selectionsWindow.parentNode.removeChild(this.selectionsWindow);
      this.v2EnhanceButton.parentNode.removeChild(this.v2EnhanceButton);
    }
    this.shown = false;
  }
}
