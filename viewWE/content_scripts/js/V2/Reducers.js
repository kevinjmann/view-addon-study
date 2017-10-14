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

import agreement from '../../../topics/agreement.json';
import * as Action from './Actions';

const initialState = {
  language: null,
  topic: null,
  actvitiy: null,
  url: null,
  topics: {
    agreement
  },
  nodes: [],
  original: null,
  markup: null,
};

export const main = (state = initialState, action) => {
  switch (action.type) {
    case Action.SELECT_LANGUAGE:
      return { ...state, language: action.language };
    case Action.SELECT_TOPIC:
      return { ...state, topic: action.topic };
    case Action.SELECT_ACTIVITY:
      return { ...state, activity: action.activity };
    default:
      return state;
    }
};
