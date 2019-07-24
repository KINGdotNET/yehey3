import BlockchainAPI from '../blockchainAPI';
import { jsonParse } from '../helpers/formatter';
import _ from 'lodash';
import * as accountHistoryConstants from '../../common/constants/accountHistory';
import { combineArrays, mergePostLists } from './arrayHelpers';
import { message } from 'antd';
import changeCase from 'change-case';
var CryptoJS = require("crypto-js");
var randomNumber = require("random-number-csprng");
import wehelpjs from 'wehelpjs';
import uuidv4 from 'uuid/v4';

export const DEFAULT_PROFILE_IMAGE = '/images/DefaultProfileImage.png';
export const POST_UNLOCKED_STRING = "🔓 Private Post Unlocked ☑️ ";
export const defaultAccountLimit = 500;

/**
 * Converts the username of an account into the localstorage access key for the URL of its profile image.
 * @param {string} username - The String username of the account.
 * @returns {string} The User Image Access key for localStorage.
 */
export const getUserImageKey = username => `UserProfileImage-${username}`;

/**
 * Converts the username of an account into the localstorage access key for its Memo Private key.
 * @param {string} username - The String username of the account.
 * @returns {string} The Memo Private key Access key for localStorage.
 */
export const getUserMemoKey = username => `UserMemoKey-${username}`;

/**
 * Converts the username of an account into the localstorage access key for its MessagesList.
 * @param {string} username - The String username of the account.
 * @returns {string} The Memo Private key Access key for localStorage.
 */
export const getUserMessageListKey = username => `UserMessageList-${username}`;

/**
 * Collects posts from the Blockchain according to the specified sorting parameters.
 * @param {string} sortby - The String sorting charactertic : trending, hot, created.
 * @param {Object} query - The additonal parameters for the request : tag, start_author, start_permlink and limit
 * @param {Object} blockchainAPI - The Blockchain API Object.
 * @returns {array} An array of post information from the blockchain.
 */
export function getDiscussionsFromAPI(sortBy = 'trending', query, blockchainAPI) {
  switch (sortBy) {
    case 'feed':
    case 'hot':
    case 'created':
    case 'active':
    case 'trending':
    case 'blog':
    case 'comments':
    case 'promoted':
			var ret = blockchainAPI.sendAsync(`get_discussions_by_${sortBy}`, [query])
      .catch(err=>{console.error('err', err)});
      return ret
    case null: console.error('getDiscussionsFromAPI Null sortBy');
      return [];
    default:
      throw new Error('There is not API endpoint defined for this sorting', sortBy);
  }
};

/**
 * Generates a concatenated array of a series of posts from the blockchain using a 
 * combination of sorting criteria from an array, and inserts promoted posts at a specified interval.
 * @param {array} callParams - An array of sortby and category values.
 * @param {number} limit - Amount of posts to retrieve per sortBy value.
 * @param {number} promRatio - The amount of posts to load before inserting a promoted post.
 * @param {Object} blockchainAPI - The blockchain API object.
 * @returns {array} The resulting combination of merged feed posts and promoted posts.
 */
export const getMultiDiscussionsFromAPI = (callParams, limit, promRatio, blockchainAPI) =>
  new Promise(async resolve => {
    const payloadArray = callParams.reduce(async (payloadListP, value) => {
      const payloadList = await payloadListP;
      const sortBy = value[0];
      const category = (value[1] === 'all') ? ((sortBy === 'feed') ? 'weyoume': '') : value[1];
      const nextPayloadData = await getDiscussionsFromAPI(
        sortBy, 
        {tag: category, limit: limit}, 
        blockchainAPI)
        .catch(err => console.error(err));
      return payloadList.concat([nextPayloadData]);
    }, []);
    const payloadSet = await payloadArray;
    const promotedData = await getDiscussionsFromAPI('promoted', {tag: '', limit: limit}, blockchainAPI);
    const postNumber = _.uniqBy(payloadSet[0].concat(...payloadSet[1]), 'id').length;
    const trimmedPromData = _.take(promotedData, Math.floor(postNumber/promRatio));
    const payloadPlusProm = payloadSet.concat([trimmedPromData]);
    const APIpayload = payloadPlusProm.concat(_.uniq([mergePostLists(payloadSet, trimmedPromData, promRatio)]));
    resolve(APIpayload);
  });

 /**
 * Generates a concatenated array of a series of posts at a given starting post for each feed, from the blockchain using a 
 * combination of sorting criteria from an array, and inserts promoted posts at a specified interval.
 * @param {array} callParams - An array of sortby and category values, and the starting post authors and permlinks.
 * @param {number} limit - Amount of posts to retrieve per sortBy value.
 * @param {number} promRatio - The amount of posts to load before inserting a promoted post.
 * @param {Object} blockchainAPI - The blockchain API object.
 * @returns {array} The resulting combination of merged feed posts and promoted posts for continuing a feed.
 */
export const getMoreMultiDiscussionsFromAPI = (callParams, limit, promRatio, blockchainAPI) => 
    new Promise(async resolve => {
      const payloadArray = callParams.reduce(async (payloadListP, value) => {
        const payloadList = await payloadListP;
        const sortBy = value[0];
        const category = (value[1] === 'all' || value[1] === 'promoted') ? ((sortBy === 'feed') ? 'weyoume': '') : value[1];
        const startAuthor = value[2];
        const startPermlink = value[3];
        const nextPayloadData = await getDiscussionsFromAPI(
          sortBy, 
          {tag: category, limit: limit+1, start_author: startAuthor, start_permlink: startPermlink}, 
          blockchainAPI)
          .catch(err => console.error(err));
        return payloadList.concat([nextPayloadData.slice(1, limit+1)]);
      }, []);
      const payloadSet = await payloadArray;
      const postNumber = _.uniqBy(payloadSet[0].concat(...payloadSet[1]), 'id').length;
      const trimmedPromData = payloadSet[2].slice(0, Math.floor(postNumber/promRatio));
      const clearedPayload = payloadSet.slice(0,2);
      const APIpayload = clearedPayload.concat([trimmedPromData]).concat(_.uniq([mergePostLists(clearedPayload, trimmedPromData, promRatio)]));
      resolve(APIpayload);
    });

/**
 * Encrypts a given string of data using a specified memo public key of the recipient, and the user's stored memo private key.
 * @param {string} username - The name of the current account.
 * @param {string} recipientMemoPublicKey - The public memo key of the data recipient.
 * @param {string} data - The plaintext string of data to be encrypted.
 * @returns {string} The resulting ciphertext of the data after encryption.
 */
export function encryptWithMemoKeypair(username, recipientMemoPublicKey, data) {
  const storageKey = getUserMemoKey(username);
  if (!_.isEmpty(localStorage.getItem(storageKey)) &&
    (typeof data == 'string') &&
    (typeof username == 'string') &&
    (typeof recipientMemoPublicKey == 'string')) {
      const userMemoPrivateKey = localStorage.getItem(storageKey);
      return wehelpjs.memo.encode(userMemoPrivateKey, recipientMemoPublicKey, ("#"+data));
  } else {
      console.error("Encryption error: Please load secret key in profile settings.");
      return ("Encryption not successful");
  } 
};

/**
 * Retrieves the user's memo PrivateKey from local storage.
 * @param {string} username - The name of the current account.
 * @returns {string} The Memo Private key, if it has been set. 
 */
export function retrieveMemoPrivateKey(username) {
      const storageKey = getUserMemoKey(username);
      const storage = localStorage;
      if(!_.isEmpty(storage.getItem(storageKey))) {
        const userMemoPrivateKey = storage.getItem(storageKey);
        return userMemoPrivateKey; 
      } else {
        console.error("Please load secret key in profile settings.");
        return "Unable to retrieve Secret Key";
      }
    }

/**
 * Returns the decrypted plaintext of specified memo key encrypted data.
 * @param {string} username - The name of the current account.
 * @param {string} data - The ciphertext string of encrypted memo data, should start with #.
 * @returns {string} The decrypted plaintext string of data.
 */
export async function decryptWithMemoKeypair(username, data) {
  if ((typeof username == 'string') && (typeof data == 'string')) {
    const userMemoPrivateKey = retrieveMemoPrivateKey(username);
    const encryptedBody = wehelpjs.memo.decode(userMemoPrivateKey, data);
    return encryptedBody.slice(1, encryptedBody.length); 
  } else {
    console.error("Decryption error: Please use strings for username and data parameters.");
    return ("Unable to retrieve Secret Key");
  }
};

/**
 * Returns the decrypted plaintext of an AES encrypted ciphertext string.
 * @param {string} ciphertext - The ciphertext string of AES encrypted data
 * @param {string} decryptionKey - The decryption key to be used.
 * @returns {string} The AES decrypted plaintext string.
 */
export function decryptAES(ciphertext, decryptionKey) {
  if ((typeof ciphertext == 'string') && 
    (typeof decryptionKey == 'string')) {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, decryptionKey).toString(CryptoJS.enc.Utf8);
      return decrypted;
  } else {
      console.error("Decryption error: ciphertext or decryption key not valid.");
      return ("Decryption not successful");
  }
}

/**
 * Generates an object containing the encrypted private body, and accesslist of a post with encrypted viewing keys.
 * @param {string} username - The account name of the current user.
 * @param {string} body - The plaintext string of the private body of the post, which will be encrypted.
 * @param {string} json - The json object of the post, which will have its image encrypted and its accessList added.
 * @param {Array} accessList - An array of usernames of accounts to be included to access to the decryption key for the post.
 * @param {string} permlink - The string permlink of the post.
 * @returns {Object} The object with encrypted post data.
 */
export async function getEncryptedPost(username, body, json, accessList, permlink) {
  const rand = new Promise(async resolve => {
    const number = randomNumber(2**16, 2**31);
    resolve(number);
  });
  const randReady = await rand;
  const encryptionKey = CryptoJS.SHA256(body+randReady.toString()).toString(CryptoJS.enc.Hex);
  const cipherobject = CryptoJS.AES.encrypt(POST_UNLOCKED_STRING+body, encryptionKey);
  const ciphertext = cipherobject.toString();
  const selfAccessList = _.uniq(accessList.concat([username]));
  const normalizedAccessList = selfAccessList.map((user) => { return changeCase.lowerCase(user)});
  const resolvedAccessList = new Promise(async resolve => {
    BlockchainAPI.sendAsync('get_accounts', [normalizedAccessList]).then(result => {
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
  return encryptedPost;
}

/**
 * Returns an object containing the value of an encrpyted message to be sent.
 * @param {string} sender - The Sending account's username.
 * @param {string} recipient - The intended recipient's account username.
 * @param {string} messageData - The Body of the message to be encrypted.
 * @returns {Object} Object containing the value of encryptedMessage.
 */
export async function getEncryptedMessage(sender, recipient, messageData) {
    const cipherText = await getAccount(recipient)
      .then(result => {
        return encryptWithMemoKeypair(sender, result.memoKey, messageData);
      })
      .catch(err=>{console.error('err', err)});
    const encryptedMessage = await cipherText;
  return { encryptedMessage: encryptedMessage };
}

/**
 * Returns an array containing all incoming and outgoing messages to and from a username, for all accounts in the specified userList.
 * @param {string} username - The string of the current account's username.
 * @param {Array} userList - The list of usernames to be included in the messageList.
 * @returns {Object} messages : Object containing all retrieved messages, indexed by username of the sender.
 */
export const getMessagesList = (username, userList, writeLocal = false) =>
  new Promise(async (resolve, reject) => {
    const userMemoPrivateKey = retrieveMemoPrivateKey(username);
    const selfUserList = _.uniq(userList.concat([username]));
    const userTxnList = await getMultiAccountHistory(selfUserList)
      .then(result => result)
      .catch(err => console.error('err', err));
    const resolvedTxnList = await userTxnList;
    const messages = resolvedTxnList.reduce(async (payloadListP, value) => {
    var payloadList = await payloadListP;
    payloadList[value.user] = [];
    value.txnHistory.forEach((transaction) => {
      if (transaction[1].op[0] == accountHistoryConstants.customJson) {
        const txnJson = JSON.parse(transaction[1].op[1].json);
        if (txnJson[0] == accountHistoryConstants.MESSAGE && 
          ((txnJson[1].recipient == username && txnJson[1].sender == value.user) || 
          (userList.includes(txnJson[1].recipient) && username == value.user))) {
          payloadList[value.user] = payloadList[value.user].concat(
            [txnJson[1]].map((messageJson) => 
              ({
                sender: messageJson.sender,
                recipient: messageJson.recipient,
                messageText: decryptMessageText(messageJson.messageText, messageJson.id, userMemoPrivateKey),
                time: (typeof messageJson.time == 'string') ? parseInt(messageJson.time) : messageJson.time,
                id: messageJson.id,
              })
            )
          );
        }
      }
    });
    return payloadList;
  }, []);
  const messagePayload = await messages;
  const messageObject = {messages: {...messagePayload} };
  resolve(messageObject);
});

/**
 * Returns the string of a decrypted message, either from localStorage if it is already loaded, or from decrypting the string if not.
 * @param {string} messageText - The encrypted string to be decrypted, should start with #.
 * @param {string} id - The string UUIDv4 of the message for local retrieval if already decrypted.
 * @param {string} userMemoPrivateKey - The private memo key to be used for decrypting the message.
 * @returns {string} The plaintext of the encrypted message.
 */
export function decryptMessageText(messageText, id, userMemoPrivateKey) {
  if ((typeof messageText == 'string') && 
    (typeof id == 'string') &&
    (typeof userMemoPrivateKey == 'string')) {

    const retrievedMessage = localStorage.getItem(id);
    if(!_.isEmpty(retrievedMessage)) {
      return retrievedMessage; 
    } else {
      const decryptedMessage = wehelpjs.memo.decode(userMemoPrivateKey, messageText); 
      const plainText = decryptedMessage.slice(1, decryptedMessage.length);
      localStorage.setItem(id, plainText);
      return plainText;
    }
  } else {
    console.error("decryptMessageText Error: parameters invalid types.");
    return Error("decryptMessageText Error: parameters invalid types.");
  }
}

/**
 * Returns the string of a decrypted message, either from localStorage if it is already loaded, or from decrypting the string if not.
 * @param {string} username - The encrypted string to be decrypted, should start with #.
 * @param {string} userMemoPrivateKey - The private memo key to be used for decrypting the message.
 * @returns {string} The plaintext of the encrypted message.
 */
export const getStoredMessagesList = (username) => 
  new Promise(async (resolve, reject) => {
    const userMemoPrivateKey = retrieveMemoPrivateKey(username);
    const userMessagesKey = getUserMessageListKey(username);
    const storedMessagesList = localStorage.getItem(userMessagesKey);
    if(!_.isEmpty(storedMessagesList)) {
      const parsedMessages = jsonParse(storedMessagesList)
      resolve(parsedMessages); 
    } else {
      console.error("storedMessages Error: Storage not found.");
      reject({});
    }
  });

export async function storeMessagesList(username, messageObject) {
  const userMessagesKey = getUserMessageListKey(username);
  const newStorage = JSON.stringify(messageObject);
  localStorage.setItem(userMessagesKey, newStorage);
  return messageObject;
  }
  
/**
 * Gets a specified account object from the blockchain, using wehelpjs, and sets its profile image in localStorage.
 * @param {string} username - The account username to be retrieved.
 * @returns {Object} The user's account object.
 */
export function getAccountLite(username) {
  wehelpjs.api.getAccounts([username], (error, result) => {
    if (result.length) {
      var userAccount = result[0];
      var userJson = jsonParse(result[0].json);
      var userJsonAccount = {
        ...userJson,
        ...userAccount,
      }
      const profileImage = _.get(userJsonAccount, 'profile.profile_image', DEFAULT_PROFILE_IMAGE);
      if (!_.isEmpty(localStorage)) {
        const imageKey = getUserImageKey(username);
        localStorage.setItem(imageKey, profileImage);
      }
      return userJsonAccount;
      }
    }
  )
}

/**
 * Gets a specified account object from the blockchain, using weliterpcjs, and sets its profile image in localStorage.
 * @param {string} username - The account username to be retrieved.
 * @returns {Object} The user's account object.
 */
export const getAccount = username =>
  BlockchainAPI.sendAsync('get_accounts', [[username]]).then(result => {
    if (result.length) {
      var userAccount = result[0];
      var userJson = jsonParse(result[0].json);
      var userJsonAccount = {
        ...userJson,
        ...userAccount,
      }
      const profileImage = _.get(userJsonAccount, 'profile.profile_image', DEFAULT_PROFILE_IMAGE);
      if (!_.isEmpty(localStorage)) {
        const imageKey = getUserImageKey(username);
        localStorage.setItem(imageKey, profileImage);
      }
      return userJsonAccount;
    }
    throw new Error('User Not Found');
  }).catch(err=>{console.error('err', err)});


/**
 * Gets the list of all accounts on the blockchain, excluding network genesis accounts.
 * @returns {Array} Array of Account username strings.
 */
export const getNetworkUserListFromAPI = () =>
  BlockchainAPI.sendAsync('lookup_accounts',['0', 1000]).then(result => {
    if (result.length) {
      const networkUserList = result.filter(name => !name.match(/(webuilder|null|temp|builders)/));
      return networkUserList;
    }
    throw new Error('Lookup Accounts Failed');
  }).catch(err=>{console.error('err', err)});

/**
 * Returns an array of objects containing the top followed accounts.
 * @returns {Array} - The sorted list of account objects according to following count.
 */
export const getTopFollowedListFromAPI = () =>
  new Promise(async resolve => {
    const networkUserList = await getNetworkUserListFromAPI();
    const payloadArray = networkUserList.reduce(async (payloadListP, value) => {
      const payloadList = await payloadListP;
      const AccountFollowers = await getAccountWithFollowingCount(value);
      return payloadList.concat(AccountFollowers);
    }, []);
    const followList = await payloadArray;
    const sortedFollowList = await followList.sort((a,b) => b.follower_count-a.follower_count);
    resolve(sortedFollowList);
  });

/**
 * Returns an array of all account objects with following/followed counts.
 * @returns {Array} - The list of all account objects from the network.
 */
export async function getAllAccountsFromAPI() {
  const networkUserList = await getNetworkUserListFromAPI().catch(err => {console.error('err', err) });
  const payloadArray = await Promise.all(networkUserList.map(user => {
    return getAccountWithFollowingCount(user);
  }));
  return payloadArray;  
};

/**
 * Returns an array of the user account objects with the closest edit distance to the target name.
 * @param {string} search - The string of the account name being searched for.
 * @param {number} limit - the amount of search results to return in the array.
 * @returns {Array} The array of Account object search results, sorted the by shortest edit distance from the searched name.
 */
export const getUserSearchResults = (search, limit) => 
  new Promise(async resolve => {
    const networkUserList = await getNetworkUserListFromAPI().catch(err => {console.error('err', err) });
    const editDistanceList = networkUserList.map(user => ({user, distance: getEditDistance(search, user) }));
    const sortedList = editDistanceList.sort((a,b) => a.distance - b.distance);
    const slicedList = sortedList.slice(0, limit);
    const searchPayload = await Promise.all(slicedList.map(user => { 
      return getAccountWithFollowingCount(user.user).catch(err=>{console.error('err', err)});
    }));
    resolve(searchPayload);
  });

/**
 * Returns an object with the following and follower count of an account.
 * @param {string} username - The account name to be accessed.
 * @returns {Object} Object containing the following_count and follower_count of the account.
 */
export const getFollowingCount = username =>
  BlockchainAPI.sendAsync('call', ['follow_api', 'get_follow_count', [username]]).catch(err=>{console.error('err', err)});

/**
 * Retrieves the a specified Account object, with integrated following_count and follower_count attributes.
 * @param {string} username - The string account username of the account to be returned. 
 * @returns {Object} Object containing the user's attributes, combined with the following_count and follower_count of the account.
 */
export const getAccountWithFollowingCount = username =>
  Promise.all([getAccount(username), getFollowingCount(username)]).then(([account, following]) => ({
    ...account,
    following_count: following.following_count,
    follower_count: following.follower_count,
  }));

/**
 * Gets the list of accounts that a username follows.
 * @param {string} username - The username of the account.
 * @param {string} startForm  - The starting point of the user's followed list
 * @param {string} type -  The type of follower connection to be retrieved.
 * @param {number} limit  - The amount of followed accounts to be returned.
 * @returns {Array} The array of usernames that an account follows.
 */
export const getFollowing = (username, startForm = '', type = 'blog', limit = 100) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_following',
    [username, startForm, type, limit],
  ]).then(result => result.map(user => user.following)).catch(err=>{console.error('err', err)});

/**
 * Gets the list of accounts that a follow a specified username.
 * @param {string} username - The username of the account
 * @param {string} startForm the starting point of the user's followed accounts
 * @param {string} type  - The type of follower connection to be retrieved.
 * @param {number} limit - The amount of follower accounts to be returned.
 * @returns {Array} The array of usernames that follow an account.
 */
export const getFollowers = (username, startForm = '', type = 'blog', limit = 100) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_followers',
    [username, startForm, type, limit],
  ]).then(result => result.map(user => user.follower)).catch(err=>{console.error('err', err)});

/**
* Returns a list containing the names of all accounts that follow a given account. 
* @param {string} username - The username of the account to be accessed.
* @returns {Array} Array of all the account names that are followers of the specified username.
*/
export const getAllFollowers = username =>
  new Promise(async resolve => {
    const following = await getFollowingCount(username);
    const chunkSize = 100;
    const limitArray = Array.fill(
      Array(Math.ceil(following.follower_count / chunkSize)),
      chunkSize,
    );
    const list = limitArray.reduce(async (currentListP, value) => {
      const currentList = await currentListP;
      const startForm = currentList[currentList.length - 1] || '';
      const followers = await getFollowers(username, startForm, 'blog', value);
      return currentList.slice(0, currentList.length - 1).concat(followers);
    }, []);
    resolve(list);
});

/**
* Returns a list containing the names of all accounts that are following a given account. 
* @param {string} username - The username of the account to be accessed.
* @returns {Array} Array of all the account names that the specified username is following.
*/
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

/**
 * Finds if a user follows another specified user.
 * @param {string} currentUsername The username of the current account.
 * @param {string} username The username of the account to be checked for a follow connection.
 * @returns {Object} The following object of the accounts, if one is found.
 */
export const currentUserFollowsUser = (currentUsername, username) =>
  BlockchainAPI.sendAsync('call', [
    'follow_api',
    'get_following',
    [username, currentUsername, 'blog', 1],
  ]).catch(err=>{console.error('err', err)});

/**
 * Returns an object of the accounts that are following, followers of, and mutual followers of a user.
 * @param {string} username - The username to be accessed.
 * @returns {Object} Object containing the arrays of the followers, following, and mutual accounts of the user.
 */
export const getMutualFollowersList = (username) =>
  Promise.all([getAllFollowing(username), getAllFollowers(username)])
    .then(([following, followers]) => ({
      followers: followers, 
      following: following,
      mutual: following.filter((account) => followers.includes(account)),
    }))
    .catch(err=>console.error('err', err));

/**
 * Retrieves a list of the user's most recent transactions.
 * @param {string} account - The account being accessed.
 * @param {number} from - The starting index of transactions to be returned.
 * @param {number} limit - The amount of transactions to be returned.
 * @returns {Array} Array containing up to {limit} most recent transactions from the user's transaction history.
 */
export const getAccountHistory = (account, from = -1, limit = defaultAccountLimit) =>
  BlockchainAPI.sendAsync('get_account_history', [account, from, limit]).catch(err=>{console.error('err', err)});

/**
 * Retrieves an object containing multiple account's transaction histories. 
 * @param {Array} userList - The Array of usernames to retrieve the transaction history from.
 * @returns {Array} An array of objects containing all user's transaction history arrays.
 */
export const getMultiAccountHistory = (userList) =>
  Promise.all(userList.map(user => { 
    return getAccountHistory(user)
    .then(result => {return {user: user, txnHistory: result};
    })
    .catch(err=>console.error('err', err));
  }))
  .then(result => {return result;})
  .catch(err=>console.error('err', err));

/**
 * Returns the Dynamic Global Properties Object from the blockchain.
 */
export const getDynamicGlobalProperties = () =>
  BlockchainAPI.sendAsync('get_dynamic_global_properties', []).catch(err=>{console.error('err', err)});

/**
 * Finds the transaction object corresponding to a specified transaction ID.
 * @param {string} txid - The Transaction ID of the transaction to be retrieved.
 * @returns {Object} The Transaction object.
 */
export const getTransactionByID = (txid) =>
  BlockchainAPI.sendAsync('get_transaction', [txid]).catch(err=>{console.error('err', err)});

/**
 * Finds a block object corresponding to a specified block number.
 * @param {number} block_num -  The Block number of the block to be retrieved.
 * @returns {Object} The Block object.
 */
export const getBlockFromNumber = (block_num) =>
  BlockchainAPI.sendAsync('get_block', [block_num]).catch(err=>{console.error('err', err)});

/**
 * Returns an Array of the 10 most recent block objects from the blockchain. 
 */
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

/**
 * Determines whether a transaction type is valid to be displayed in the user's wallet.
 * @param {string} actionType - String of the action type being classified.
 * @returns {bool}  Whether the action is a wallet transaction.
 */
export const isWalletTransaction = actionType =>
  actionType === accountHistoryConstants.TRANSFER ||
  actionType === accountHistoryConstants.transferTMEtoSCOREfund ||
  actionType === accountHistoryConstants.cancelTransferFromSavings ||
  actionType === accountHistoryConstants.transferFromSavings ||
  actionType === accountHistoryConstants.transferToSavings ||
  actionType === accountHistoryConstants.delegateSCORE ||
  actionType === accountHistoryConstants.claimRewardBalance;

/**
 * 
 * @param {string} name  - The username of the account being accessed.
 * @param {number} limit - The amount of account reputations to return.
 * @returns {Array} The list of accounts and thier reputations.
 */
export const getAccountReputation = (name, limit = 20) =>
  BlockchainAPI.sendAsync('call', ['follow_api', 'get_account_reputations', [name, limit]]).catch(err=>{console.error('err', err)});

/**
 * Returns the edit distance between two strings.
 * @param {string} a The first string
 * @param {string} b The comparision string
 * @returns {number} The edit distance between the strings.
 * @source https://gist.github.com/andrei-m/982927/0efdf215b00e5d34c90fdc354639f87ddc3bd0a5
 */
export function getEditDistance(a,b) {
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
};

/** Creates a URL for processing and signing a transfer transaction.
 * @param {Object} params Object containing the sender, recipient and amount of currency for transfer.
 * @param {string} redirectUri String of the CallBack URL for the transfer transaction.
 * @returns {string} The URL leading to the generated transfer transaction.
 */
export const generateTransferURL = (params, redirectUri) => {
  var url = '/sign/transfer?' ;
  url += Object.keys(params).map((key) => {
    return key + '=' + encodeURIComponent(params[key])})
      .join('&');
  url += redirectUri ? '&redirect_uri=' + encodeURIComponent(redirectUri) : '';
  return url;
}

/** Creates a URL for signing and broadcasting a transaction.
 * @param {string} operation The string of the operation to be used for the transaction.
 * @param {Object} params Object containing the paramters of the transaction.
 * @param {string} redirectUri String of the CallBack URL for the transaction.
 * @returns {string} The URL leading to sign and broadcast the generated transaction.
 */
export const generateSignURL = (operation, params, redirectUri) => {
  var url = '/sign/'+operation+'?';
  url += Object.keys(params).map((key) => {
    return key + '=' + encodeURIComponent(params[key])})
      .join('&');
  url += redirectUri ? '&redirect_uri=' + encodeURIComponent(redirectUri) : '';
  return url;
}