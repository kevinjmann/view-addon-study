import { Observable } from 'rxjs/Observable';

export default ({ markup, enhancer }) => {
  const statusDisplay = document.createElement('label');
  const enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
  const toolbar = document.getElementById('wertiview-toolbar');
  toolbar.insertBefore(statusDisplay, enhanceButton);
  const appStream = Observable.merge(markup, enhancer);
  appStream.subscribe(status => statusDisplay.textContent = status);
}
