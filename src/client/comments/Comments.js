import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { find } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getHasDefaultSlider } from '../helpers/user';
import {
  getAuthenticatedUser,
  getComments,
  getCommentsList,
  getCommentsPendingVotes,
  getIsAuthenticated,
  getAuthenticatedUserName,
  getVotingPower,
  getRewardFund,
  getVotePercent,
  getRewriteLinks,
  getUsersTransactions,
  getUsersAccountHistory,
  getUsersAccountHistoryLoading,
  getLoadingMoreUsersAccountHistory,
} from '../reducers';
import CommentsList from '../components/Comments/Comments';
import * as commentsActions from './commentsActions';
import { getAccount } from '../user/usersActions';
import {
  getUserAccountHistory,
  getMoreUserAccountHistory,
} from '../wallet/walletActions';

import { notify } from '../app/Notification/notificationActions';
import { getUserDetailsKey } from '../helpers/stateHelpers';
import './Comments.less';
import { openTransfer } from '../wallet/walletActions'
import ellipsis from 'text-ellipsis';
import { jsonParse } from '../helpers/formatter';
import { FormattedMessage } from 'react-intl';

@withRouter
@connect(
  (state, ownProps) => ({
    user: getAuthenticatedUser(state),
    comments: getComments(state),
    commentsList: getCommentsList(state),
    pendingVotes: getCommentsPendingVotes(state),
    authenticated: getIsAuthenticated(state),
    username: getAuthenticatedUserName(state),
    sliderMode: getVotingPower(state),
    rewardFund: getRewardFund(state),
    defaultVotePercent: getVotePercent(state),
    rewriteLinks: getRewriteLinks(state),
    authenticatedUserName: getAuthenticatedUserName(state),
    usersTransactions: getUsersTransactions(state),
    usersAccountHistory: getUsersAccountHistory(state),
    usersAccountHistoryLoading: getUsersAccountHistoryLoading(state),
    loadingMoreUsersAccountHistory: getLoadingMoreUsersAccountHistory(state),
  }),
  dispatch =>
    bindActionCreators(
      {
        getComments: commentsActions.getComments,
        voteComment: (id, percent, vote) => commentsActions.likeComment(id, percent, vote),
        sendComment: (parentPost, body, isUpdating, originalPost) =>
          commentsActions.sendComment(parentPost, body, isUpdating, originalPost),
        openTransfer: (comment) => openTransfer(comment),
        notify,
        getUserAccountHistory,
        getMoreUserAccountHistory,
        getAccount,
      },
      dispatch,
    )
)

export default class Comments extends React.Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    getUserAccountHistory: PropTypes.func.isRequired,
    getMoreUserAccountHistory: PropTypes.func.isRequired,
    getAccount: PropTypes.func.isRequired,
    usersTransactions: PropTypes.shape().isRequired,
    usersAccountHistory: PropTypes.shape().isRequired,
    usersAccountHistoryLoading: PropTypes.bool.isRequired,
    loadingMoreUsersAccountHistory: PropTypes.bool.isRequired,
    authenticatedUserName: PropTypes.string.isRequired,

    user: PropTypes.shape().isRequired,
    rewardFund: PropTypes.shape().isRequired,
    defaultVotePercent: PropTypes.number.isRequired,
    rewriteLinks: PropTypes.bool.isRequired,
    sliderMode: PropTypes.oneOf(['on', 'off', 'auto']),
    username: PropTypes.string,
    post: PropTypes.shape(),
    comments: PropTypes.shape(),
    commentsList: PropTypes.shape(),
    pendingVotes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        percent: PropTypes.number,
      }),
    ),
    show: PropTypes.bool,
    notify: PropTypes.func,
    getComments: PropTypes.func,
    voteComment: PropTypes.func,
    sendComment: PropTypes.func,
    openTransfer: PropTypes.func,
  };

  static defaultProps = {
    authenticatedUserName: '',
    sliderMode: 'auto',
    post: {},
    comments: {},
    commentsList: {},
    pendingVotes: [],
    usersTransactions: [],
    show: false,
    notify: () => {},
    getComments: () => {},
    voteComment: () => {},
    sendComment: () => {},
    openTransfer: () => {},
    getUserAccountHistory: () => {},
    getMoreUserAccountHistory: () => {},
    getAccount: () => {},

  };

  state = {
    sortOrder: 'trending',
  };

  componentDidMount() {
    const {
      usersTransactions,
      user,
      authenticatedUserName,
    } = this.props;

    const username = authenticatedUserName;

    if (this.props.show && this.props.post.children !== 0) {
      this.props.getComments(this.props.post.id);
    }

    if (_.isEmpty(user)) {
      this.props.getAccount(username);
    }

    if (_.isEmpty(usersTransactions[getUserDetailsKey(username)])) {
      //console.log("got user account history");
      this.props.getUserAccountHistory(username);
    }
    //console.log("Component did mount - Username:", username, user, usersTransactions);
  }

  componentWillReceiveProps(nextProps) {
    //console.log("Component will receive props");
    const { post, show, usersAccountHistoryLoading} = this.props;

    if (!usersAccountHistoryLoading && (nextProps.show && (nextProps.post.id !== post.id || !show) || 
    (nextProps.usersTransactions.length != this.props.usersTransactions.length) || 
    (nextProps.authenticatedUserName != this.props.authenticatedUserName))) {
      this.props.getComments(nextProps.post.id);
      this.props.getUserAccountHistory(nextProps.authenticatedUserName);
      //console.log("got user account history");

    }
  }

  getNestedComments = (commentsObj, commentsIdArray, nestedComments) => {
    const newNestedComments = nestedComments;
    commentsIdArray.forEach(commentId => {
      const nestedCommentArray = commentsObj.childrenById[commentId];
      if (nestedCommentArray.length) {
        newNestedComments[commentId] = nestedCommentArray.map(id => commentsObj.comments[id]);
        this.getNestedComments(commentsObj, nestedCommentArray, newNestedComments);
      }
    });
    return newNestedComments;
  };

  handleLikeClick = (id, weight = 10000) => {
    const { commentsList, sliderMode, user, defaultVotePercent } = this.props;
    const userVote = find(commentsList[id].active_votes, { voter: user.name }) || {};

    if (sliderMode === 'on' || (sliderMode === 'auto' && getHasDefaultSlider(user))) {
      this.props.voteComment(id, weight, 'like');
    } else if (userVote.percent > 0) {
      this.props.voteComment(id, 0, 'like');
    } else {
      this.props.voteComment(id, defaultVotePercent, 'like');
    }
  };

  handleDislikeClick = id => {
    const { commentsList, pendingVotes, user } = this.props;
    if (pendingVotes[id]) return;

    const userVote = find(commentsList[id].active_votes, { voter: user.name }) || {};

    if (userVote.percent < 0) {
      this.props.voteComment(id, 0, 'dislike');
    } else {
      this.props.voteComment(id, -10000, 'dislike');
    }
  };

  handleTransferClick = comment => {
    this.transfer = {
      to: comment.author,
      amount: 1,
      memo: "Tip for comment: " + ellipsis(comment.body, 50, { ellipsis: '…' }),
      currency: 'TME',
      type: 'transfer',
    };
    this.props.openTransfer(this.transfer);
  }

  handleCommentPayment(e, post) {
    e.preventDefault();
    const metaData = jsonParse(post.json);
    //console.log("metaData:", metaData);
    const transferQuery = {
      to: post.author,
      amount: `${metaData.commentPrice} TME`,
      memo: `@${post.author}/${post.permlink}`,
    };
    const win = window.open(weauthjsInstance.sign('transfer', transferQuery), '_blank');
    win.focus();
  }


  render() {
    const {
      user,
      post,
      comments,
      pendingVotes,
      show,
      sliderMode,
      rewardFund,
      defaultVotePercent,
      rewriteLinks,
      usersTransactions,
      usersAccountHistoryLoading,
      authenticatedUserName,
    } = this.props;
    
    const postId = post.id;
    const postAuthor = post.author;
    const postPermlink = post.permlink;

    const metaData = jsonParse(post.json);

    let rootLevelComments = [];

    const userKey = getUserDetailsKey(user.name);
    const transactions = _.get(usersTransactions, userKey, []);
    let commentsActive = false;
    let paymentAcknowledged = false;
    let commentPrice = 0;

    if (postAuthor == authenticatedUserName) {
      commentsActive = true;
    }
    
    if (metaData.commentPrice) {
      commentPrice = parseFloat(metaData.commentPrice);
    }
    const transfers = transactions.filter(txn => txn.op[0] == "transfer");
    const validPayments = transfers.filter(txn => 
      (txn.op[1].from == user.name) && 
      (txn.op[1].to == postAuthor) && 
      (txn.op[1].memo == `@${postAuthor}/${postPermlink}`) &&
      (parseFloat(txn.op[1].amount) >= commentPrice));
    
    if (commentPrice > 0) {
      //console.log("Active commentPrice is:", commentPrice);
      if (validPayments.length >= 1) {
        commentsActive = true;
        paymentAcknowledged = true;
        //console.log("commentPrice paid:", validPayments);
    }} else {
      commentsActive = true;
    }

    //console.log("transfers:", transfers);
    //console.log("comment price:", commentPrice);
    //console.log("Comments Active:", commentsActive);

    const parentNode = comments.childrenById[postId];

    if (parentNode instanceof Array) {
      rootLevelComments = parentNode.map(id => comments.comments[id]);
    }

    let commentsChildren = {};

    if (rootLevelComments && rootLevelComments.length) {
      commentsChildren = this.getNestedComments(comments, comments.childrenById[postId], {});
    }

    return (

    <div>
      {paymentAcknowledged && 
        <div className="Comments__paymentAcknowledged">
          <i className="iconfont icon-right" />
          <FormattedMessage id="payment_acknowledged" defaultMessage="Comment Payment Received - Thank you." /> 
        </div>
      }
      {rootLevelComments && (
        <CommentsList
          user={user}
          parentPost={post}
          comments={comments.comments}
          rootLevelComments={rootLevelComments}
          commentsChildren={commentsChildren}
          authenticated={this.props.authenticated}
          commentsActive={commentsActive}
          username={this.props.username}
          pendingVotes={pendingVotes}
          loading={comments.isFetching}
          loaded={comments.isLoaded}
          show={show}
          notify={this.props.notify}
          rewardFund={rewardFund}
          sliderMode={sliderMode}
          defaultVotePercent={defaultVotePercent}
          rewriteLinks={rewriteLinks}
          onLikeClick={this.handleLikeClick}
          onDislikeClick={this.handleDislikeClick}
          onSendComment={this.props.sendComment}
          onTransferClick={this.handleTransferClick}
          onCommentPayment={this.handleCommentPayment}
          commentPrice={commentPrice}
        />
      )}
      </div>
    );
  }
}
