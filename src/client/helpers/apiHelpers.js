import BlockchainAPI from '../blockchainAPI';
import { jsonParse } from '../helpers/formatter';
import _ from 'lodash';
import * as accountHistoryConstants from '../../common/constants/accountHistory';
import { array } from 'prop-types';
import { combineArrays, mergePostLists } from './arrayHelpers';
import { message } from 'antd';
var CryptoJS = require("crypto-js");
var randomNumber = require("random-number-csprng");
import wehelpjs from 'wehelpjs';


/** *
 * Get the path from URL and the API object and return the correct API call based on path
 * @param path - as in URL like 'trending'
 * @param API - the { api } from an npm package
 * @param query {Object} - the same query sending to Blockchain API
 * @param blockchainAPI - The same giving to Blockchain API
 * @returns {function}
 */
export function getDiscussionsFromAPI(sortBy, query, blockchainAPI) {
  //console.log("sortby:", sortBy || "null");
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
export const getMultiDiscussionsFromAPI = (callParams, limit, promRatio, blockchainAPI) =>
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
    const promotedData = await getDiscussionsFromAPI('promoted', {tag: '', limit: limit}, blockchainAPI);
    // console.log("Payloadset:", payloadSet);
    const postNumber = _.uniqBy(payloadSet[0].concat(...payloadSet[1]), 'id').length;
    //console.log("postNumber:", postNumber);
    const trimmedPromData = _.take(promotedData, Math.floor(postNumber/promRatio));
    const payloadPlusProm = payloadSet.concat([trimmedPromData]);
    const APIpayload = payloadPlusProm.concat(_.uniq([mergePostLists(payloadSet, trimmedPromData, promRatio)]));
    resolve(APIpayload);
    //console.log("MultiDiscussions: APIpayload", APIpayload);
  });

 /**
 * Returns a concatenated array of a series of payloads for getDiscussionsFromApi.
 * @param {array} callParams - An array of the sortby, catagory, start_author, and start_permlink values.
 * @param {number} limit - Amount of posts to retrieve per sortBy value.
 * @param {object} blockchainAPI - the blockchain API object.
 */
export const getMoreMultiDiscussionsFromAPI = (callParams, limit, promRatio, blockchainAPI) => 
    new Promise(async resolve => {
      //console.log("Getting more multi discussions:_call params", callParams);
      const payloadArray = callParams.reduce(async (payloadListP, value) => {
        const payloadList = await payloadListP;
        const sortBy = value[0];
        const category = (value[1] === 'all' || value[1] === 'promoted') ? ((sortBy === 'feed') ? 'weyoume': '') : value[1];
        const startAuthor = value[2];
        const startPermlink = value[3];
        const nextPayloadData = await getDiscussionsFromAPI(
          sortBy, 
          {tag: category, limit: limit+1, start_author: startAuthor, start_permlink: startPermlink}, 
          blockchainAPI);
        return payloadList.concat([nextPayloadData.slice(1, limit+1)]);
      }, []);
      const payloadSet = await payloadArray;
      const postNumber = _.uniqBy(payloadSet[0].concat(...payloadSet[1]), 'id').length;
      //console.log("postNumber:", postNumber);
      const trimmedPromData = payloadSet[2].slice(0, Math.floor(postNumber/promRatio));
      //console.log("trimmedpromdata:" , trimmedPromData);
      const clearedPayload = payloadSet.slice(0,2);
      const APIpayload = clearedPayload.concat([trimmedPromData]).concat(_.uniq([mergePostLists(clearedPayload, trimmedPromData, promRatio)]));
      resolve(APIpayload);
      //console.log("moreMultiDiscussions: APIpayload:", APIpayload);
    });

/**
 * Returns the encrypted ciphertext of a data string.
 * @param {string} username - The name of the current account.
 * @param {string} recipientMemoPublicKey - The public memo key of the data recipient.
 * @param {string} data - The plaintext string of memo data to be encrypted.
 */
export function encryptWithMemoKeypair(username, recipientMemoPublicKey, data) {
  let storagekey = "UserMemoKey-"+username;
  if (!_.isEmpty(localStorage.getItem(storagekey)) &&
    (typeof data == 'string') &&
    (typeof username == 'string') &&
    (typeof recipientMemoPublicKey == 'string')) {
      const userMemoPrivateKey = localStorage.getItem(storagekey);
      //console.log("userMemoPrivateKey:", userMemoPrivateKey);
      return wehelpjs.memo.encode(userMemoPrivateKey, recipientMemoPublicKey, ("#"+data));
  } else {
      message.error("Encryption error: Please load secret key in profile settings.");
      return ("Encryption not successful");
  } 
};

/**
 * Returns the decrypted plaintext of encrypted memo data.
 * @param {string} username - The name of the current account.
 * @param {string} data - The ciphertext string of encrypted memo data, should start with #.
 */
export function decryptWithMemoKeypair(username, data) {
  let storagekey = "UserMemoKey-"+username;
  if (!_.isEmpty(localStorage.getItem(storagekey)) && 
    (typeof data == 'string') && 
    (typeof username == 'string')) {
      const userMemoPrivateKey = localStorage.getItem(storagekey);
      const encryptedBody = wehelpjs.memo.decode(userMemoPrivateKey, data);
      //console.log("userMemoPrivateKey:", userMemoPrivateKey, encryptedBody);
      return encryptedBody.slice(1, encryptedBody.length);
  } else {
      message.error("Decryption error: Please load secret key in profile settings.");
      return ("Decryption not successful");
  } 
};

/**
 * Returns the decrypted plaintext of AES encrypted an data string.
 * @param {string} data - The ciphertext string of AES encrypted data
 * @param {string} decryptionKey - The decryption key to be used
 */
export function decryptAES(ciphertext, decryptionKey) {
  if ((typeof ciphertext == 'string') && 
    (typeof decryptionKey == 'string')) {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, decryptionKey).toString(CryptoJS.enc.Utf8);
      //console.log("decrypted AES:", decrypted);
      return decrypted;
  } else {
      message.error("Decryption error: ciphertext or decryption key not valid.");
      return ("Decryption not successful");
  }
}

/**
 * Returns a parsed JSON string of the public body, encrypted private body, and resolved accesslist with encrypted viewing keys.
 * @param {string} body - The plaintext string of the private body of the post, will be encrypted.
 * @param {string} json - The json object of the post, which will have image encrypted and accessList added.
 * @param {object} accessList - The list of usernames of accounts to be granted access to the decryption keys of the encrypted private body.
 */
export async function getEncryptedPost(username, body, json, accessList, permlink) {
  //console.log("gettting EncryptedPost:", username, body, json, accessList );
  const rand = new Promise(async resolve => {
    const number = randomNumber(2**16, 2**31);
    resolve(number);
    //console.log("number:", number);
  });
  const randReady = await rand;
  const encryptionKey = CryptoJS.SHA256(body+randReady.toString()).toString(CryptoJS.enc.Hex);
  //console.log("encryptionkey:", encryptionKey);
  const cipherobject = CryptoJS.AES.encrypt("🔓 Private Post Unlocked ☑️ "+body, encryptionKey);
  //console.log("cipherobject:", cipherobject);
  const ciphertext = cipherobject.toString();
  //console.log("ciphertext:", ciphertext);

  const selfAccessList = _.uniq(accessList.concat([username]));

  const resolvedAccessList = new Promise(async resolve => {
    BlockchainAPI.sendAsync('get_accounts', [selfAccessList]).then(result => {
    if (result.length) {
      const userAccounts = _.compact(result);
      let accessObject = {};
      userAccounts.forEach(account => {
        Object.defineProperty(
          accessObject, account.name, {value: encryptWithMemoKeypair(username, account.memoKey, encryptionKey), 
            writable: true,
            enumerable: true,
            configurable: true});
      });
      resolve(accessObject);
    }})
    .catch(err=>{console.error('err', err)});
    });

  const cipherobjectImages = CryptoJS.AES.encrypt(json.image.toString(), encryptionKey);
  const encryptedImages = cipherobjectImages.toString();
  const accessListReady = await resolvedAccessList.then(result => {return result;});

  const jsonSet = {
    ...json, 
    accessList: accessListReady, 
    image: encryptedImages,
  };

  const encryptedPost = await {body: ciphertext, json: jsonSet, permlink: permlink};
  //console.log("got encrypted post:", accessListReady, encryptedPost);
  return encryptedPost;
}

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

/**
 * Returns an array of objects containing the top followed accounts.
 */
export const getTopFollowedListFromAPI = () =>
  new Promise(async resolve => {
    const networkUserList = await getNetworkUserListFromAPI();
    const payloadArray = networkUserList.reduce(async (payloadListP, value) => {
      const payloadList = await payloadListP;
      const AccountFollowers = await getAccountWithFollowingCount(value);
      // console.log("Adding FollowList:", AccountFollowers.name);
      return payloadList.concat(AccountFollowers);
    }, []);
    const followList = await payloadArray;
    const sortedFollowList = await followList.sort((a,b) => b.follower_count-a.follower_count);
    resolve(sortedFollowList);
    // console.log("TopFollowLst:", sortedFollowList);
  });

/**
 * Returns an array of all account objects with following/followed counts.
 */
export async function getAllAccountsFromAPI() {
  const networkUserList = await getNetworkUserListFromAPI().catch(err => {console.error('err', err) });
  const payloadArray = await Promise.all(networkUserList.map(user => {
    //console.log("FindingUser:", user);
    return getAccountWithFollowingCount(user);
  }));
  //console.log("PayloadArray:", payloadArray);
  return payloadArray;  
};

/**
 * Returns an array of the user account objects with the closest edit distance to the target name.
 */
export const getUserSearchResults = (search, limit) => 
  new Promise(async resolve => {
    const networkUserList = await getNetworkUserListFromAPI().catch(err => {console.error('err', err) });
    //console.log("networkUserList:", networkUserList);
    const editDistanceList = networkUserList.map(user => ({user, distance: getEditDistance(search, user) }));
    //console.log("editDistanceList:", editDistanceList);
    const sortedList = editDistanceList.sort((a,b) => a.distance - b.distance);
    //console.log("sortedList:", sortedList);
    const slicedList = sortedList.slice(0, limit);
    //console.log("slicedList:", slicedList);
    const searchPayload = await Promise.all(slicedList.map(user => { 
      return getAccountWithFollowingCount(user.user).catch(err=>{console.error('err', err)});
    }));
    resolve(searchPayload);
    //console.log("searchPayload:", searchPayload);
  });
    
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


export const currentUserFollowersUser = (currentUsername, username) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_following',
    [username, currentUsername, 'blog', 1],
  ]).catch(err=>{console.error('err', err)});


/**
 * Returns the edit distance between two strings.
 */
export function getEditDistance(a,b) {
  //console.log("Get Edit Distance:", a, b);
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
  // SOURCE: https://gist.github.com/andrei-m/982927/0efdf215b00e5d34c90fdc354639f87ddc3bd0a5
};

