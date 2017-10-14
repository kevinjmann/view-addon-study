/**
 * From the Redux documentation:
 *
 * It's very important that the reducer stays pure. Things you should *never* do inside a reducer:
 *
 * - Mutate its arguments;
 * - Perform side effects like API calls and routing transitions;
 * - Call non-pure functions, e.g. Date.now() or Math.random().
 *
 * Please keep to these rules *without exception*.
 */

import { combineReducers } from 'redux';
import agreement from '../../../topics/agreement.json';
import * as Action from './Actions';
import toConstraints from './Activity/SelectionsToConstraints';

const initialState = {
  language: null,
  topic: null,
  actvitiy: null,
  url: null,
  nodes: [],
  original: null,
  markup: null,
};

const initialSelection = toConstraints(agreement.languages.de.selections);
const selections = (state = initialSelection, action) => {
  console.log('selections', state, action);
  switch (action.type) {
    case Action.CHANGE_SELECTIONS:
      return { ...toConstraints(action.selections) };
    default:
      return state;
  }
};

export default combineReducers({
  selections,
});
