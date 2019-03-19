import _ from 'lodash';

export const getFeedFromState = (sortBy, category = 'all', state) => {
  // console.log("GetFeedFromState:", sortBy, category, state);   
  if (!state[sortBy]) return [];
  if (!state[sortBy][category]) return [];
  if (!state[sortBy][category].list) return [];
  return state[sortBy][category].list;
};

export const getFeedLoadingFromState = (sortBy, category = 'all', state) => {
  // console.log("GetFeedLoadingFromState:", sortBy, category, state);   
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].isFetching;
};

export const getFeedFetchedFromState = (sortBy, category = 'all', state) => {
  // console.log("GetFeedFetchedFromState:", sortBy, category, state);   
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].isLoaded;
};

export const getFeedHasMoreFromState = (sortBy, category = 'all', state) => {
  // console.log("GetFeedHasMoreFromState:", sortBy, category, state);   
  if (!state[sortBy]) return false;
  if (!state[sortBy][category]) return false;
  return state[sortBy][category].hasMore;
};

export const getFeedFailedFromState = (sortBy, category = 'all', state) => {
  // console.log("GetFeedFailedFromState:", sortBy, category, state);   
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
