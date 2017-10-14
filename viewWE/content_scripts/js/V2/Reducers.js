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

const initialState = {
  configuration: {
    language: null,
    topic: null,
    actvitiy: 'click',
    url: null,
  },
  topics: {
    agreement
  },
  nodes: [],
  original: null,
  markup: null,
};

export const main = (state, action) => {
  if (typeof state === 'undefined') {
    return initialState;
  }

  return state;
};
