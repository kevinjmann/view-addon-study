// Action boilerplate

export const SELECT_LANGUAGE = 'select language';
export const SELECT_TOPIC = 'select topic';
export const SELECT_ACTIVITY = 'select activity';
export const CHANGE_SELECTIONS = 'change selections';
export const REQUEST_MARKUP = 'send request';
export const REQUEST_MARKUP_FAILED = 'send request failed';
export const RECEIVE_MARKUP = 'receive markup';
export const RESTORE_MARKUP = 'restore markup';
export const DESTROY_MARKUP = 'destroy markup';
export const UPDATE_ENHANCEMENT = 'update enhancement';

export const selectLanguage = language => ({ type: SELECT_LANGUAGE, language });
export const selectTopic = viewModel => topic => (dispatch, getState) => {
  dispatch({ type: SELECT_TOPIC, topic });
  const markup = viewModel.selectTopic(getState().language, topic);
  if (markup) {
    dispatch(fetchMarkup(markup));
  }
};
export const selectActivity = activity => ({ type: SELECT_ACTIVITY, activity });
export const changeSelections = selections => ({ type: CHANGE_SELECTIONS, selections });
export const updateEnhancement = nodes => ({ type: UPDATE_ENHANCEMENT, nodes });

export const enhance = markup => dispatch => dispatch(fetchMarkup(markup));
export const restoreMarkup = markup => (dispatch, getState) => {
  markup.restore(getState().markup.original);
  dispatch({ type: DESTROY_MARKUP });
};

const requestMarkupFailed = error => ({ type: REQUEST_MARKUP_FAILED, error });
const receiveMarkup = markup => ({ type: RECEIVE_MARKUP, markup });
const requestMarkup = original => ({ type: REQUEST_MARKUP, original });
const fetchMarkup = markup => (dispatch, getState) => {
  const original = markup.getOriginal();
  dispatch(requestMarkup(original));
  markup.fetch(original).then(
    response => {
      if (getState().markup.isFetching) {
        dispatch(receiveMarkup(response));
        markup.apply(response);
      }
    } ,
    error => {
      markup.error(error);
      dispatch({ type: DESTROY_MARKUP });
    }
  );
};
