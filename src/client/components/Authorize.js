import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Form, Button } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import qs from 'query-string';
import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';
import { authorize, login, addPostingAuthority } from './auth';
import { getAccounts } from './localStorage';
import Loading from './Loading';
import SignForm from './SignForm';
import ChooseAccountForm from './ChooseAccount';
import './Authorize.less';
import './Sign.less';
import { withRouter } from 'react-router-dom';

@withRouter
@connect(
  dispatch => bindActionCreators({
    authorize,
  }, dispatch)
)

export default class Authorize extends React.Component {
  static propTypes = {
    location: PropTypes.shape().isRequired,
  };

  constructor(props) {
    super(props);
    const query = qs.parse(this.props.location.search);
    const clientId = query.client_id;
    const responseType = query.response_type || 'token';
    const redirectUri = query.redirect_uri;
    const state = query.state;
    this.state = {
      clientId,
      responseType,
      redirectUri,
      state,
      step: 0,
      scopes: [
        "vote",
        "comment",
        "deleteComment",
        "comment_options",
        "customJson",
        "claimRewardBalance"
        ],
      app: null,
    };
  }

  getAppData() {
    const { clientId } = this.state;
    fetch(`https://auth.weyoume.io/api/apps/@${clientId}`)
      .then(res => res.json())
      .then(app => this.setState({
        app: app,
      }))
      .catch(err => console.error("error:", err));
  }

  componentWillMount() {
    this.getAppData();
    const accounts = getAccounts() || [];
    if (accounts.length > 0) {
      this.setState({ step: 1 });
    } else {
      this.setState({ step: 2 });
    }
  }

  authorize = (auth) => {
    const { clientId, responseType, redirectUri, state, scopes} = this.state;
    this.setState({ step: 0 });
    const scopeString = scopes.join(',');
    login({ ...auth }, () => {
        addPostingAuthority({ ...auth, clientId }, () => {
          authorize({ clientId, scope: scopeString, responseType }, (errA, resA) => {
            if (window.analytics) {
              window.analytics.track('Login', {
                category: 'login',
                label: `login` ,
                value: 1,
              });
            }
            window.location = `${redirectUri}?${qs.stringify({ ...resA, state })}`;
          });
        });
    });
  };

  addAccount = () => {
    this.setState({ step: 2 });
  }

  hasAuthorityFromStorage = (username, clientId) => {
    const accounts = getAccounts() || [];
    const account = accounts.find(acc => acc.username === username);
    const auths = account.postingAuths.map(auth => auth[0]);
    return auths.indexOf(clientId) !== -1;
  }

  changeAccount = () => {
    const { clientId, responseType, redirectUri, scopes, state } = this.state;
    const accessToken = localStorage.getItem('token');
    const scopeString = scopes.join(',');
    if (accessToken) {
      const decodedToken = jwt.decode(accessToken);
      if (decodedToken.user && !this.hasAuthorityFromStorage(decodedToken.user, clientId)) {
        this.setState({ step: 2 });
      } else {
        authorize({ clientId, scope: scopeString, responseType }, (err, res) => {
          window.location = `${redirectUri}?${qs.stringify({ ...res, state })}`;
        });
      }
    } else {
      this.setState({ step: 2 });
    }
  }

  render() {
    const { step } = this.state;
    const requiredRoles = ['owner', 'owner', 'active'];
    return (
      <div>
      <Helmet>
          <title> Login </title>
          <meta name="robots" content={'index,follow'} />
      </Helmet>
      <ScrollToTop />
      <ScrollToTopOnMount />
      <div className="Sign">
        {step === 0 && <Loading />}
        {step !== 0 && 
          <div className="Sign__content">
            <div className="Sign__frame">
              <div className="Sign__header">
                  <h5><FormattedMessage id="login_to_weyoume" defaultMessage="Login To WeYouMe" /></h5>
              </div>
              <div className="Sign__wrapper">
                {step === 1 &&
                <ChooseAccountForm
                  addAccount={this.addAccount}
                  callback={this.changeAccount}
                />}
                {step === 2 && <SignForm roles={requiredRoles} sign={this.authorize} />}
              </div>
            </div>
          </div>}
        </div>
      </div>
    );
  }
}
