import BlockchainAPI from '../blockchainAPI';
import { jsonParse } from '../helpers/formatter';
import _ from 'lodash';
import * as accountHistoryConstants from '../../common/constants/accountHistory';
import { array } from 'prop-types';
import { combineArrays } from './arrayHelpers';

/** *
 * Get the path from URL and the API object and return the correct API call based on path
 * @param path - as in URL like 'trending'
 * @param API - the { api } from an npm package
 * @param query {Object} - the same query sending to Blockchain API
 * @param blockchainAPI - The same giving to Blockchain API
 * @returns {function}
 */
export function getDiscussionsFromAPI(sortBy, query, blockchainAPI) {
  switch (sortBy) {
    case 'feed':
    case 'hot':
    case 'created':
    case 'active':
    case 'trending':
    case 'blog':
    case 'comments':
    case 'promoted':
      // console.log("getDiscussionsFromApi", sortBy);
			var ret = blockchainAPI.sendAsync(`get_discussions_by_${sortBy}`, [query])
      .catch(err=>{console.error('err', err)});
			return ret
    default:
      throw new Error('There is not API endpoint defined for this sorting', sortBy);
  }
};


/**
 * Returns a concatenated array of a series of payloads for getDiscussionsFromApi.
 * @param {array} callParams - An array of sortby and category values.
 * @param {number} limit - Amount of posts to retrieve per sortBy value.
 * @param {object} blockchainAPI - the blockchain API object.
 */
export const getMultiDiscussionsFromAPI = (callParams, limit, blockchainAPI) =>
  new Promise(async resolve => {
    const payloadArray = callParams.reduce(async (payloadListP, value) => {
      const payloadList = await payloadListP;
      // console.log("get multi discussions from API", value);
      const sortBy = value[0];
      const category = (value[1] === 'all') ? ((sortBy === 'feed') ? 'weyoume': '') : value[1];
      const nextPayloadData = await getDiscussionsFromAPI(
        sortBy, 
        {tag: category, limit: limit}, 
        blockchainAPI);
      return payloadList.concat([nextPayloadData]);
    }, []);
    const payloadSet = await payloadArray;
    // console.log("Payloadset:", payloadSet);
    const APIpayload = payloadSet.concat(_.uniq([combineArrays(payloadSet)]));
    resolve(APIpayload);
    // console.log("MultiDiscussions: APIpayload", APIpayload);
  });

 /**
 * Returns a concatenated array of a series of payloads for getDiscussionsFromApi.
 * @param {array} callParams - An array of the sortby, catagory, start_author, and start_permlink values.
 * @param {number} limit - Amount of posts to retrieve per sortBy value.
 * @param {object} blockchainAPI - the blockchain API object.
 */
export const getMoreMultiDiscussionsFromAPI = (callParams, limit, blockchainAPI) => 
    new Promise(async resolve => {
      // console.log("Getting more multi discussions:_call params", callParams);
      const payloadArray = callParams.reduce(async (payloadListP, value) => {
        const payloadList = await payloadListP;
        const sortBy = value[0];
        const category = (value[1] === 'all') ? ((sortBy === 'feed') ? 'weyoume': '') : value[1];
        const startAuthor = value[2];
        const startPermlink = value[3];
        const nextPayloadData = await getDiscussionsFromAPI(
          sortBy, 
          {tag: category, limit: limit, start_author: startAuthor, start_permlink: startPermlink}, 
          blockchainAPI);
        return payloadList.concat([nextPayloadData]);
      }, []);
      const payloadSet = await payloadArray;
      const APIpayload = payloadSet.concat(_.uniq([combineArrays(payloadSet)]));
      resolve(APIpayload);
      // console.log("moreMultiDiscussions: APIpayload:", APIpayload);
    });


export const getAccount = username =>
  BlockchainAPI.sendAsync('get_accounts', [[username]]).then(result => {
    if (result.length) {
      const userAccount = result[0];
      userAccount.json = jsonParse(result[0].json);
      return userAccount;
    }
    throw new Error('User Not Found');
  }).catch(err=>{console.error('err', err)});

export const getNetworkUserListFromAPI = () =>
  BlockchainAPI.sendAsync('lookup_accounts',['0', 1000]).then(result => {
    // console.log("Got NetworkUserList:", result);
    if (result.length) {
      const networkUserList = result.filter(name => !name.match(/(webuilder|null|temp|builders)/));
      return networkUserList;
    }
    throw new Error('Lookup Accounts Failed');
  }).catch(err=>{console.error('err', err)});

export const getFollowingCount = username =>
  BlockchainAPI.sendAsync('call', ['follow_api', 'get_follow_count', [username]]).catch(err=>{console.error('err', err)});

export const getAccountWithFollowingCount = username =>
  Promise.all([getAccount(username), getFollowingCount(username)]).then(([account, following]) => ({
    ...account,
    following_count: following.following_count,
    follower_count: following.follower_count,
  }));

export const getFollowing = (username, startForm = '', type = 'blog', limit = 100) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_following',
    [username, startForm, type, limit],
  ]).then(result => result.map(user => user.following)).catch(err=>{console.error('err', err)});

export const getFollowers = (username, startForm = '', type = 'blog', limit = 100) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_followers',
    [username, startForm, type, limit],
  ]).then(result => result.map(user => user.follower)).catch(err=>{console.error('err', err)});

export const getAllFollowing = username =>
  new Promise(async resolve => {
    const following = await getFollowingCount(username);
    const chunkSize = 100;
    const limitArray = Array.fill(
      Array(Math.ceil(following.following_count / chunkSize)),
      chunkSize,
    );
    const list = limitArray.reduce(async (currentListP, value) => {
      const currentList = await currentListP;
      const startForm = currentList[currentList.length - 1] || '';
      const followers = await getFollowing(username, startForm, 'blog', value);
      return currentList.slice(0, currentList.length - 1).concat(followers);
    }, []);
    resolve(list);
  });

export const defaultAccountLimit = 500;

export const getAccountHistory = (account, from = -1, limit = defaultAccountLimit) =>
  BlockchainAPI.sendAsync('get_account_history', [account, from, limit]).catch(err=>{console.error('err', err)});

export const getDynamicGlobalProperties = () =>
  BlockchainAPI.sendAsync('get_dynamic_global_properties', []).catch(err=>{console.error('err', err)});

export const getTransactionByID = (txid) =>
  BlockchainAPI.sendAsync('get_transaction', [txid]).catch(err=>{console.error('err', err)});

export const getBlockFromNumber = (block_num) =>
  BlockchainAPI.sendAsync('get_block', [block_num]).catch(err=>{console.error('err', err)});

export const getHeadBlocksArray = () =>
  new Promise(async resolve => {
    const gprops = await getDynamicGlobalProperties();
    const head_block_number = gprops.head_block_number;
    const rangeArray = _.range(head_block_number, head_block_number - 10, -1);
    const blockArray = rangeArray.reduce(async (blockListP, value) =>{
      const blockList = await blockListP;
      const nextBlockData = await getBlockFromNumber(value);
      return blockList.concat({num: value, data: nextBlockData});
    }, []);
    resolve(blockArray);
  });

export const isWalletTransaction = actionType =>
  actionType === accountHistoryConstants.TRANSFER ||
  actionType === accountHistoryConstants.transferTMEtoSCOREfund ||
  actionType === accountHistoryConstants.cancelTransferFromSavings ||
  actionType === accountHistoryConstants.transferFromSavings ||
  actionType === accountHistoryConstants.transferToSavings ||
  actionType === accountHistoryConstants.delegateSCORE ||
  actionType === accountHistoryConstants.claimRewardBalance;

export const getAccountReputation = (name, limit = 20) =>
  BlockchainAPI.sendAsync('call', ['follow_api', 'get_account_reputations', [name, limit]]).catch(err=>{console.error('err', err)});

export const getAllSearchResultPages = search => {
  const promises = [];

  for (let i = 0; i <= 10; i += 1) {
    // promises.push(
    //   fetch(`https://api.asksteem.com/search?q=${search}&types=post&pg=${i}`).then(res =>
    //     res.json(),
    //   ),
    // );
  }

  return Promise.all(promises);
};

export const currentUserFollowersUser = (currentUsername, username) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_following',
    [username, currentUsername, 'blog', 1],
  ]).catch(err=>{console.error('err', err)});
