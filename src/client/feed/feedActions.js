import { getMultiDiscussionsFromAPI, getMoreMultiDiscussionsFromAPI } from '../helpers/apiHelpers';
import {
  createAsyncActionType,
  getFeedFromState,
  getFeedLoadingFromState,
} from '../helpers/stateHelpers';

import {
  getAuthenticatedUserName,
  getFeed,
  getPosts,
  getBookmarks as getBookmarksSelector,
} from '../reducers';

export const GET_FEED_CONTENT = createAsyncActionType('@feed/GET_FEED_CONTENT');
export const GET_MORE_FEED_CONTENT = createAsyncActionType('@feed/GET_MORE_FEED_CONTENT');

export const GET_USER_COMMENTS = createAsyncActionType('@feed/GET_USER_COMMENTS');
export const GET_MORE_USER_COMMENTS = createAsyncActionType('@feed/GET_MORE_USER_COMMENTS');

export const GET_REPLIES = createAsyncActionType('@user/GET_REPLIES');
export const GET_MORE_REPLIES = createAsyncActionType('@user/GET_MORE_REPLIES');

export const GET_BOOKMARKS = createAsyncActionType('@bookmarks/GET_BOOKMARKS');

import _ from 'lodash';

export const getFeedContent = ({ sortBy, category, limit = 9 }) => (
  dispatch,
  getState,
  { blockchainAPI },
) => {
  // console.log("GET FEED CONTENT: sortBy", sortBy, "category", category);
  const fetchParams = _.zip(sortBy, category);

  dispatch({
		type: GET_FEED_CONTENT.ACTION,
    payload: getMultiDiscussionsFromAPI(fetchParams, limit, 9, blockchainAPI)
    .then(postsData => postsData),
    meta: {
      sortBy: sortBy,
      category: category.concat(category.join('-')),
      limit: limit,
    },
  });
};

export const getMoreFeedContent = ({ sortBy, category, limit = 9 }) => (
  dispatch,
  getState,
  { blockchainAPI },
) => {
  //console.log("GET MORE FEED CONTENT: sortBy", sortBy, "category", category);
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);
  const sortByP = sortBy.concat('promoted');
  const categoryP = category.concat('promoted');
  

  const sortByCat = _.zip(sortBy.concat(sortBy.join('-')), categoryP);

  //console.log("sortbycat:", sortByCat);

  const feedContent = sortByCat.reduce((feedListP, value) => {
    const feedList = feedListP;
    const nextStateData = getFeedFromState(value[0], value[1], feed);
    //console.log("reducing feed content", nextStateData);
    return feedList.concat([nextStateData]);
  }, []);
  
  //console.log("Getting More feed content:", sortBy, feedContent);

  if (feedContent[0].length < 1) return Promise.resolve(null);
  if (feedContent[1].length < 1) return Promise.resolve(null);
  if (feedContent[2].length < 1) return Promise.resolve(null);

  // creates transposed array of content fetching paramters for each sortby value passed
  const lastPosts = feedContent.map(feed => posts[feed[feed.length - 1]]);
  const startAuthors = lastPosts.map(post => post.author);
  const startPermlinks = lastPosts.map(post => post.permlink);
  const fetchParams = _.zip(sortByP, categoryP, startAuthors, startPermlinks);
  //console.log("FetchParams:",  fetchParams);

  return dispatch({
    type: GET_MORE_FEED_CONTENT.ACTION,
    payload: getMoreMultiDiscussionsFromAPI(fetchParams, limit, 9, blockchainAPI)
    .then(postsData => postsData),
    meta: {
      sortBy: sortBy,
      category: category.concat(category.join('-')),
      limit,
    },
  });
};

export const getUserComments = ({ username, limit = 10 }) => (dispatch, getState, { blockchainAPI }) =>
  dispatch({
    type: GET_USER_COMMENTS.ACTION,
    payload: blockchainAPI
      .sendAsync('get_discussions_by_comments', [{ start_author: username, limit }])
      .then(postsData => postsData),
    meta: { sortBy: 'comments', category: username, limit },
  });

export const getMoreUserComments = ({ username, limit = 20 }) => (
  dispatch,
  getState,
  { blockchainAPI },
) => {
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);

  const feedContent = getFeedFromState(['comments'], username, feed);
  const isLoading = getFeedLoadingFromState('comments', username, feed);

  if (!feedContent.length || isLoading) {
    return null;
  }

  const lastPost = posts[feedContent[feedContent.length - 1]];
  const startAuthor = lastPost.author;
  const startPermlink = lastPost.permlink;

  return dispatch({
    type: GET_MORE_USER_COMMENTS.ACTION,
    payload: blockchainAPI
      .sendAsync('get_discussions_by_comments', [
        {
          start_author: startAuthor,
          start_permlink: startPermlink,
          limit: limit + 1,
        },
      ])
      .then(postsData => postsData.slice(1)),
    meta: { sortBy: 'comments', category: username, limit },
  });
};

export const getReplies = () => (dispatch, getState, { blockchainAPI }) => {
  const state = getState();
  const category = getAuthenticatedUserName(state);

  dispatch({
    type: GET_REPLIES.ACTION,
    payload: blockchainAPI
      .sendAsync('get_state', [`/@${category}/recent-replies`])
      .then(apiRes => Object.values(apiRes.content).sort((a, b) => b.id - a.id)),
    meta: { sortBy: 'replies', category, limit: 50 },
  });
};

export const getMoreReplies = () => (dispatch, getState, { blockchainAPI }) => {
  const state = getState();
  const feed = getFeed(state);
  const posts = getPosts(state);
  const category = getAuthenticatedUserName(state);

  const lastFetchedReplyId =
    feed.replies[category] && feed.replies[category].list[feed.replies[category].list.length - 1];

  if (!lastFetchedReplyId) {
    return null;
  }

  const startAuthor = posts.list[lastFetchedReplyId].author;
  const startPermlink = posts.list[lastFetchedReplyId].permlink;
  const limit = 10;

  return dispatch({
    type: GET_MORE_REPLIES.ACTION,
    payload: blockchainAPI
      .sendAsync('get_replies_by_last_update', [startAuthor, startPermlink, limit + 1])
      .then(postsData => postsData.slice(1)),
    meta: { sortBy: 'replies', category, limit },
  });
};

/**
 * Use async await to load all the posts of bookmarked from blockchainAPI and returns a Promise
 *
 * @param bookmarks from Auth storage - contains author and permlink
 * @param blockchainAPI
 * @returns Promise - bookmarksData
 */
async function getBookmarksData(bookmarks, blockchainAPI) {
  const bookmarksData = [];
  for (let idx = 0; idx < Object.keys(bookmarks).length; idx += 1) {
    const postId = Object.keys(bookmarks)[idx];

    const postData = blockchainAPI.sendAsync('get_content', [
      bookmarks[postId].author,
      bookmarks[postId].permlink,
		]);
		postData.catch(err=>{console.error('err', err)})
    bookmarksData.push(postData);
  }
  return Promise.all(bookmarksData.sort((a, b) => a.timestamp - b.timestamp).reverse());
}

export const getBookmarks = () => (dispatch, getState, { blockchainAPI }) => {
  const state = getState();
  const bookmarks = getBookmarksSelector(state);

  dispatch({
    type: GET_BOOKMARKS.ACTION,
    payload: getBookmarksData(bookmarks, blockchainAPI).then(posts =>
      posts.filter(post => post.id !== 0),
    ),
    meta: {
      sortBy: 'bookmarks',
      category: 'all',
      once: true,
    },
  });
};
