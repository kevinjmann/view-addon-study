export default class TopicView {
  constructor(selections) {
    this.shown = false;

    this.toolbar = document.getElementById('wertiview-toolbar');
    this.enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
    this.activityMenu = document.querySelector('#wertiview-toolbar-activity-menu');
    this.selectionsWindow = selections.render();
    this.indicator = document.createElement('label');
  }

  show() {
    this.shown = true;
    this.activityMenu.classList.add('hidden');
    this.enhanceButton.classList.add('hidden');

    this.toolbar.insertBefore(this.indicator, this.enhanceButton);
    this.toolbar.append(this.selectionsWindow);
  }

  hide() {
    if (this.shown) {
      this.activityMenu.classList.remove('hidden');
      this.enhanceButton.classList.remove('hidden');

      this.selectionsWindow.parentNode.removeChild(this.selectionsWindow);
      this.indicator.parentNode.removeChild(this.indicator);
    }
    this.shown = false;
  }

  update(currently) {
    this.indicator.textContent = currently;
  }
}
