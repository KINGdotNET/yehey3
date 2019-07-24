import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Icon } from 'antd';
import requiresLogin from '../auth/requiresLogin';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import { reload } from '../auth/authActions';
import MessageUser from './MessageUser';
import {
storeMessagesList,
} from '../helpers/apiHelpers';
import {
  getMessagesHomeFromState,
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
  getAllMessages,
  getStoredMessages,
} from './messageActions';
import { 
  getAccount,
} from '../user/usersActions';
import {
  getFollowing,
} from '../user/userActions';
import { notify } from '../app/Notification/notificationActions';
import './Messages.less';

@injectIntl
@withRouter
@requiresLogin
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
    recipient: 'all',
  }),
  {
    createMessage,
    getFollowing,
    getAllMessages,
    getStoredMessages,
    reload,
    getAccount,
    notify,
  },
)


class MessagesHome extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      messageRefreshTime: 15000,
    };
  }

  static propTypes = {
    user: PropTypes.shape().isRequired,
    messages: PropTypes.shape().isRequired,
    pendingMessages: PropTypes.array.isRequired,
    intl: PropTypes.shape().isRequired,
    match: PropTypes.shape().isRequired,
    recipient: PropTypes.string.isRequired,
    location: PropTypes.shape().isRequired,
    
    mutualFollowers: PropTypes.array.isRequired,
    followingFetched: PropTypes.bool.isRequired,
    loadingMessages: PropTypes.bool.isRequired,
    loadedMessages: PropTypes.bool.isRequired,
    sendingMessage: PropTypes.bool.isRequired,
    authenticated: PropTypes.bool.isRequired,
    authenticatedUserName: PropTypes.string.isRequired,

    createMessage: PropTypes.func.isRequired,
    getAllMessages: PropTypes.func.isRequired,
    getStoredMessages: PropTypes.func.isRequired,
    reload: PropTypes.func,
    notify: PropTypes.func,
    getAccount: PropTypes.func.isRequired,
    getFollowing: PropTypes.func,

  };
  
  static defaultProps = {
    user: {},
    messages: {},
    mutualFollowers: [],

    loadingMessages: false,
    loadedMessages: false,
    authenticated: false,
    sendingMessage: false,
    followingFetched: false,
    authenticatedUserName: '',

    getAllMessages: () => {},
    getStoredMessages: () => {},
    createMessage: () => {},
    reload: () => {},
    notify: () => {},
    getAccount: () => {},
    getFollowing: () => {},
  };

  static async fetchData({ store }) {
    return Promise.all([
      store.dispatch(this.props.getFollowing()),
    ]);
  }

  componentWillReceiveProps(nextprops) {

    const diffRecipient = this.props.match.params.recipient != nextprops.match.params.recipient;
    const diffAuthenticated = this.props.authenticated != nextprops.authenticated;
    const diffMutual = this.props.mutualFollowers.join() != nextprops.mutualFollowers.join();
      
      if (!_.isEmpty(localStorage) && (diffRecipient || diffMutual || diffAuthenticated)) {
        this.props.getAllMessages();
      }

      if (!_.isEmpty(localStorage) && (diffRecipient || diffMutual || diffAuthenticated)) {
        this.props.getAllMessages();
      }
    }

  componentDidMount() {

    const { 
      user, 
      authenticatedUserName, 
      messages, 
      match, 
      loadedMessages, 
      loadingMessages,
      mutualFollowers,
    } = this.props;

    const {
      messageRefreshTime
    } = this.state;


    if (_.isEmpty(user)) {
      this.props.getAccount(authenticatedUserName);
    }

    if (!_.isEmpty(localStorage) && !_.isEmpty(mutualFollowers)) {
      this.props.getStoredMessages();
    }

    if (!_.isEmpty(localStorage) && !_.isEmpty(mutualFollowers)) {
      this.props.getAllMessages();
    }
  
    this.interval = setInterval(() => {
      this.props.getAllMessages();
      
    }, messageRefreshTime);
  }
  
  componentWillUnmount() {
    const { 
      authenticatedUserName, 
      messages, 
      
    } = this.props;
    storeMessagesList(authenticatedUserName, {messages: messages} );

    clearInterval(this.interval);
  }

  render() {
    const { 
      messages,
      intl,
      loadingMessages, 
      loadedMessages, 
      authenticated, 
      authenticatedUserName,
      mutualFollowers,
      user
    } = this.props;

    var content = [];
    
    content = getMessagesHomeFromState(mutualFollowers, messages);

    const empty = _.isEmpty(messages);
    const ready = loadedMessages && !loadingMessages && authenticated;
    const noMutuals = _.isEmpty(mutualFollowers) && ready;
    const displayEmptyFeed = empty && loadedMessages && !loadingMessages;
    

      return ( 
        <div className="feed-layout container">
          <Helmet>
            <title>
              {`Messages`}
            </title>
          </Helmet>
          <ScrollToTop/>
          <ScrollToTopOnMount />
              <div className="center">
                <div className="Messages">
                  <div className="Messages__title">
                    <div className="Messages__titletext">
                      <h1>
                      <FormattedMessage id="messages_select" defaultMessage="Messages" />
                      </h1>
                    </div>
                  </div>
                  <div className="Messages__content">
                  {noMutuals && 
                  <div className="Messages__empty" > 
                    <h5>
                      <FormattedMessage id="no_mutuals" defaultMessage="Connect with some mutual followers to send messages." />
                    </h5>
                  </div>}
                    {content.map(message => 
                      <MessageUser
                        name={message.name}
                        messageText={message.messageText}
                        key={message.id}
                        time={message.time}
                        userSent={message.userSent}
                        newContact={message.newContact}
                        id={message.id}
                      />
                    )}
                  </div>
                </div>
              </div>
          </div>
    );
  }
}

export default MessagesHome;
