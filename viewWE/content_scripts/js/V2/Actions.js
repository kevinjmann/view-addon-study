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
export const READY_FOR_ENHANCEMENT = 'ready for enhancement';
export const ENHANCING = 'enhancing';
export const ENHANCEMENT_READY = 'enhancement ready';
export const RESET = 'reset';

export const selectLanguage = language => ({ type: SELECT_LANGUAGE, language });
export const selectTopic = viewModel => topic => (dispatch, getState) => {
  dispatch({ type: SELECT_TOPIC, topic, isV2Topic: viewModel.isV2Topic(topic) });
  const markup = viewModel.selectTopic(getState().language, topic);
  if (markup) {
    dispatch(fetchMarkup(markup));
  }
};
export const selectActivity = activity => ({ type: SELECT_ACTIVITY, activity });
export const changeSelections = selections => ({ type: CHANGE_SELECTIONS, selections });
export const updateEnhancement = nodes => ({ type: UPDATE_ENHANCEMENT, nodes });

export const enhancing = () => ({ type: ENHANCING });
export const enhancementReady = () => ({ type: ENHANCEMENT_READY });

export const reset = () => ({ type: RESET });
export const destroyMarkup = () => ({type: DESTROY_MARKUP});
export const enhance = markup => dispatch => dispatch(fetchMarkup(markup));
export const restoreMarkup = markup => (dispatch, getState) => {
  markup.restore(getState().markup.original);
  dispatch(reset());
};

const requestMarkupFailed = error => ({ type: REQUEST_MARKUP_FAILED, error });
const receiveMarkup = markup => ({ type: RECEIVE_MARKUP, markup });
const requestMarkup = original => ({ type: REQUEST_MARKUP, original });
const fetchMarkup = markup => (dispatch, getState) => {
  const original = markup.getOriginal();
  dispatch(requestMarkup(original));
  markup.fetch(original).then(
    response => {
      if (getState().markup.currently === 'fetching') {
        dispatch(receiveMarkup(response));
        markup.apply(response);
        dispatch({ type: READY_FOR_ENHANCEMENT });
      }
    } ,
    error => {
      markup.error(error);
      dispatch({ type: DESTROY_MARKUP });
    }
  );
};
