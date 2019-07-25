import React from 'react';
import PropTypes from 'prop-types';
import embedjs from 'embedjs';
import _ from 'lodash';
import PostFeedEmbed from './PostFeedEmbed';
import BodyShort from './BodyShort';
import { jsonParse } from '../../helpers/formatter';
import { getContentImages, dropCategory, isPostTaggedPrivate } from '../../helpers/postHelpers';
import {
  getPositions,
  postWithPicture,
  postWithAnEmbed,
} from './StoryHelper';
import { getHtml } from './Body';
import { getProxyImageURL } from '../../helpers/image';
import { Tag, Icon } from 'antd';
import { decryptWithMemoKeypair, decryptAES, getUserMemoKey } from '../../helpers/apiHelpers';


const StoryPreview = ({ post, showImagesOnly, username }) => {
  const json = jsonParse(post.json);
  let image = json.image;
  let accessList = '';
  let userAccess = false;
  let decryptionKey = '';
  let body = post.body;
  const storageKey = getUserMemoKey(username);

  if (json && json.accessList && json.accessList[username] && isPostTaggedPrivate(post) && !_.isEmpty(localStorage.getItem(storageKey))) {
    userAccess = true;
    accessList = json.accessList;
    decryptionKey = decryptWithMemoKeypair(username, accessList[username]);
    body = decryptAES(post.body, decryptionKey);
    image = decryptAES(json.image, decryptionKey).split(',');
  };

  let imagePath = '';
  
  if (json && image && image[0]) {
    imagePath = getProxyImageURL(image[0], 'preview');
  } else {
    const contentImages = getContentImages(body);
    if (contentImages.length) {
      imagePath = getProxyImageURL(contentImages[0], 'preview');
    }
  }

  const embeds = embedjs.getAll(body, { height: '100%' });
  const video = json && json.video;
  let hasVideo = false;
  if (_.has(video, 'content.videohash') && _.has(video, 'info.snaphash')) {
    const author = _.get(video, 'info.author', '');
    const permlink = _.get(video, 'info.permlink', '');
    const dTubeEmbedUrl = `https://emb.d.tube/#!/${author}/${permlink}/true`;
    const dTubeIFrame = `<iframe width="100%" height="340" src="${dTubeEmbedUrl}" allowFullScreen></iframe>`;
    hasVideo = true;
    embeds[0] = {
      type: 'video',
      provider_name: 'DTube',
      embed: dTubeIFrame,
      thumbnail: getProxyImageURL(`https://ipfs.io/ipfs/${video.info.snaphash}`, 'preview'),
    };
  }

  const preview = {
    text: () => <BodyShort key="text" className="Story__content__body" body={body} />,

    embed: () => embeds && embeds[0] && <PostFeedEmbed key="embed" embed={embeds[0]} />,

    image: () => (
      <div key={imagePath} className="Story__content__img-container">
        <img alt="" src={imagePath} />
      </div>
    ),
    title: () => (
    <h2 key = {post.title} className="Story__content__title" >
            <div className="Story__title">
              {post.depth !== 0 && <Tag color="#4f545c">RE</Tag>}
              {post.title || post.root_title}
            </div>
    </h2>
    
    ),  
  };

  const htmlBody = getHtml(body, {}, 'text');
  const tagPositions = getPositions(htmlBody);
  const bodyData = [];

  if (hasVideo) {
    bodyData.push(preview.embed());
  } else if (postWithPicture(tagPositions, 100)) {
    bodyData.push(preview.image());
  } else if (postWithAnEmbed(tagPositions, 100)) {
    bodyData.push(preview.embed());
  } else if (imagePath !== '') {
    bodyData.push(preview.image());
  } 
    
  if (!showImagesOnly){
    bodyData.push(preview.title());
    bodyData.push(preview.text());
  }
  return <div>{bodyData}</div>;
};

StoryPreview.propTypes = {
  post: PropTypes.shape().isRequired,
};

export default StoryPreview;
