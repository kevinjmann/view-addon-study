// Action boilerplate

export const SELECT_LANGUAGE = 'select language';
export const SELECT_TOPIC = 'select topic';
export const SELECT_ACTIVITY = 'select activity';
export const CHANGE_SELECTIONS = 'change selections';
export const ENHANCE = 'enhance';
export const SEND_REQUEST = 'send request';
export const RECEIVE_MARKUP = 'receive markup';
export const RESTORE_MARKUP = 'restore markup';
export const UPDATE_ENHANCEMENT = 'update enhancement';
export const ENHANCEMENT_UPDATED = 'enhancement updated';

export const selectLanguage = language => ({ type: SELECT_LANGUAGE, language });
export const selectTopic = topic => ({ type: SELECT_TOPIC, topic });
export const selectActivity = activity => ({ type: SELECT_ACTIVITY, activity });
export const changeSelections = selections => ({ type: CHANGE_SELECTIONS, selections });
export const enhance = () => ({ type: ENHANCE });
export const sendRequest = ({ original, url }) => ({ type: SEND_REQUEST, original, url });
export const receiveMarup = markup => ({ type: RECEIVE_MARKUP, markup });
export const restoreMarkup = () => ({ type: RESTORE_MARKUP });
export const updateEnhancement = nodes => ({ type: UPDATE_ENHANCEMENT, nodes });
export const restoreEnhancement = () => ({ type: UPDATE_ENHANCEMENT });
