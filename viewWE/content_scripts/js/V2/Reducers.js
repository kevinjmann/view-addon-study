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

const activity = (state = 'color', action) => {
  if (action.type === Action.SELECT_ACTIVITY) {
    return action.activity;
  }

  return state;
};

const topic = (state = null, action) => {
  if (action.type === Action.SELECT_TOPIC) {
    return action.topic;
  }

  return state;
};

const language = (state = null, action) => {
  if (action.type === Action.SELECT_LANGUAGE) {
    return action.language;
  }

  return state;
};

const initialSelection = toConstraints(agreement.languages.de.selections);
const selections = (state = initialSelection, action) => {
  if (action.type === Action.CHANGE_SELECTIONS) {
    return { ...toConstraints(action.selections) };
  }
  return state;
};

export default combineReducers({
  selections,
  activity,
  topic,
  language,
});
