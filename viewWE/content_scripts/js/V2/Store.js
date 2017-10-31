import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';

export default (initialStore, observables) => {
  return Observable.merge(...observables).scan((state, k) => k(state), initialStore);
};
