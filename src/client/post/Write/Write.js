import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { replace } from 'react-router-redux';
import _ from 'lodash';
import 'url-search-params-polyfill';
import { injectIntl } from 'react-intl';
import uuidv4 from 'uuid/v4';
import improve from '../../helpers/improve';
import { createPostMetadata } from '../../helpers/postHelpers';
import { rewardsValues } from '../../../common/constants/rewards';
import { boardValues } from '../../../common/constants/boards';
import LastDraftsContainer from './LastDraftsContainer';
import DeleteDraftModal from './DeleteDraftModal';

import {
  getAuthenticatedUser,
  getDraftPosts,
  getIsEditorLoading,
  getIsEditorSaving,
  getUpvoteSetting,
  getRewardSetting,
  getBoardSetting,
  getLanguageSetting,
  getAccessListSetting,
  getAccessSetting,
  getMutualList,
} from '../../reducers';

import { createPost, saveDraft, newPost } from './editorActions';
import Editor from '../../components/Editor/Editor';
import Affix from '../../components/Utils/Affix';

@injectIntl
@withRouter
@connect(
  (state, props) => ({
    user: getAuthenticatedUser(state),
    mutuallist: getMutualList(state),
    draftPosts: getDraftPosts(state),
    loading: getIsEditorLoading(state),
    saving: getIsEditorSaving(state),
    draftId: new URLSearchParams(props.location.search).get('draft'),
    upvoteSetting: getUpvoteSetting(state),
    rewardSetting: getRewardSetting(state),
    boardSetting: getBoardSetting(state),
    languageSetting: getLanguageSetting(state),
    accessList: getAccessListSetting(state),
    access: getAccessSetting(state),
  }),
  {
    createPost,
    saveDraft,
    newPost,
    replace,
  },
)
class Write extends React.Component {
  static propTypes = {
    user: PropTypes.shape().isRequired,
    mutuallist: PropTypes.array,
    draftPosts: PropTypes.shape().isRequired,
    loading: PropTypes.bool.isRequired,
    intl: PropTypes.shape().isRequired,
    saving: PropTypes.bool,
    draftId: PropTypes.string,
    upvoteSetting: PropTypes.bool,
    nsfwtag: PropTypes.bool,
    rewardSetting: PropTypes.string,
    boardSetting: PropTypes.string,
    languageSetting: PropTypes.string,
    accessList: PropTypes.array,
    access: PropTypes.string,
    newPost: PropTypes.func,
    createPost: PropTypes.func,
    saveDraft: PropTypes.func,
    replace: PropTypes.func,
  };

  static defaultProps = {
    saving: false,
    draftId: null,
    upvoteSetting: false,
    nsfwtag: false,
    rewardSetting: rewardsValues.half,
    boardSetting: boardValues.random,
    languageSetting: "en",
    access: 'public',
    accessList: [],
    mutuallist: [],
    newPost: () => {},
    createPost: () => {},
    saveDraft: () => {},
    notify: () => {},
    replace: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      initialTitle: '',
      initialTopics: [],
      initialBoard: this.props.boardSetting,
      initialBody: '',
      initialLink: '',
      initialCommentPrice: '0',
      initialReward: this.props.rewardSetting,
      initialUpvote: this.props.upvoteSetting,
      initialAccessList: _.uniq(this.props.accessList.concat(this.props.mutuallist)),
      initialAccess: this.props.access,
      initialNSFWtag: false,
      initialUpdatedDate: Date.now(),
      isUpdating: false,
      showModalDelete: false,
    };
  }

  componentDidMount() {
    this.props.newPost();
    const { draftPosts, draftId } = this.props;
    const draftPost = draftPosts[draftId];

    if (draftPost) {
      let tags = [];
      if (_.isArray(draftPost.json.tags)) {
        tags = draftPost.json.tags;
      }

      if (draftPost.permlink) {
        this.permlink = draftPost.permlink;
      }
      if (draftPost.parentPermlink) {
        this.parentPermlink = draftPost.json.board || draftPost.json.tags[0];
      }

      if (draftPost.originalBody) {
        this.originalBody = draftPost.originalBody;
      }

      if (draftPost.originalLink) {
        this.originalLink = draftPost.originalLink;
      }

      this.setState({
        initialTitle: draftPost.title || '',
        initialBoard: draftPost.board || '',
        initialTopics: tags || [],
        initialBody: draftPost.body || '',
        initialLink: draftPost.link || '',
        initialCommentPrice: draftPost.commentPrice || '0',
        initialReward: draftPost.reward,
        initialUpvote: draftPost.upvote,
        initialNSFWtag: draftPost.nsfwtag,
        initialAccessList: draftPost.accessList || this.state.initialAccessList,
        initialAccess: draftPost.access || this.state.initialAccess,
        initialUpdatedDate: draftPost.lastUpdated || Date.now(),
        isUpdating: draftPost.isUpdating || false,
      });
    }

    if (draftId) {
      this.draftId = draftId;
    } else {
      this.draftId = uuidv4();
    }
  }

  componentWillReceiveProps(nextProps) {
    const newDraft = nextProps.draftId === null;
    const differentDraft = this.props.draftId !== nextProps.draftId;
    if (differentDraft && newDraft) {
      this.draftId = uuidv4();
      this.setState({
        initialTitle: '',
        initialBoard: nextProps.boardSetting,
        initialTopics: [],
        initialBody: '',
        initialLink: '',
        initialCommentPrice: '0',
        initialAccessList: nextProps.accessList,
        initialAccess: nextProps.access,
        initialReward: nextProps.reward,
        initialUpvote: nextProps.upvoteSetting,
        initialNSFWtag: false,
        initialUpdatedDate: Date.now(),
        isUpdating: false,
        showModalDelete: false,
      });
    } else if (differentDraft) {
      const { draftPosts, draftId } = nextProps;
      const draftPost = _.get(draftPosts, draftId, {});
      const initialTitle = _.get(draftPost, 'title', '');
      const initialBoard = _.get(draftPost, 'json.tags[0]', '');
      const initialBody = _.get(draftPost, 'body', '');
      const initialLink = _.get(draftPost, 'json.link', '');
      const initialAccess = _.get(draftPost, 'access', this.state.access);
      const initialCommentPrice = _.get(draftPost, 'json.commentPrice', '0');
      const initialTopics = _.get(draftPost, 'json.tags', []);
      const initialAccessList = _.get(draftPost, 'accessList', this.state.initialAccessList);
      this.draftId = draftId;
      this.setState({
        initialTitle,
        initialBody,
        initialAccessList,
        initialAccess,
        initialLink,
        initialCommentPrice,
        initialTopics,
        initialBoard,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (_.get(this.props, 'location.search') !== _.get(prevProps, 'location.search')) {
      this.saveDraft.cancel();
    }
  }

  onDeleteDraft = () => this.props.replace('/editor');

  onDelete = () => this.setState({ showModalDelete: true });

  onSubmit = form => {
    const data = this.getNewPostData(form);
    data.body = improve(data.body);
    if (this.props.draftId) {
      data.draftId = this.props.draftId;
    }
    this.props.createPost(data);
  };

  getNewPostData = form => {
    const data = {
      body:form.body, 
      accessList: form.accessList || this.props.accessList,
      access: form.access || this.state.access,
      title: form.title,
      reward: form.reward,
      upvote: form.upvote,
      nsfwtag: form.nsfwtag,
      board: form.board || form.topics[0],
      link: form.link,
      commentPrice: form.commentPrice,
      lastUpdated: Date.now(),
    };

    data.parentAuthor = '';
    data.author = this.props.user.name || '';

    if (data.title && !this.permlink) {
      data.permlink = _.kebabCase(data.title);
    } else {
      data.permlink = this.permlink;
    }
    
    if (this.state.isUpdating) data.isUpdating = this.state.isUpdating;

    const oldMetadata =
      this.props.draftPosts[this.draftId] && this.props.draftPosts[this.draftId].json;

    data.parentPermlink = form.board.length ? form.board : form.topics[0];
    data.json = createPostMetadata(data.body, form.board, form.topics, form.link, form.commentPrice, form.nsfwtag, form.access, this.props.languageSetting, oldMetadata);

    if (this.originalBody) {
      data.originalBody = this.originalBody;
    }

    if (this.originalLink) {
      data.originalLink = this.originalLink;
    }
    return data;
  };

  handleCancelDeleteDraft = () => this.setState({ showModalDelete: false });

  saveDraft = _.debounce(form => {
    if (this.props.saving) return;

    const data = this.getNewPostData(form);
    const postBody = data.body;
    const id = this.props.draftId;
    // Remove zero width space
    const isBodyEmpty = postBody.replace(/[\u200B-\u200D\uFEFF]/g, '').trim().length === 0;
    if (isBodyEmpty) return;

    const redirect = id !== this.draftId;

    this.props.saveDraft({ postData: data, id: this.draftId }, redirect, this.props.intl);
  }, 2000);

  render() {
    const { 
      initialTitle, 
      initialBoard, 
      initialTopics, 
      initialBody, 
      initialAccessList,
      initialAccess, 
      initialLink, 
      initialCommentPrice, 
      initialReward, 
      initialNSFWtag, 
      initialUpvote } = this.state;
    const { loading, saving, draftId } = this.props;

    return (
      <div className="shifted">
        <div className="post-layout container">
          <Affix className="rightContainer" stickPosition={77}>
            <div className="right">
              <LastDraftsContainer />
            </div>
          </Affix>
          <div className="center">
            <Editor
              user={this.user}
              ref={this.setForm}
              saving={saving}
              title={initialTitle}
              board={initialBoard}
              topics={initialTopics}
              body={initialBody}
              accessList={initialAccessList}
              access={initialAccess}
              link={initialLink}
              commentPrice={initialCommentPrice}
              reward={initialReward}
              upvote={initialUpvote}
              nsfwtag={initialNSFWtag}
              draftId={draftId}
              loading={loading}
              isUpdating={this.state.isUpdating}
              onUpdate={this.saveDraft}
              onSubmit={this.onSubmit}
              onDelete={this.onDelete}
            />
          </div>
          {this.state.showModalDelete && (
            <DeleteDraftModal
              draftIds={[draftId]}
              onDelete={this.onDeleteDraft}
              onCancel={this.handleCancelDeleteDraft}
            />
          )}
        </div>
      </div>
    );
  }
}

export default Write;
