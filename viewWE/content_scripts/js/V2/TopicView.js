export default class TopicView {
  constructor(activityPicker, selections, { onEnhance, onSelectionsChange }) {
    this.activityPicker = activityPicker;
    this.shown = false;

    this.toolbar = document.getElementById('wertiview-toolbar');
    this.enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
    this.activityMenu = document.querySelector('#wertiview-toolbar-activity-menu');
    this.activitySelect = this.activityPicker.render();
    this.selectionsWindow = selections.render();

    this.v2EnhanceButton = document.createElement('button');
    this.v2EnhanceButton.classList.add('wertiview-toolbar-btn');
    this.v2EnhanceButton.addEventListener('click', () => onEnhance());
    this.v2EnhanceButton.textContent = 'Enhance';

    selections.onUpdate(selections => onSelectionsChange({
      selections,
      activity: activityPicker.getActivity(),
    }));

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
