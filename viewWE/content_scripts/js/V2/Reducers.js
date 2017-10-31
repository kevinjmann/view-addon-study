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

const activity = (state = 'color', action) => {
  if (action.type === Action.SELECT_ACTIVITY) {
    return action.activity;
  }

  return state;
};

const topic = (state = { name: null, isV2Topic: false }, action) => {
  if (action.type === Action.SELECT_TOPIC) {
    return { name: action.topic, isV2Topic: action.isV2Topic };
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

const initialMarkupState = {
  currently: 'idle',
  enhanced: null,
  original: null,
  ready: false,
};

const markup = (state = {}, action) => {
  switch (action.type) {
  case (Action.REQUEST_MARKUP):
    console.log('request markup');
    return {
      ...state,
      currently: 'fetching',
      original: action.original,
    };
  case(Action.RECEIVE_MARKUP):
    if (state.currently === 'fetching') {
      return {
        ...state,
        currently: 'received markup',
        ready: true,
        enhanced: action.markup,
      };
    } else {
      return state;
    }
  case(Action.REQUEST_MARKUP_FAILED):
    return {
      ...initialMarkupState,
      currently: 'failed to receive markup',
      ready: false
    };
  case(Action.DESTROY_MARKUP):
    return {
      ...state,
      currently: 'destroying',
    };
  case(Action.ENHANCING):
    return {
      ...state,
      currently: 'enhancing',
    };
  case(Action.RESET):
    return initialMarkupState;
  case(Action.READY_FOR_ENHANCEMENT):
    return {
      ...state,
      currently: 'ready for enhancement',
    };
  case(Action.ENHANCEMENT_READY):
    return {
      ...state,
      currently: 'ready',
    };
  default:
    return state;
  }
};

export default combineReducers({
  selections,
  activity,
  topic,
  language,
  markup,
});
