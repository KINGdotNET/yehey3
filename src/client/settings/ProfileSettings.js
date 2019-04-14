import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import _ from 'lodash';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Form, Input, Icon, Button } from 'antd';
import weauthjsInstance from '../weauthjsInstance';
import { getIsReloading, getAuthenticatedUser } from '../reducers';
import socialProfiles from '../helpers/socialProfiles';
import withEditor from '../components/Editor/withEditor';
import EditorInput from '../components/Editor/EditorInput';
import ImageInput from '../components/Editor/ImageInput';
import { remarkable } from '../components/Story/Body';
import BodyContainer from '../containers/Story/BodyContainer';
import Action from '../components/Button/Action';
import Affix from '../components/Utils/Affix';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import { isValidImage, MAXIMUM_UPLOAD_SIZE } from '../helpers/image';
import requiresLogin from '../auth/requiresLogin';
import classNames from 'classnames';
import wehelpjs from 'wehelpjs';
import { message } from 'antd';
import './Settings.less';
import { invalid } from 'glamor';

const FormItem = Form.Item;

function mapPropsToFields(props) {
  let metadata = _.attempt(JSON.parse, props.user.json);
  if (_.isError(metadata)) metadata = {};

  const profile = metadata.profile || {};

  return Object.keys(profile).reduce(
    (a, b) => ({
      ...a,
      [b]: Form.createFormField({
        value: profile[b],
      }),
    }),
    {},
  );
}

@requiresLogin
@injectIntl
@connect(state => ({
  user: getAuthenticatedUser(state),
  reloading: getIsReloading(state),
}))
@Form.create({
  mapPropsToFields,
})
@withEditor

export default class ProfileSettings extends React.Component {
  static propTypes = {
    intl: PropTypes.shape().isRequired,
    form: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    onImageUpload: PropTypes.func,
    onImageInvalid: PropTypes.func,
  };

  static defaultProps = {
    onImageUpload: () => {},
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
      bodyHTML: '',
      profileImage: '',
    };

    this.handleSignatureChange = this.handleSignatureChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderBody = this.renderBody.bind(this);
    this.renderImage = this.renderImage.bind(this);
    this.onPasswordInput = this.onPasswordInput.bind(this);  
  };


handleUpdateCurrentInputValue = e =>
    this.setState({
      currentInputValue: e.target.value,
    });

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
  this.resizeTextarea();
  this.setValue(newValue, startPos + imageText.length, startPos + imageText.length);
}

  handleSignatureChange(body) {
    _.throttle(this.renderBody, 200, { leading: false, trailing: true })(body);
  }

  handleImageChange(image) {
    _.throttle(this.renderImage, 200, { leading: false, trailing: true })(image);
  }


  handleSubmit(e) {
    e.preventDefault();
    const { form } = this.props;

    if (!form.isFieldsTouched()) return;

    form.validateFields((err, values) => {
      if (!err) {
        const cleanValues = Object.keys(values)
          .filter(field => form.isFieldTouched(field))
          .reduce(
            (a, b) => ({
              ...a,
              [b]: values[b] || '',
            }),
            {},
          );
        const win = window.open(weauthjsInstance.sign('profile-update', cleanValues), '_blank');
        win.focus();
      }
    });
  }

  renderBody(body) {
    this.setState({
      bodyHTML: remarkable.render(body),
    });
  }

  renderImage(image) {
    this.setState({
      profileImage: remarkable.render(image),
    });
  }

  saveViewKey(password) {
    const { user } = this.props;
    let storagekey = "UserMemoKey-"+user.name;
    let memoKeys = wehelpjs.auth.getPrivateKeys(user.name, password, ['memo']);
    //console.log("memoKeys", memoKeys);
    if (user.memoKey == memoKeys.memoPubkey) {
      //console.log("Key match successful", memoKeys);
      localStorage.setItem(storagekey, memoKeys.memo);
      message.info("Secret key set successfully.");
      window.location.reload();
    } else {
      //console.log("Key match Invalid: on-chain public memo key: ", user.memoKey, " is not equal to derived public memo key: ", memoKeys.memoPubkey);
      message.error("Secret key invalid, please input correct password.");
    }
  }

  onPasswordInput(e) {
    e.preventDefault();
    const newSearch = document.getElementById("PassInput");
    const form = document.getElementById("PassForm");
    if (newSearch.value != "") {
      let password = newSearch.value;
      this.saveViewKey(password);
      }
    form.reset();
  }

  passwordForm(){
    const { user } = this.props;
    let storagekey = "UserMemoKey-"+user.name;
    let memoPrivateKey = '';
    if (localStorage) {
      memoPrivateKey = localStorage.getItem(storagekey);
    }
    let form = '';
    if (memoPrivateKey) {
      form = (
        <div className="Settings__password">
          <h3>
              <FormattedMessage id="key_form" defaultMessage="Privacy Key" />
          </h3>
          <div className="Settings__keyvalid">
            <i className="iconfont icon-right" />
            <FormattedMessage id="key_valid" defaultMessage="Secret Key valid and set" />
          </div>
          <Form className="Settings__password__form" id="PassForm"> 
              <Input
              type="password"
              className="Settings__passinput"
              id="PassInput"
              placeholder="Update account Password:"
              />
              <Button onClick={this.onPasswordInput}> 
                <FormattedMessage id="generate_key" defaultMessage="Generate Key" /> 
              </Button>
          </Form>
        </div> );
      } else {
      form = (
        <div className="Settings__password">
          <h3>
              <FormattedMessage id="key_form" defaultMessage="Privacy Key" />
          </h3>
          <div className="Settings__keynotset">
            <i className="iconfont icon-lock" />
            <FormattedMessage id="key_not_set" defaultMessage="Please enter your account password to use and read private posts." />
          </div>
          <Form className="Settings__password__form" id="PassForm"> 
              <Input
              type="password"
              className="Settings__passinput"
              id="PassInput"
              placeholder="Enter account Password:"
              />
              <Button onClick={this.onPasswordInput}> 
                <FormattedMessage id="generate_key" defaultMessage="Generate Key" /> 
              </Button>
          </Form>
          </div>);
            } 
    return form;
  }

  render() {
    const { intl, form } = this.props;
    const { bodyHTML, profileImage  } = this.state;
    const { getFieldDecorator } = form;
    const socialInputs = socialProfiles.map(profile => (
      <FormItem key={profile.id}>
        {getFieldDecorator(profile.id, {
          rules: [
            {
              message: intl.formatMessage({
                id: 'profile_social_profile_incorrect',
                defaultMessage:
                  "This doesn't seem to be valid username. Only alphanumeric characters, hyphens, underscores and dots are allowed.",
              }),
              pattern: /^[0-9A-Za-z-_.]+$/,
            },
          ],
        })(
          <Input
            size="large"
            prefix={
              <i
                className={`Settings__prefix-icon iconfont icon-${profile.icon}`}
                style={{
                  color: profile.color,
                }}
              />
            }
            placeholder={profile.name}
          />,
        )}
      </FormItem>
    ));

    return (
      <div className="shifted">
        <Helmet>
          <title>
            {intl.formatMessage({ id: 'edit_profile', defaultMessage: 'Edit profile' })} - WeYouMe
          </title>
        </Helmet>
        <div className="settings-layout container">
          <Affix className="leftContainer" stickPosition={77}>
            <div className="left">
              <LeftSidebar />
            </div>
          </Affix>
          <div className="center">
            <h1>
              <FormattedMessage id="edit_profile" defaultMessage="Edit Profile" />
            </h1>
            <div className="Settings__section">
            {this.passwordForm()}
            </div>
            <Form onSubmit={this.handleSubmit}>
              <div className="Settings">
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_name" defaultMessage="Name" />
                  </h3>
                  <div className="Settings__section__inputs">
                    <FormItem>
                      {getFieldDecorator('name')(
                        <Input
                          size="large"
                          placeholder={intl.formatMessage({
                            id: 'profile_name_placeholder',
                            defaultMessage: 'Name to display on your profile',
                          })}
                        />,
                      )}
                    </FormItem>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_picture" defaultMessage="Profile picture" />
                  </h3>
                  <div className="Settings__section__inputs">
                    <FormItem>
                    {getFieldDecorator('profile_image', {
                      initialValue: '',
                    })(
                      <ImageInput
                        rows={2}
                        onImageUpload={this.props.onImageUpload}
                        onImageInvalid={this.props.onImageInvalid}
                        onChange={this.handleImageChange}
                        inputId={'profile_image'}
                      />
                    )}
                    </FormItem>
                    {profileImage && (
                      <Form.Item label={<FormattedMessage id="profile_picture" defaultMessage="Profile Picture" />}>
                        <BodyContainer full body={profileImage} />
                      </Form.Item>
                    )}
                  </div>
                </div>
                
                {/* <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_cover" defaultMessage="Cover picture" />
                  </h3>
                  
                  <div className="Settings__section__inputs">
                  <FormItem>
                    {getFieldDecorator('cover_image', {
                      initialValue: '',
                    })(
                      <ImageInput
                        rows={2}
                        onImageUpload={this.props.onImageUpload}
                        onImageInvalid={this.props.onImageInvalid}
                        inputId={'profile_cover'}
                      />,
                    )}
                    </FormItem>
                    {bodyHTML && (
                      <Form.Item label={<FormattedMessage id="profile_cover" defaultMessage="Cover_Picture" />}>
                        <BodyContainer full body={bodyHTML} />
                      </Form.Item>
                    )}
                  </div>
                </div> */}
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_about" defaultMessage="About me" />
                  </h3>
                  <div className="Settings__section__inputs">
                    <FormItem>
                      {getFieldDecorator('about')(
                        <Input.TextArea
                          autosize={{ minRows: 2, maxRows: 6 }}
                          placeholder={intl.formatMessage({
                            id: 'profile_about_placeholder',
                            defaultMessage: 'Few words about you',
                          })}
                        />,
                      )}
                    </FormItem>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_location" defaultMessage="Location" />
                  </h3>
                  <div className="Settings__section__inputs">
                    <FormItem>
                      {getFieldDecorator('location')(
                        <Input
                          size="large"
                          placeholder={intl.formatMessage({
                            id: 'profile_location_placeholder',
                            defaultMessage: 'Your location',
                          })}
                        />,
                      )}
                    </FormItem>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_website" defaultMessage="Website" />
                  </h3>
                  <div className="Settings__section__inputs">
                    <FormItem>
                      {getFieldDecorator('website')(
                        <Input
                          size="large"
                          placeholder={intl.formatMessage({
                            id: 'profile_website_placeholder',
                            defaultMessage: 'Your website URL',
                          })}
                        />,
                      )}
                    </FormItem>
                  </div>
                </div>
                
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage
                      id="profile_social_profiles"
                      defaultMessage="Social profiles"
                    />
                  </h3>
                  <div className="Settings__section__inputs">{socialInputs}</div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="profile_signature" defaultMessage="Signature" />
                  </h3>
                  <div className="Settings__section__inputs">
                    {getFieldDecorator('signature', {
                      initialValue: '',
                    })(
                      <EditorInput
                        rows={4}
                        onChange={this.handleSignatureChange}
                        onImageUpload={this.props.onImageUpload}
                        onImageInvalid={this.props.onImageInvalid}
                        inputId={'profile-inputfile'}
                      />,
                    )}
                    {bodyHTML && (
                      <Form.Item label={<FormattedMessage id="preview" defaultMessage="Preview" />}>
                        <BodyContainer full body={bodyHTML} />
                      </Form.Item>
                    )}
                  </div>
                </div>
                <Action primary big type="submit" disabled={!form.isFieldsTouched()}>
                  <FormattedMessage id="save" defaultMessage="Save" />
                </Action>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}
