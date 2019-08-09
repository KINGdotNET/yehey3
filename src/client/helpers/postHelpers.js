import _ from 'lodash';
import { getHtml } from '../components/Story/Body';
import { extractImageTags, extractLinks } from './parser';
import { categoryRegex } from './regexHelpers';
import { jsonParse } from './formatter';
import changeCase from 'change-case';
import DMCA from '../../common/constants/dmca.json';
import whiteListedApps from './apps';
import { NSFWwords } from '../helpers/constants';

const appVersion = require('../../../package.json').version;

export const isPostDeleted = post => post.title === 'deleted';

export const isPostTaggedNSFW = post => {
  if (post.parent_permlink === 'nsfw') return true;

  const postjson = _.attempt(JSON.parse, post.json);

  if (_.isError(postjson)) return false;

  return _.includes(postjson.tags, 'nsfw');
};

/**
 * Determines whether a string contains any NSFW element substrings.
 * @param {string} string The string to examined.
 * @returns True or false for string input.
 */
export function isStringNSFW(string) {
  for (const word of NSFWwords) {
    if (string.includes(word)) {
      return true;
    }
  };
  return false;
};

/**
 * Determines whether an array of strings contain NSFW name values.
 * @param {array} array The array to be filtered.
 * @returns True or false for post input.
 */
export function filterNSFWwords(array) {
  if (array[0]) {
    return array.filter(p => !isStringNSFW(p));
  }
  else {
    return [];
  }
};

/**
 * Determines whether a post contains the tag "private" for filtering from feed.
 * @param post the post to be examined.
 * @returns True or false for post input.
 */
export const isPostTaggedPrivate = (post, username) => {

  const postjson = _.attempt(JSON.parse, post.json);

  let privatePost = false;

  if (_.isError(postjson)) return false;

  if (postjson.accessList && !postjson.accessList[username] && _.includes(postjson.tags, 'private')) {
    privatePost = true;
  }
  return privatePost;
};

export function dropCategory(url) {
  return url.replace(categoryRegex, '');
}

/**
 * Gets app data from a post.
 * Only Returns app info from apps whitelisted in apps.json
 * @param post
 * @returns An empty object if app is not valid otherwise an object with {appName: String, version: String}
 */
export function getAppData(post) {
  try {
    const json = jsonParse(post.json);
    const appDetails = _.get(json, 'app', '');
    const appData = _.split(appDetails, '/');
    const appKey = _.get(appData, 0, '');
    const version = _.get(appData, 1, '');

    if (whiteListedApps[appKey]) {
      return {
        appName: whiteListedApps[appKey],
        version,
      };
    }
    return {};
  } catch (error) {
    return {};
  }
}

export const isBannedPost = post => {
  const bannedAuthors = _.get(DMCA, 'authors', []);
  const bannedPosts = _.get(DMCA, 'posts', []);
  const postURL = `${post.author}/${post.permlink}`;

  return _.includes(bannedAuthors, post.author) || _.includes(bannedPosts, postURL);
};

export function getContentImages(content, parsed = false) {
  const parsedBody = parsed ? content : getHtml(content, {}, 'text');

  return extractImageTags(parsedBody).map(tag =>
    _.unescape(tag.src.replace('https://steemitimages.com/0x0/', '')),
  );
}

export function createPostMetadata(body, board, tags, link, commentPrice, nsfwtag, access, language, oldMetadata = {}) {
  let metaData = {
    community: 'weyoume',
    app: `alpha.weyoume/${appVersion}`,
    format: 'markdown',
  };

  metaData = {
    ...oldMetadata,
    ...metaData,
  };

  const users = [];
  const userRegex = /@([a-zA-Z.0-9-]+)/g;
  let matches;

  // eslint-disable-next-line no-cond-assign
  while ((matches = userRegex.exec(body))) {
    if (users.indexOf(matches[1]) === -1) {
      users.push(matches[1]);
    }
  }

  const parsedBody = getHtml(body, {}, 'text');
  const images = getContentImages(parsedBody, true);
  const normalizedTags = _.compact(tags).map((tag) => {return changeCase.lowerCase(tag)} );

  let boardWithTags = [board, ...normalizedTags];
  if (nsfwtag) {
    boardWithTags = [...boardWithTags, 'nsfw'];
  }
  if (access == 'private'){
    boardWithTags = [...boardWithTags, 'private'];
  }
  boardWithTags = _.uniq([...boardWithTags, language]);

  metaData.tags = boardWithTags;
  metaData.users = users;
  metaData.image = images;
  metaData.board = board;
  metaData.link = link;
  metaData.commentPrice = commentPrice;
  metaData.language = language;
  metaData.nsfw = nsfwtag;

  return metaData;
}
