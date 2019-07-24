import { jsonParse } from '../helpers/formatter';
import { notify } from '../app/Notification/notificationActions';
import { 
  getMessagesList, 
  getEncryptedMessage, 
  getStoredMessagesList,
  getUserMessageListKey, 
  storeMessagesList,
} from '../helpers/apiHelpers';
import { 
  getIsAuthenticated, 
  getAuthenticatedUserName, 
  getMutualList,
} from '../reducers';
import uuidv4 from 'uuid/v4';
import _ from 'lodash';

export const CREATE_MESSAGE = '@message/CREATE_MESSAGE';
export const CREATE_MESSAGE_START = '@message/CREATE_MESSAGE_START';
export const CREATE_MESSAGE_SUCCESS = '@message/CREATE_MESSAGE_SUCCESS';
export const CREATE_MESSAGE_ERROR = '@message/CREATE_MESSAGE_ERROR';

export const GET_MESSAGES = '@message/GET_MESSAGES';
export const GET_MESSAGES_START = '@message/GET_MESSAGES_START';
export const GET_MESSAGES_SUCCESS = '@message/GET_MESSAGES_SUCCESS';
export const GET_MESSAGES_ERROR = '@message/GET_MESSAGES_ERROR';

export const GET_ALL_MESSAGES = '@message/GET_ALL_MESSAGES';
export const GET_ALL_MESSAGES_START = '@message/GET_ALL_MESSAGES_START';
export const GET_ALL_MESSAGES_SUCCESS = '@message/GET_ALL_MESSAGES_SUCCESS';
export const GET_ALL_MESSAGES_ERROR = '@message/GET_ALL_MESSAGES_ERROR';

export const GET_STORED_MESSAGES = '@message/GET_STORED_MESSAGES';
export const GET_STORED_MESSAGES_START = '@message/GET_STORED_MESSAGES_START';
export const GET_STORED_MESSAGES_SUCCESS = '@message/GET_STORED_MESSAGES_SUCCESS';
export const GET_STORED_MESSAGES_ERROR = '@message/GET_STORED_MESSAGES_ERROR';

export function createMessage(messageData) {

  return (dispatch, getState, { weauthjsInstance }) => {
    const {
      recipient,
      messageText,
    } = messageData;

    const state = getState();
    const authUser = state.auth.user.name;
    const messageId = uuidv4();
    const currentTime = Date.now();

    dispatch({
      type: CREATE_MESSAGE,
      payload: {
        promise: getEncryptedMessage(authUser, recipient, messageText)
          .then(message => {
            weauthjsInstance.message(
            authUser, 
            recipient, 
            message.encryptedMessage, 
            currentTime, 
            messageId)
            .then(() => {
              if (window.analytics) {
                window.analytics.track('Message', {
                  category: 'message',
                  label: `${authUser} - ${recipient}`,
                  value: 1,
                });
              }

              return {
                sender: authUser, 
                recipient: recipient, 
                messageText: messageText, 
                time: currentTime, 
                id: messageId
              }
            })
          })
          .catch(err => { console.error('err', err); return err; } )
        .catch(err => { console.error('err', err); return err; } )
        },
      meta: {
        sender: authUser,
        recipient: recipient,
        messageText: messageText,
        time: currentTime,
        id: messageId
       }
    });
  };
}

export function getMessages(recipient) {

  return (dispatch, getState, { weauthjsInstance }) => {

    const state = getState();
    const authUser = getAuthenticatedUserName(state);

    dispatch({
      type: GET_MESSAGES,
      payload: {
        promise: getMessagesList(authUser, [recipient])
          .then(result => result)
          .catch(err => console.error('err', err))
      },
      meta: {
        user: authUser,
        recipient: recipient,
      }
    });
  };
}

export function getAllMessages() {

  return (dispatch, getState, { weauthjsInstance }) => {

    const state = getState();
    const authUser = getAuthenticatedUserName(state);
    const userList = getMutualList(state);

    dispatch({
      type: GET_ALL_MESSAGES,
      payload: {
        promise: getMessagesList(authUser, userList, true)
          .then(result => result)
          .catch(err => console.error('err', err))
      },
    });
  };
}

export function getStoredMessages() {

  return (dispatch, getState, { weauthjsInstance }) => {

    const state = getState();
    const authUser = getAuthenticatedUserName(state);

    dispatch({
      type: GET_STORED_MESSAGES,
      payload: {
        promise: getStoredMessagesList(authUser)
          .then(result => result)
          .catch(err => console.error('err', err))
      },
    });
  };
}


