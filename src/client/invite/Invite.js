import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Action from '../components/Button/Action';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Input, Form, Button, message } from 'antd';
import Affix from '../components/Utils/Affix';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import requiresLogin from '../auth/requiresLogin';
import { getAuthenticatedUserName } from '../reducers';
import FacebookShare from '../components/Button/FacebookShare';
import TwitterShare from '../components/Button/TwitterShare';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount.js';
import './Invite.less';

@requiresLogin
@injectIntl
@connect(state => ({
  authenticatedUserName: getAuthenticatedUserName(state),
}))
export default class Invite extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    authenticatedUserName: PropTypes.string,
  };

  static defaultProps = {
    authenticatedUserName: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      copied: false,
      inviteURL: '',
    };

    this.onInviteEmail = this.onInviteEmail.bind(this);
    this.callEmailAPI = this.callEmailAPI.bind(this);
  }

  componentDidMount() {
    this.createInviteURL();
  }

  async callEmailAPI(email) {
    const emailData = { email: email, link: this.state.inviteURL, username: this.props.authenticatedUserName };
    const SEND = await fetch(`/api/v1/communicate/mail`,
    {
      method: 'POST',
      body: JSON.stringify(emailData),
      headers: {
        'Accept': 'application/json, text/plain, */*', 
        'Content-Type': 'application/json'},
    })
    .then(res => res.json())
    .catch(err => message.error('Email rejected: ', err));
  }

  onInviteEmail(e) {
    e.preventDefault();
    const newEmail = document.getElementById("EmailInput");
    const form = document.getElementById("EmailForm");
    if (newEmail.value != "") {
      if (newEmail.value.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
        this.callEmailAPI(newEmail.value);
        message.success("Email Sent");
      } else {
        message.error("Email Invalid, please try again.");
      }
    form.reset();
    }
  }

  InviteForm() {
    return (
      <Form className="Invite__form" id="EmailForm">
        <Input
          type="text"
          className="Invite__emailinput"
          id="EmailInput"
          placeholder="Email:"
        />
        <Action primary onClick={this.onInviteEmail} className="Invite__emailbutton"> 
          Send Invitation 
        </Action>
      </Form>
    ); 
  }

  createInviteURL() {
    const { authenticatedUserName } = this.props;
    if (typeof window !== 'undefined') {
      const inviteURL = `${window.location.protocol}//${
        window.location.host
      }/i/@${authenticatedUserName}`;
      this.setState({ inviteURL });
    }
  }

  render() {
    const { intl } = this.props;
      return (
        <div className="shifted">
          <ScrollToTopOnMount />
          <Helmet>
            <title>{intl.formatMessage({ id: 'invite', defaultMessage: 'Invite' })} - WeYouMe</title>
          </Helmet>
          <div className="feed-layout container">
            <Affix className="leftContainer" stickPosition={77}>
              <div className="left">
                <LeftSidebar />
              </div>
            </Affix>
            <div className="center">
              <div className="Invite">
                <div className="Invite__icon-container" />
                <h2 className="Invite__title">
                  <FormattedMessage id="invite_title" defaultMessage="Invite your friends to WeYouMe" />
                </h2>
                <p className="Invite__description">
                  <FormattedMessage
                    id="invite_info"
                    defaultMessage="Enter an email address:"
                    />
                </p>
                <div className="Invite__emailform">
                  {this.InviteForm()}
                </div>
                <div className="Invite__social">
                  <FacebookShare url={this.state.inviteURL} />
                  <TwitterShare
                    url={this.state.inviteURL}
                    text={intl.formatMessage({
                      id: 'invite_share',
                      defaultMessage: 'Join me on WeYouMe, the social media network with a positive purpose:',
                    })}/>
                </div>             
              </div>
            </div>
            <Affix className="rightContainer" stickPosition={77}>
              <div className="right">
                <RightSidebar />
              </div>
            </Affix> 
          </div>  
        </div>
    );
  }
}
