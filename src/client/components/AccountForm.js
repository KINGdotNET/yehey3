import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Button, Form, Input, Icon } from 'antd';
import wehelpjs from 'wehelpjs';
import withEditor from '../components/Editor/withEditor';
import ImageInput from '../components/Editor/ImageInput';
import _ from 'lodash';
import ReactPasswordStrength from 'react-password-strength/dist/universal';
import 'react-password-strength/dist/style.css';
import './AccountForm.less';

@Form.create()
@injectIntl
@withEditor

class AccountForm extends React.Component {

	static propTypes = {
		intl: PropTypes.shape().isRequired,
		onImageHash: PropTypes.func,
		onImageInvalid: PropTypes.func,
	}

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
			passwordVisibility: false, 
      		data: {
				name: '',
				password: '',
				confirmPassword: '',
				TME: '1.000 TME',
				SCORE: '100.000000 SCORE',
			},
			details: false,
			passwordError: false,
			passwordReady: false,
		}
		
		this.passwordMatch = this.passwordMatch.bind(this);
		this.handleImageChange = this.handleImageChange.bind(this);
		
	}

	onUpdate = (event) => {
		event.preventDefault();
		const { data } = this.state;
    	const { value, name } = event.target;
		data[name] = value;
		this.setState({ data });
	};

	// changePassCallback = (state) => {
	// 	const { data } = this.state;
	// 	data['password']= state.password;
	// 	this.setState({ data });
	// 	this.passwordMatch(state.isValid);
	// }

	// changeConfirmCallback = (state) => {
	// 	const { data } = this.state;
	// 	data['confirmPassword'] = state.password;
	// 	this.setState({ data });
	// 	this.passwordMatch(state.isValid);
	// }
	
	onSubmit = (event) => {
		event.preventDefault();
    	this.props.submit(this.state.data);
  	};

	toggleDetails = (data) => {
		this.setState({
			details: !this.state.details
		})
	}

	togglePasswordVisibility = (data) => {
		this.setState({
			passwordVisibility: !this.state.passwordVisibility
		})
	}

	toggleCustomSignatory = () => {
		this.props.changeSignatoryOption(!this.props.customSignatory)
	}

	passwordMatch(isValid) {
		if (isValid && this.state.data.password && this.state.data.confirmPassword && this.state.data.password == this.state.data.confirmPassword) {
			this.setState({ 
				passwordReady: true, 
				passwordError: false,
			});
		} else {
			this.setState({ 
				passwordError: true,
				passwordReady: false, 
			});
		}
		return;
	}

	newAccountValid = intl => async (rule, value, callback) => {
		let i;
		let label;
		let len;
		let segment = '';

		if (!value) {
			callback(intl.formatMessage({ id: 'error_username_required' }));
		}

		const length = value.length;

		if (length < 3) {
			callback(intl.formatMessage({ id: 'error_validation_account_min' }));
		}
		if (length > 16) {
			callback(intl.formatMessage({ id: 'error_validation_account_max' }));
		}
	
		if (/\./.test(value)) {
			segment = '_segment';
		}
	
		const ref = value.split('.');
	
		for (i = 0, len = ref.length; i < len; i += 1) {
			label = ref[i];
			if (!/^[a-z]/.test(label)) {
				callback(intl.formatMessage({ id: `error_validation_account${segment}_start` }));
			}
			if (!/^[a-z0-9-]*$/.test(label)) {
				callback(intl.formatMessage({ id: `error_validation_account${segment}_alpha` }));
			}
			if (/--/.test(label)) {
				callback(intl.formatMessage({ id: `error_validation_account${segment}_dash` }));
			}
			if (!/[a-z0-9]$/.test(label)) {
				callback(intl.formatMessage({ id: `error_validation_account${segment}_end` }));
			}
			if (!(label.length >= 3)) {
				callback(intl.formatMessage({ id: `error_validation_account${segment}_min` }));
			}
		}
		const accounts = await wehelpjs.api.getAccountsAsync([value]);

		if (accounts && accounts.find(a => a.name == value)) {
			callback(intl.formatMessage({ id: 'error_username_taken', defaultMessage: "Username is unavailable" }));
		} else {
			callback();
		}
	};
	
	preSubmit = (e) => {
		if(!this.state.passwordError && this.state.passwordReady){
			this.onSubmit(e)
		}
	}

	handleImageChange = (image) => {
		_.throttle(this.renderImage, 200, { leading: false, trailing: true })(image);
	}

	renderImage = (image) => {
		const { data } = this.state;
		data['password'] = image;
		data['confirmPassword'] = image;
		this.setState({
		  data: data,
		});
		this.passwordMatch(true);
	}

	PassPikButton(passwordReady) {
		if(passwordReady) {
			return (<span className = "ready"> <i className="iconfont icon-success" /> "PassPik Ready" </span>);
		} else {
			return (<span className = "waiting"> <i className="iconfont icon-picture" /> "Select PassPik" </span>);
		}
	}

  	render() {
		const { data, passwordVisibility, passwordError, passwordReady } = this.state;
		const { customSignatory, intl } = this.props;
		const { getFieldDecorator } = this.props.form;
		const uploadText = passwordReady ? "Passpik Ready" : "Select PassPik";
		const uploadIcon = passwordReady ? "icon-success" : "icon-picture";
		const uploadColor = passwordReady ? "springgreen" : "inherit";

    	return (
			<div className="AccountForm">
				<Form onSubmit={this.preSubmit} >
					<Form.Item 
						className="AccountForm__group"
						label= {
							<span className="AccountForm__label">
								<Icon type="user" size="large" />
								<FormattedMessage id="username_form" defaultMessage="Username" /> 
							</span>
						}
						hasFeedback>
							{getFieldDecorator('username', {
								initialValue: data.name,
								rules: [
									{ validator: this.newAccountValid(intl) },
								],
							})(
								<Input
									className="AccountForm__control"
									id="username"
									autoComplete="off" 
									type="text" 
									placeholder={ intl.formatMessage({ id: 'username'}) } 
									autoCorrect="off" 
									name="name"
									autoCapitalize="none"
									onChange={this.onUpdate}
									autoComplete="off"
									maxLength="16"
									/>
							)}
					</Form.Item>

					<Form.Item
						className="AccountForm__group"
						hasFeedback>
						{getFieldDecorator('password_image_hash_form', {
						initialValue: '',
						})(
						<ImageInput
							name="password_image_hash" 
							placeholder={intl.formatMessage({ id: 'password_or_key' })} 
							autoComplete="off" 
							autoCorrect="off" 
							autoCapitalize="none"
							rows={1}
							onImageUpload={this.props.onImageHash}
							onImageInvalid={this.props.onImageInvalid}
							onChange={this.handleImageChange}
							uploadText={uploadText}
							uploadIcon={uploadIcon}
							uploadColor={uploadColor}
							inputId={'password_image_hash'}
							type="password"
						/>)}
					</Form.Item>
					
					

					<div className="AccountForm__passpik ">
						<FormattedMessage id="passpik_info" />
					</div>
					<div className="AccountForm__passwordtip ">
						<i className="iconfont icon-prompt" ></i>
						<FormattedMessage id="password_backup" />
					</div>
					<div className="AccountForm__passwordtip ">
						<i className="iconfont icon-prompt" ></i>
						<FormattedMessage id="password_tip" />
					</div>
					
					 <div className={(this.state.details ? 'visible' : '') + " extra-details"}>
					{/* <Form.Item 
					className="AccountForm__group" 
					label= {
						<span className="AccountForm__label"> 
							<Icon type="lock" size="large" />
							<FormattedMessage id="password_form" defaultMessage="Password" />
						</span>
					}
					hasFeedback>
						<ReactPasswordStrength
							className="AccountForm_control"
							minLength={12}
							minScore={2}
							name="password"
							scoreWords={['weak', 'okay', 'good', 'strong', 'stronger']}
							changeCallback = {this.changePassCallback}
							defaultValue= {data.password}
							inputProps={{ 
								id: "password", 
								type: !passwordVisibility ? 'password' : 'showPassword',
								name: "password",
								placeholder: intl.formatMessage({ id: 'password_or_key'}),
								autoComplete: "off",
								autoCorrect: "off", 
								autoCapitalize: "none" }} />
					</Form.Item>
					<div className="AccountForm__details" onClick={this.togglePasswordVisibility}>
						<div>{!passwordVisibility ? 'Show Passwords' : 'Hide Passwords'}</div>
					</div>
					<Form.Item 
						className="AccountForm__group"
						label= {
							<span className="AccountForm__label"> 
								<Icon type="lock" size="large" />
								<FormattedMessage id="confirm_password_form" defaultMessage="Confirm Password" />
							</span>
						}
						hasFeedback>
							<ReactPasswordStrength
								className="AccountForm__control"
								minLength={12}
								name="confirmPassword"
								minScore={2}
								scoreWords={['weak', 'okay', 'good', 'strong', 'stronger']}
								changeCallback= {this.changeConfirmCallback}
								defaultValue= {data.confirmPassword}
								inputProps={{ 
									id: "confirmPassword", 
									type:  !passwordVisibility ? 'password' : 'showPassword',
									name: "confirmPassword",
									placeholder: intl.formatMessage({ id: 'password_or_key'}),
									autoComplete: "off",
									autoCorrect: "off", 
									autoCapitalize: "none"}}/>					
					</Form.Item>
					{passwordError && 
						<div className="AccountForm__error">
							<i className="iconfont icon-prompt" > </i> 
							<FormattedMessage id="password_error" defaultMessage="Passwords do not match or are invalid" />
						</div>} */}
					<Form.Item 
						className="AccountForm__group" 
						label= {
							<span className="AccountForm__label"> 
								<FormattedMessage id="TME" defaultMessage="TME (TestMeCoin)"/>
							</span>
						}
						hasFeedback>
						{getFieldDecorator('TME', {
							initialValue: data.TME,
							rules: [
								{ required: false, message: intl.formatMessage({ id: 'protocol_tip' }) },
							],
						})(
							<Input
								id="TME"
								type="text"
								className="AccountForm__control"
								name="TME"
								onChange={this.onUpdate}
								/>
						)}
					</Form.Item>
					<Form.Item 
						className="AccountForm__group" 
						label= {
							<span className="AccountForm__label"> 
								<FormattedMessage id="SCORE" defaultMessage="Score" />
							</span>
						}
						hasFeedback
						>
						{getFieldDecorator('SCORE', {
							initialValue: data.SCORE,
							rules: [
								{ required: false, message: intl.formatMessage({ id: 'SCORE_tip' }) },
							],
						})(
							<Input
								id="SCORE"
								type="text"
								className="AccountForm__control"
								name="SCORE"
								onChange={this.onUpdate}
								/>
						)}
					</Form.Item>
					<div>
						<div>
							{ customSignatory ? 'Using Custom Signatory' : 'Using Network Signatory'}
						</div>
						<div className="AccountForm__details" onClick={this.toggleCustomSignatory}>
							<div>
								{ customSignatory ? 'Use Network Signatory' : 'Use Custom Signatory'}
							</div>
						</div>
					</div>
				</div>
				
				<Form.Item>
				<div className="AccountForm__group AccountForm__submitbutton">
						<Button
							type="primary"
							size="large"
							onClick={this.preSubmit}
							className="AccountForm__button"
							disabled={this.props.isLoading}
						>
							<FormattedMessage id="create_account" defaultMessage="Create New Account" />
						</Button>
					</div>
				</Form.Item>
				<div className="AccountForm__details" onClick={this.toggleDetails}>
					<div>{this.state.details ? (<i className="iconfont icon-caret-up" />) : (<i className="iconfont icon-caretbottom" />)}</div>
				</div>
			</Form>
		</div>
    	);
	}
}
export default AccountForm;
