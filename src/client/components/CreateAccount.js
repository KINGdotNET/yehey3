import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import wehelpjs from 'wehelpjs';
import { notification, message } from 'antd';
import AccountForm from './AccountForm';
import SignForm from './SignForm';
import Loading from './Icon/Loading';
import { withRouter } from 'react-router-dom';
import withAuthActions from '../auth/withAuthActions';
import { getUserMemoKey } from '../helpers/apiHelpers';
import qs from 'query-string';
import { authorize, login, addPostingAuthority } from './auth';
import fetch from 'isomorphic-fetch';
import './Sign.less';

@injectIntl
@withRouter
@withAuthActions

export default class CreateAccount extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    history: PropTypes.shape().isRequired,
    options: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
  }

  static defaultProps = {
    history: {},
    options: {
      app: process.env.AUTH_API_CLIENT_ID,
      baseURL: process.env.AUTH_URL,
      callbackURL: process.env.AUTH_API_REDIRECT_URL,
      scope: []
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      error: false,
			account: {},
			options: {
				customSignatory: false
			}
    };
  }

  getHomeLoginURL = () => {
    const { options } = this.props;
    var loginURL = '/login?client_id=' + options.app + '&redirect_uri=' + encodeURIComponent(options.callbackURL);
    return loginURL;
  };

  authorize = (username, ownerPrivateKey) => {
    const { options } = this.props;
    const clientId = options.app;
    const redirectUri = options.callbackURL;
    const responseType = 'token';
    const role = 'owner';
    const scopes = [
      "vote",
      "comment",
      "deleteComment",
      "comment_options",
      "customJson",
      "claimRewardBalance"
      ];
    const state = {
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

    const scopeString = scopes.join(',');
    login({ username, wif: ownerPrivateKey, role }, () => {
      addPostingAuthority({ username, wif: ownerPrivateKey, role, clientId }, () => {
        authorize({ clientId, scope: scopeString}, (errA, resA) => {
          window.location = `${redirectUri}?${qs.stringify({ ...resA, state })}`;
        });
      });
    });
  };

  submit = data => {
		data.name = data.name.toLowerCase();
		let account = data;
    this.setState({
      step: 1,
      account: account
    });
		const { intl } = this.props;
		if(!this.state.options.customSignatory){
			fetch(`https://auth.weyoume.io/api/register`, {
        method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': "application/json"
				}
      })
			.then((res) => {
				this.setState({
					step: 0,
				})		
				res.json()
				.then(res=>{
					if (res.success) {
            const storageKey = getUserMemoKey(account.name);
            const memoKeys = wehelpjs.auth.getPrivateKeys(account.name, account.password, ['memo', 'owner']);
            localStorage.setItem(storageKey, memoKeys.memo); // Stores the User's Memo PrivateKey in local storage for use in encryption and decryption of posts and messages.
						message.success(intl.formatMessage({ id: 'success_accountCreate' }, { account: account.name }));
            if (window.analytics) {
              window.analytics.track('NewAccount', {
                category: 'registration',
                label: `Registered : ${account.name}` ,
                value: 10,
              });
            }
						this.authorize(account.name, memoKeys.owner);
					} else {
						if(res.err){
							console.error('res.err', res.err)
							message.error(res.message || intl.formatMessage({ id: 'general_error' }));
						} else {
							message.error(res.message || intl.formatMessage({ id: 'general_error' }));
						}
					}
				})
			})
			.catch((err) => {
				console.error('err', err)
			});
		}
  };

	changeSignatoryOption = data => {
		this.setState({
			options: {
				customSignatory: data
			}
		})
  }
  
  sign = auth => {
    const { account } = this.state;
		const { intl } = this.props;
		account.name = account.name.toLowerCase()
    const publicKeys = wehelpjs.auth.generateKeys(account.name, account.password, ['owner', 'active', 'posting', 'memo']);
    const owner = { weight_threshold: 1, account_auths: [], key_auths: [[publicKeys.owner, 1]] };
    const active = { weight_threshold: 1, account_auths: [], key_auths: [[publicKeys.active, 1]] };
    const posting = {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [[publicKeys.posting, 1]],
    };
    wehelpjs.broadcast.accountCreateWithDelegation(
      auth.wif,
      account.TME,
      account.SCORE,
      auth.username.toLowerCase(),
      account.name,
      owner,
      active,
      posting,
      publicKeys.memo,
      JSON.stringify({}),
      [],
      (err) => {
        this.setState({ step: 0 });
        if (err) {
					console.error(err)
					console.error( intl.formatMessage({ id: 'general_error' }))		
          notification.error({
            message: intl.formatMessage({ id: 'error' }),
            description: intl.formatMessage({ id: 'general_error' }),
          });
        } else {
          const storageKey = getUserMemoKey(account.name);
          const memoKeys = wehelpjs.auth.getPrivateKeys(account.name, account.password, ['memo', 'owner']);
          localStorage.setItem(storageKey, memoKeys.memo); // Stores the User's Memo PrivateKey in local storage for use in encryption and decryption of posts and messages.
					message.success(intl.formatMessage({ id: 'success_accountCreate' }, { account: account.name }));
          if (window.analytics) {
            window.analytics.track('NewAccount', {
              category: 'registration',
              label: `Registered : ${account.name}` ,
              value: 10,
            });
          }
          this.authorize(account.name, memoKeys.owner);
        }
      }
    );
    this.setState({ step: 2 });
  };

  render() {
    const { step, options } = this.state;
    return (
      <div className="Sign">
        <div className="Sign__content Sign__authorize">
          {step === 0 &&
            <div>
              <h2> <FormattedMessage id="create_new_account" defaultMessage="Create New Account" /> </h2>
							<AccountForm 
								customSignatory={options.customSignatory} 
								changeSignatoryOption={this.changeSignatoryOption} 
								submit={this.submit} 
							/>
            </div>
          }
          {step === 1 && options.customSignatory &&
            <div >
              <SignForm roles={['owner','active']} sign={this.sign} />
            </div>
					}
					{step === 1 && !options.customSignatory &&
            <div >
							{'Registering... Please wait'}
							<br></br>
							<Loading />
            </div>
          }
          {step === 2 &&
            <div>
              <Loading />
            </div>
          }
        </div>
      </div>
    );
  }
}
