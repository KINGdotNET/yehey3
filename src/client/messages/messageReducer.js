import * as authActions from '../auth/authActions';
import * as messagesActions from './messageActions';
import * as postActions from '../post/postActions';
import _ from 'lodash';

const defaultState = {
  messages: {},
  pendingMessages: [],
  sendingMessage: false,
  loadingMessages: false,
  loadedMessages: false,
  mutualFollowers: [],

  error: null,
  success: false,

};

const message = (state = defaultState, action) => {
  switch (action.type) {
    
    case messagesActions.CREATE_MESSAGE_START:
      return {
        ...state,
        sendingMessage: true,
        pendingMessages: [...state.pendingMessages, action.meta.id],
        error: null,
        success: false,
      };
    
    case messagesActions.CREATE_MESSAGE_SUCCESS:
    
      return {
        ...state,
        error: null,
        sendingMessage: false,
        pendingMessages: state.pendingMessages.filter(id => id !== action.meta.id),
        messages: { 
          ...state.messages,
          [action.meta.sender]: [...state.messages[action.meta.sender], {
            sender: action.meta.sender,
            recipient: action.meta.recipient,
            messageText: action.meta.messageText,
            time: action.meta.time,
            id: action.meta.id,
          } ]
        },
        success: true,
      };

    case messagesActions.CREATE_MESSAGE_ERROR:
      return {
        ...state,
        error: action.payload.result,
        sendingMessage: false,
        pendingMessages: state.pendingMessages.filter(id => id !== action.meta.id),
        success: false,
      };

    case messagesActions.GET_ALL_MESSAGES_START:
    case messagesActions.GET_STORED_MESSAGES_START:
      return {
        ...state,
        loadingMessages: true,
        loadedMessages: false,
        error: null,
      };
    
    case messagesActions.GET_ALL_MESSAGES_SUCCESS:
    case messagesActions.GET_STORED_MESSAGES_SUCCESS:
      return {
        ...state,
        error: null,
        loadingMessages: false,
        messages: 
          { 
          ...state.messages,
          ...action.payload.messages,
          },
        loadedMessages: true,
      };

    case messagesActions.GET_ALL_MESSAGES_ERROR:
    case messagesActions.GET_STORED_MESSAGES_ERROR:
      return {
        ...state,
        error: action.payload.result,
        loadingMessages: false,
        loadedMessages: false,
      };

    case messagesActions.GET_MESSAGES_START:
      return {
        ...state,
        loadingMessages: true,
        loadedMessages: false,
        error: null,
      };
    
    case messagesActions.GET_MESSAGES_SUCCESS:

      const user = action.meta.user;
      const recipient = action.meta.recipient;
      return {
        ...state,
        error: null,
        loadingMessages: false,
        messages: 
          { 
          ...state.messages,
          [user]: _.uniqBy( [..._.get(state.messages, user, []), ...action.payload.messages[user]], 'id'),
          [recipient]: _.uniqBy( [..._.get(state.messages, recipient, []), ...action.payload.messages[recipient]], 'id'),
          },
        loadedMessages: true,
      };

    case messagesActions.GET_MESSAGES_ERROR:
      return {
        ...state,
        error: action.payload.result,
        loadingMessages: false,
        loadedMessages: false,
      };

    default:
      return state;
  }
};

export default message;

export const getMessagesList = state => state.messages;
export const getPendingMessagesList = state => state.pendingMessages;
export const getIsMessageSending = state => state.sendingMessage;
export const getIsMessagesLoading = state => state.loadingMessages;
export const getIsMessagesLoaded = state => state.loadedMessages;