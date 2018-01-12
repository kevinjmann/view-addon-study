import morph from 'nanomorph';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/switchMap';

function createNode(string, id) {
  const node = document.createElement('div');
  node.setAttribute('id', id);
  node.innerHTML = string;
  return node;
};

function getContentElement() {
  return document.getElementById('wertiview-content');
}

/**
 * Take a command stream and fetch markup on commands to enhance V2 topics.
 * The resulting 'status' stream can be used to determine when the markup is
 * ready to be enhanced. (it will read 'markup done').
 */
export default (commands, server) => {
  const original = getContentElement().innerHTML;

  const status = new Subject();

  // transforms commands into markup. The result of switchMap is HTML
  commands.switchMap(({ command, configuration }) => {
    // restore on stop
      if (command === 'stop') {
        status.next('restoring');
        return Observable.from([original]);
      }

    // wait for markup from promise on server
      const { topic, language } = configuration;
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
        // Don't return any markup on error, leaving it unchanged
      ).catch(error => {
        status.next('error fetching markup, check console');
        console.error('error fetching markup', error);
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
