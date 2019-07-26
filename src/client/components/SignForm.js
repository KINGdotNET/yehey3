import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import wehelpjs from 'wehelpjs';
import { Form, Icon, Input, Button } from 'antd';
import { accountExist } from './Utils/validator';
import ImageInput from './Editor/ImageInput';
import { getUserMemoKey } from '../helpers/apiHelpers';
import _ from 'lodash';
import './Sign.less';
import { Link } from 'react-router-dom';
import withEditor from './Editor/withEditor';

@withEditor

class SignForm extends React.Component {
  static propTypes = {
    onImageHash: PropTypes.func,
		onImageInvalid: PropTypes.func,
    form: PropTypes.shape({
      validateFields: PropTypes.func,
      getFieldValue: PropTypes.func,
    }),
    intl: intlShape.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
    btnTitle: PropTypes.string,
  };

  static defaultProps = {
		onImageHash: () => {},
		onImageInvalid: () => {},
  };
  
  state = {
		noContent: false,
		imageUploading: false,
		dropzoneActive: false,
		currentInputValue: '',
		currentImages: [],
		focusedInput: false,
		inputMinRows: 1,
	  };


  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
    };
  }

  componentWillMount() {
    this.setState({ submitting: false });
  }

  saveViewKey(username, password, memoPubKey) {
    const storageKey = getUserMemoKey(username);
    const memoKeys = wehelpjs.auth.getPrivateKeys(username, password, ['memo']);
    if (memoPubKey == memoKeys.memoPubkey) {
      localStorage.setItem(storageKey, memoKeys.memo);
    } else {
      console.error("Key match Invalid: on-chain public memo key: ", user.memoKey, " is not equal to derived public memo key: ", memoKeys.memoPubkey);
      message.error("Secret key invalid, please input correct password.");
    }
  }

  keyAuthsHasPublicWif = (keys, publicWif) => keys.some(key => key[0] === publicWif);

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitting: true });
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { username, password } = values;
        const { roles, intl } = this.props;
        const accounts = await wehelpjs.api.getAccountsAsync([username]);
        const account = accounts[0];
				account.name = account.name.toLowerCase()
        /** Change password to public WIF */
				
				var privateWif
				var publicWif
				let keypairs = []
				var authTypes = [
				]
				for (let i = 0; i < roles.length; i += 1) {
					keypairs['privateWif'+i] = wehelpjs.auth.isWif(password)
          	? password
          	: wehelpjs.auth.toWif(username, password, roles[i]);
					keypairs['publicWif'+i] = wehelpjs.auth.wifToPublic(keypairs['privateWif'+i]);
					if(account[roles[i]] && account[roles[i]].account_auths && account[roles[i]].account_auths.length){
						for(let n = 0; n < account[roles[i]].account_auths.length; n += 1){
							if(account[roles[i]].account_auths[n] && account[roles[i]].account_auths[n][0]){
								keypairs['privateWifAccountAuth'+i+''+n] = wehelpjs.auth.isWif(password)
									? password
									: wehelpjs.auth.toWif(account[roles[i]].account_auths[n][0], password, roles[i]);
								keypairs['publicWifAccountAuth'+i+''+n] = wehelpjs.auth.wifToPublic(keypairs['privateWifAccountAuth'+i+''+n]);
							}
						}
					}
				}
        /** Check if public WIF is valid */
        let wifIsValid = false;
				let role;
				
        for (let i = 0; i < roles.length; i += 1) {
					for (let n = 0; n < roles.length; n += 1) {
						if (
							(roles[i] === 'memo' && account.memoKey === keypairs['publicWif'+n]) ||
							(roles[i] !== 'memo' && this.keyAuthsHasPublicWif(account[roles[i]].key_auths, keypairs['publicWif'+n]))
						) {
							privateWif = keypairs['privateWif'+n];
							publicWif = keypairs['publicWif'+n];
							wifIsValid = true;
							role = roles[i];
							break;
						} else {
							if(account[roles[i]] && account[roles[i]].account_auths && account[roles[i]].account_auths.length){
								for(let k = 0; k < account[roles[i]].account_auths.length; k += 1){
									if(account[roles[i]].account_auths[n] && account[roles[i]].account_auths[n][0]){
										if (
											(roles[i] === 'memo' && account.memoKey === keypairs['publicWifAccountAuth'+n+''+k]) ||
											(roles[i] !== 'memo' && this.keyAuthsHasPublicWif(account[roles[i]].key_auths, keypairs['publicWifAccountAuth'+n+''+k]))
										){
											privateWif = keypairs['privateWifAccountAuth'+n+''+k];
											publicWif = keypairs['publicWifAccountAuth'+n+''+k];
											wifIsValid = true;
											role = roles[i];
											break;
										}
									}
								}
							}
						}
					}
					if(wifIsValid) break
        }

        /** Submit form */
        if (wifIsValid) {
          const payload = {
            username,
            wif: privateWif,
            role,
          };
          this.saveViewKey(username, password, account.memoKey);
          if (this.props.onSubmit) {
            this.props.onSubmit(payload);
          }
          if (this.props.sign) {
            this.props.sign(payload);
          }
        } else {
          this.setState({ submitting: false });
          this.props.form.setFields({
            password: {
              value: password,
              errors: [new Error(intl.formatMessage({ id: 'error_password_invalid' }))],
            },
          });
        }
      } else {
        this.setState({ submitting: false });
      }
    });
  };

  toCredentials = (password) => {
    const username = this.props.form.getFieldValue('username');
    return { username, password };
  };

	componentDidMount(){
		this.usernameInput.focus();
  }

  disableAndInsertImage = (image, imageName = 'image') => {
		this.setState({
		  imageUploading: false,
		});
		this.insertImage(image, imageName);
	};
	  
	insertImage(image, imageName = 'image') {
		if (!this.input) return;
		const { value } = this.props;
		const startPos = this.input.selectionStart;
		const endPos = this.input.selectionEnd;
		const imageText = `${image}`;
		const newValue = `${value.substring(0, startPos)}${imageText}${value.substring(
		  endPos,
		  value.length,
		)}`;
		this.setValue(newValue, startPos + imageText.length, startPos + imageText.length);
	}

	handleImageChange = (image) => {
		_.throttle(this.renderImage, 200, { leading: false, trailing: true })(image);
	}

	renderImage = (image) => {	
		this.setState({
		  password: image,
		});
	}
  
  render() {
    const { form: { getFieldDecorator }, intl } = this.props;
    const title = this.props.title ? this.props.title : <FormattedMessage id="sign_in" />;
		const btnTitle = this.props.btnTitle ? this.props.btnTitle : <FormattedMessage id="sign_in" />;
    return (
      <Form onSubmit={this.handleSubmit} className="SignForm">
        <Form.Item hasFeedback>
          {getFieldDecorator('username', {
            rules: [
              { required: true, message: intl.formatMessage({ id: 'error_username_sign_required' }) },
              { validator: accountExist }]})(
						<Input 
							prefix={<Icon type="user" size="large" />} 
							placeholder={intl.formatMessage({ id: 'username' })} 
							autoCorrect="off" 
							name="username"
							autoCapitalize="none" 
							autoComplete="on"
							ref={(input) => { this.usernameInput = input; }}
							/>
          )}
        </Form.Item>
        <Form.Item
          className="SignForm__group"
          hasFeedback>
          {getFieldDecorator('password', {
          initialValue: '',
          rules: 
          [{ required: true, message: intl.formatMessage({ id: 'error_password_required' })}]})(
            <ImageInput
              name="password" 
              placeholder={intl.formatMessage({ id: 'password_or_key' })} 
              autoComplete="on" 
              autoCorrect="off" 
              autoCapitalize="none"
              rows={1}
              prefix={<Icon type="lock" size="large" />}
              onImageUpload={this.props.onImageHash}
              onImageInvalid={this.props.onImageInvalid}
              onChange={this.handleImageChange}
              uploadText={"Login with Image Password"}
              inputId={'password_image_hash'}
              type="password" />
          )}
				</Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="SignForm__button" loading={this.state.submitting}>
            {btnTitle}
          </Button>
        </Form.Item>
				<Form.Item>
					<Link to="/welcome" className="SignForm__registration">
							<FormattedMessage id="signup" />
					</Link>
				</Form.Item>
      </Form>
    );
  }
}

export default Form.create()(injectIntl(SignForm));
