import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import Avatar from '../components/Avatar';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Icon } from 'antd';
import requiresLogin from '../auth/requiresLogin';
import { reload } from '../auth/authActions';
import MessageEditor from './MessageEditor';
import EmptyFeed from '../statics/EmptyFeed';
import ScrollToBottom from '../components/Utils/ScrollToBottom';
import ScrollToBottomOnMount from '../components/Utils/ScrollToBottomOnMount';
import uuidv4 from 'uuid/v4';
import Message from './Message';
import withEditor from '../components/Editor/withEditor';
import {
  getMessagesFromState, 
} from '../helpers/stateHelpers';
import {
  getMessagesList,
  getIsMessagesLoading,
  getAuthenticatedUser,
  getPendingMessagesList,
  getAuthenticatedUserName,
  getMutualList,
  getIsMessageSending,
  getIsMessagesLoaded,
  getIsAuthenticated,
  getFollowingFetched,
} from '../reducers';
import {
  createMessage,
  getMessages,
  getAllMessages,
  getStoredMessages,
} from './messageActions';
import { 
  getAccount,
} from '../user/usersActions';
import {
  getFollowing,
} from '../user/userActions';
import { openTransfer } from '../wallet/walletActions';
import { notify } from '../app/Notification/notificationActions';
import './Messages.less';

@injectIntl
@withRouter
@requiresLogin
@withEditor
@connect(
  (state, ownProps) => ({
    authenticated: getIsAuthenticated(state),
    loadingMessages: getIsMessagesLoading(state),
    loadedMessages: getIsMessagesLoaded(state),
    pendingMessages: getPendingMessagesList(state),
    sendingMessage: getIsMessageSending(state),
    messages: getMessagesList(state),
    user: getAuthenticatedUser(state),
    authenticatedUserName: getAuthenticatedUserName(state),
    mutualFollowers: getMutualList(state),
    followingFetched: getFollowingFetched(state),
    recipient: ownProps.match.params.recipient,
  }),
  {
    createMessage,
    getFollowing,
    getMessages,
    getAllMessages,
    getStoredMessages,
    reload,
    getAccount,
    notify,
    openTransfer,
  },
)


class Messages extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      messageFormText: '',
      messageRefreshTime: 5000,
      nRenderedMessages: 20,
      loadedAll: false,
    };

    this.handleSubmitMessage = this.handleSubmitMessage.bind(this);
  }

  static propTypes = {
    user: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    messages: PropTypes.shape().isRequired,
    pendingMessages: PropTypes.array.isRequired,
    intl: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    recipient: PropTypes.string,

    mutualFollowers: PropTypes.array.isRequired,
    followingFetched: PropTypes.bool.isRequired,
    loadingMessages: PropTypes.bool.isRequired,
    loadedMessages: PropTypes.bool.isRequired,
    sendingMessage: PropTypes.bool.isRequired,
    authenticated: PropTypes.bool.isRequired,
    authenticatedUserName: PropTypes.string,
    createMessage: PropTypes.func.isRequired,
    getMessages: PropTypes.func.isRequired,
    getAllMessages: PropTypes.func.isRequired,
    getStoredMessages: PropTypes.func.isRequired,
    reload: PropTypes.func,
    notify: PropTypes.func,
    getAccount: PropTypes.func,
    getFollowing: PropTypes.func,
    openTransfer: PropTypes.func,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,

  };
  
  static defaultProps = {
    user: {},
    recipientUser: {},
    messages: {},
    pendingMessages: [],
    mutualFollowers: [],

    loadingMessages: false,
    loadedMessages: false,
    authenticated: false,
    sendingMessage: false,
    followingFetched: false,
    authenticatedUserName: '',

    getMessages: () => {},
    getAllMessages: () => {},
    getStoredMessages: () => {},
    createMessage: () => {},
    reload: () => {},
    notify: () => {},
    getAccount: () => {},
    getFollowing: () => {},
    openTransfer: () => {},
    onImageUpload: () => {},
    onImageInvalid: () => {},
  };

  static async fetchData({ store, match }) {
    const { recipient } = match.params;
      return Promise.all([
        store.dispatch(this.props.getFollowing()),
     ]);
   }

  handleTransferClick = recipient => {
    this.transfer = {
      to: recipient,
      amount: 1,
      memo: '',
      currency: 'TME',
      type: 'transfer',
      callBack: window.location.href,
    };
    this.props.openTransfer(this.transfer);
  };

  handleSubmitMessage(recipient, messageText) {
    const messageData = 
    { 
      recipient: recipient, 
      messageText: messageText, 
    }
    return this.props.createMessage(messageData);
  };

  componentWillReceiveProps(nextprops) {
    const diffRecipient = this.props.match.params.recipient != nextprops.match.params.recipient;
    const diffAuthenticated = this.props.authenticated != nextprops.authenticated;
    const diffMutual = this.props.mutualFollowers.join() != nextprops.mutualFollowers.join();
    const { loadedAll } = this.state;

    if (!loadedAll && !_.isEmpty(localStorage) && (diffRecipient || diffMutual || diffAuthenticated)) {
      this.setState({
        loadedAll: true,
      });
      this.props.getStoredMessages();
    }
    
    if (loadedAll && !_.isEmpty(localStorage) && (diffRecipient || diffMutual || diffAuthenticated)) { 
      this.props.getMessages(nextprops.match.params.recipient); 
    }
  }

  componentDidMount() {

    const { 
      user, 
      authenticatedUserName, 
      messages, 
      sendingMessage, 
      loadedMessages, 
      loadingMessages,
      recipient,
      mutualFollowers,
    } = this.props;

    const { 
      messageRefreshTime,
    } = this.state;

    if (_.isEmpty(user)) {
      this.props.getAccount(authenticatedUserName);
    }

    if (!_.isEmpty(localStorage) && !_.isEmpty(mutualFollowers)) {
      this.props.getAllMessages();
    }
    
    this.interval = setInterval(() => {
      if(!loadingMessages && !sendingMessage) {
        this.props.getMessages(recipient);
      }
    }, messageRefreshTime);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { 
      messages,
      intl,
      loadingMessages, 
      loadedMessages, 
      sendingMessage,
      authenticated, 
      authenticatedUserName,
      recipient,
      user
    } = this.props;

    var content = [];

    content = getMessagesFromState(authenticatedUserName, recipient, messages);
    
    const empty = _.isEmpty(messages);
    const displayEmptyFeed = empty && loadedMessages && !loadingMessages;
    const ready = loadedMessages && !loadingMessages && authenticated;

      return (
        <div className="feed-layout container">
        <Helmet>
          <title>
            {`Messages - ${recipient}`}
          </title>
        </Helmet>
        <ScrollToBottom/>
        <ScrollToBottomOnMount />
          <div className="center">
            <div className="Messages">
              <div className="Messages__title">
                <div className="Messages__backlink">
                  <Link to="/messages">
                    <i className="iconfont icon-return" />
                  </Link>
                </div>
                <div className="Messages__avatar">
                  <Avatar username={recipient} size={40} />
                </div>
                <div className="Messages_titletext">
                  <h1>
                    {recipient}
                  </h1>
                </div>
              </div>
              <div className="Messages__content">
                {content.map(message => 
                  <Message
                    sender={message.sender}
                    recipient={message.recipient}
                    messageText={message.messageText}
                    time={message.time}
                    id={message.id}
                    username={user.name}
                    key={message.id}
                    loadingMessages={loadingMessages} 
                  />)}
                {sendingMessage && 
                <div>
                  <Icon type="loading" />
                </div>}
              </div>
              {displayEmptyFeed && <EmptyFeed />}
              <div className="Message__Editor" >
                <MessageEditor
                  intl={intl}
                  username={authenticatedUserName}
                  recipient={recipient}
                  onSubmit={this.handleSubmitMessage}
                  submitted={this.state.messageSubmitted}
                  inputValue={this.state.messageFormText}
                  onImageUpload={this.props.onImageUpload}
                  onImageInvalid={this.props.onImageInvalid}
                  onTransferClick={this.handleTransferClick}
                  inputId={'message-inputfile'}
                  />
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default Messages;
