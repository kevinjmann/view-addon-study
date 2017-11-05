import morph from 'nanomorph';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

function createNode(string, id) {
  const node = document.createElement('div');
  node.setAttribute('id', id);
  node.innerHTML = string;
  return node;
};

function getContentElement() {
  return document.getElementById('wertiview-content');
}

export default (server, topicConfiguration) => {
  const original = getContentElement().innerHTML;

  const status = new Subject();

  topicConfiguration
  // inject special value 'restore' if we're navigating away from V2
    .scan((previous, next) => {
      if (next.topic === null && previous.topic) {
        return 'restore';
      }
      return next;
    })
  // filter out everything that isn't restore or V2
    .filter(value => value === 'restore' || (!!value.topic))
  // Emit markup from server fetch request, or original if we're 'restore'ing
    .switchMap((value) => {
      if (value === 'restore') {
        status.next('restoring');
        return Observable.from([original]);
      }

      const { topic: { topic }, language } = value;
      status.next('fetching markup');
      return Observable.fromPromise(
        server.view({
          topic,
          language,
          activity: 'click',
          url: window.location.href,
          filter: 'no-filter',
          document: original,
        })
      ).catch(error => {
        status.next('error fetching markup, check console');
        console.log('error fetching markup', error);
        return Observable.from([null]);
      });
    })
  // Transform HTML document with to markup
    .subscribe((markup) => {
      if (markup) {
        status.next('replacing markup');
        morph(
          getContentElement(),
          createNode(markup, 'wertiview-content')
        );
        status.next('markup done');
      }
    });

  return status;
};
