import { Observable } from 'rxjs/Observable';

export default ({ markup, enhancer }) => {
  const statusDisplay = document.createElement('label');
  const enhanceButton = document.getElementById('wertiview-toolbar-enhance-button');
  const toolbar = document.getElementById('wertiview-toolbar');
  toolbar.insertBefore(statusDisplay, enhanceButton);
  Observable.merge(markup, enhancer).subscribe(status => {
    console.log('status', status);
    statusDisplay.textContent = status;
  });
}
