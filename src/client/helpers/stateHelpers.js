import _ from 'lodash';
import uuidv4 from 'uuid/v4';

export const getFeedFromState = (sortBy, category = 'all', state) => {  
  if (!state[sortBy]) return [];
  if (!state[sortBy][category]) return [];
  if (!state[sortBy][category].list) return [];
  return state[sortBy][category].list;
};

export const getFeedLoadingFromState = (sortBy, category = 'all', state) => { 
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].isFetching;
};

export const getFeedFetchedFromState = (sortBy, category = 'all', state) => {  
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].isLoaded;
};

export const getFeedHasMoreFromState = (sortBy, category = 'all', state) => {   
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].hasMore;
};

export const getFeedFailedFromState = (sortBy, category = 'all', state) => { 
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].failed;
};

// returning the same function but different naming helps to understand the code's flow better
// and defines a pattern to scale this feature with reselect
export const getUserFeedFromState = (username, feed) => getFeedFromState(['feed'], username, feed);

export const getUserFeedLoadingFromState = (username, feedState) =>
  getFeedLoadingFromState('feed', username, feedState);

export const getUserFeedFetchedFromState = (username, feedState) =>
  getFeedLoadingFromState('feed', username, feedState);

export const getUserFeedFailedFromState = (username, feedState) =>
  getFeedFailedFromState('feed', username, feedState);

/**
 * Sort comments based on payout
 * @param {Array} list - list of IDs of comments
 * @param {Object} commentsState - state.comments in redux setup
 * @param {String} sortBy - how comments should be sorted
 * @returns {Array} - list of sorted IDs
 */
export const sortComments = (list, commentsState, sortBy = 'trending') => {
  let compareFunc;
  const newList = [...list];

  if (sortBy === 'trending') {
    compareFunc = (itemA, itemB) => {
      let compareRes = parseFloat(itemA.total_payout_value) - parseFloat(itemB.total_payout_value);
      if (compareRes === 0) {
        compareRes = itemA.net_votes - itemB.net_votes;
      }
      return compareRes;
    };
  } else if (sortBy === 'votes') {
    compareFunc = (itemA, itemB) => itemA.net_votes - itemB.net_votes;
  } else if (sortBy === 'new') {
    compareFunc = (itemA, itemB) => Date.parse(itemA.created) - Date.parse(itemB.created);
  }

  return newList
    .sort((item1, item2) =>
      compareFunc(commentsState.comments[item1], commentsState.comments[item2]),
    )
    .reverse();
};

export const createAsyncActionType = type => ({
  ACTION: type,
  START: `${type}_START`,
  SUCCESS: `${type}_SUCCESS`,
  ERROR: `${type}_ERROR`,
});

export const getUserDetailsKey = username => `user-${username}`;

export const getMessagesFromState = (name, recipient, state) => {
  if (!state[name]) return [];
  if (!state[recipient]) return [];
  const incoming = state[recipient];
  const outgoing = state[name].filter(message => message.recipient == recipient );
  var messageArray = _.flatten(incoming.concat(outgoing));
  return messageArray.sort((a,b) => a.time - b.time);
}

export const getMessagesHomeFromState = (mutualList, state) => {
  var messageArray =_.flatten(Object.values(state));
  messageArray = messageArray.sort((a,b) => b.time - a.time); 
  var messagesHomeList = mutualList.map(
    (contact) => {
      var firstMessage = messageArray.find(
        (message) => { return message.sender == contact || message.recipient == contact } );
      if (firstMessage) {
        return {
          ...firstMessage,
          name: contact,
          userSent: (firstMessage.recipient == contact),
          newContact: false,
        };
      } else {
        var nameSum = [...contact].map(char => char.charCodeAt(0))
          .reduce((current, previous) => previous + current)
        return { 
          name: contact,
          time: (Date.now()-365*86400000-nameSum), // Moves messages back by 1 year
          messageText: "Send Message...",
          id: uuidv4(),
          userSent: false,
          newContact: true,
        };
      }});
      return messagesHomeList.sort((a,b) => b.time - a.time);
}

export const getLastMessageTimeFromState = (state) => {
  var messageArray =_.flatten(Object.values(state));
  messageArray = messageArray.sort((a,b) => b.time - a.time);
  var lastMessage = messageArray[0];
  lastMessageTime = _.get(lastMessage, "time", 0);
  return lastMessageTime;
}