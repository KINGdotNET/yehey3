import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Select, Radio, Checkbox } from 'antd';
import {
  getIsReloading,
  getLocale,
  getVotingPower,
  getIsSettingsLoading,
  getVotePercent,
  getShowNSFWPosts,
  getShowImagesOnly,
  getNightmode,
  getRewriteLinks,
  getUseBeta,
  getUpvoteSetting,
  getBoardSetting,
  getLanguageSetting,
  getAccessListSetting,
  getAccessSetting,
  getExitPageSetting,
  getAuthenticatedUser,
} from '../reducers';
import { saveSettings } from './settingsActions';
import { reload } from '../auth/authActions';
import { notify } from '../app/Notification/notificationActions';
import Action from '../components/Button/Action';
import Loading from '../components/Icon/Loading';
import Affix from '../components/Utils/Affix';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RawSlider from '../components/Slider/RawSlider';
import requiresLogin from '../auth/requiresLogin';
import LANGUAGES from '../translations/languages';
import { getLanguageText } from '../translations';
import './Settings.less';
import packageJson from '../../../package.json';
import { boardValues } from '../../common/constants/boards';

@requiresLogin
@injectIntl
@connect(
  state => ({
    user: getAuthenticatedUser(state),
    reloading: getIsReloading(state),
    locale: getLocale(state),
    votingPower: getVotingPower(state),
    votePercent: getVotePercent(state),
    showNSFWPosts: getShowNSFWPosts(state),
    showImagesOnly: getShowImagesOnly(state),
    nightmode: getNightmode(state),
    rewriteLinks: getRewriteLinks(state),
    useBeta: getUseBeta(state),
    loading: getIsSettingsLoading(state),
    upvoteSetting: getUpvoteSetting(state),
    boardSetting: getBoardSetting(state),
    languageSetting: getLanguageSetting(state),
    accessList: getAccessListSetting(state),
    access: getAccessSetting(state),
    exitPageSetting: getExitPageSetting(state),
  }),
  { reload, saveSettings, notify },
)
export default class Settings extends React.Component {
  static propTypes = {
    user: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    reloading: PropTypes.bool,
    locale: PropTypes.string,
    votingPower: PropTypes.string,
    boardSetting: PropTypes.string,
    languageSetting: PropTypes.string,
    accessList: PropTypes.array,
    access: PropTypes.string,
    votePercent: PropTypes.number,
    loading: PropTypes.bool,
    showNSFWPosts: PropTypes.bool,
    showImagesOnly: PropTypes.bool,
    nightmode: PropTypes.bool,
    rewriteLinks: PropTypes.bool,
    useBeta: PropTypes.bool,
    reload: PropTypes.func,
    saveSettings: PropTypes.func,
    notify: PropTypes.func,
    upvoteSetting: PropTypes.bool,
    exitPageSetting: PropTypes.bool,
  };

  static defaultProps = {
    reloading: false,
    locale: 'auto',
    votingPower: 'off',
    languageSetting: 'en',
    accessList: [],
    access: 'public',
    boardSetting: boardValues.random,
    votePercent: 10000,
    loading: false,
    showNSFWPosts: false,
    showImagesOnly: false,
    nightmode: false,
    rewriteLinks: false,
    useBeta: false,
    upvoteSetting: true,
    exitPageSetting: false,
    reload: () => {},
    saveSettings: () => {},
    notify: () => {},
  };

  constructor(props) {
    super(props);
    this.handleUpvoteSettingChange = this.handleUpvoteSettingChange.bind(this);
  }

  state = {
    locale: 'auto',
    votingPower: 'off',
    votePercent: 10000,
    showNSFWPosts: false,
    showImagesOnly: false,
    nightmode: false,
    rewriteLinks: false,
    boardSetting: boardValues.random,
    languageSetting: 'en',
    accessList: [],
    access: 'public',
    exitPageSetting: false,
  };

  componentWillMount() {
    this.setState({
      locale: this.props.locale,
      votingPower: this.props.votingPower,
      votePercent: this.props.votePercent / 100,
      showNSFWPosts: this.props.showNSFWPosts,
      showImagesOnly: this.props.showImagesOnly,
      boardSetting: this.props.boardSetting,
      languageSetting: this.props.languageSetting,
      accessList: this.props.accessList,
      access: this.props.access,
      nightmode: this.props.nightmode,
      rewriteLinks: this.props.rewriteLinks,
      useBeta: this.props.useBeta,
      upvoteSetting: this.props.upvoteSetting,
      exitPageSetting: this.props.exitPageSetting,
    });
  }

  componentDidMount() {
    this.props.reload();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.locale !== this.props.locale) {
      this.setState({ locale: nextProps.locale });
    }

    if (nextProps.votingPower !== this.props.votingPower) {
      this.setState({ votingPower: nextProps.votingPower });
    }

    if (nextProps.votePercent !== this.props.votePercent) {
      this.setState({ votePercent: nextProps.votePercent / 100 });
    }

    if (nextProps.showNSFWPosts !== this.props.showNSFWPosts) {
      this.setState({ showNSFWPosts: nextProps.showNSFWPosts });
    }

    if (nextProps.showImagesOnly !== this.props.showImagesOnly) {
      this.setState({ showImagesOnly: nextProps.showImagesOnly });
    }

    if (nextProps.nightmode !== this.props.nightmode) {
      this.setState({ nightmode: nextProps.nightmode });
    }

    if (nextProps.rewriteLinks !== this.props.rewriteLinks) {
      this.setState({ rewriteLinks: nextProps.rewriteLinks });
    }

    if (nextProps.useBeta !== this.props.useBeta) {
      this.setState({ useBeta: nextProps.useBeta });
    }

    if (nextProps.upvoteSetting !== this.props.upvoteSetting) {
      this.setState({ upvoteSetting: nextProps.upvoteSetting });
    }

    if (nextProps.boardSetting !== this.props.boardSetting) {
      this.setState({ boardSetting: nextProps.boardSetting });
    }

    if (nextProps.languageSetting !== this.props.languageSetting) {
      this.setState({ languageSetting: nextProps.languageSetting });
    }

    if (nextProps.accessList !== this.props.accessList) {
      this.setState({ accessList: nextProps.accessList});
    }

    if (nextProps.access !== this.props.access) {
      this.setState({ access: nextProps.access});
    }

    if (nextProps.exitPageSetting !== this.props.exitPageSetting) {
      this.setState({ exitPageSetting: nextProps.exitPageSetting });
    }
  }

  handleSave = () => {
    this.props
      .saveSettings({
        locale: this.state.locale,
        votingPower: this.state.votingPower,
        votePercent: this.state.votePercent * 100,
        showNSFWPosts: this.state.showNSFWPosts,
        showImagesOnly: this.state.showImagesOnly,
        nightmode: this.state.nightmode,
        rewriteLinks: this.state.rewriteLinks,
        useBeta: this.state.useBeta,
        upvoteSetting: this.state.upvoteSetting,
        boardSetting: this.state.boardSetting,
        languageSetting: this.state.languageSetting,
        accessList: this.state.accessList,
        access: this.state.access,
        exitPageSetting: this.state.exitPageSetting,
      })
      .then(() =>
        this.props.notify(
          this.props.intl.formatMessage({ id: 'saved', defaultMessage: 'Saved' }),
          'success',
        ),
      );
  };

  handleLocaleChange = locale => this.setState({ locale });
  handleVotingPowerChange = event => this.setState({ votingPower: event.target.value });
  handleBoardChange = boardSetting => this.setState({ boardSetting });
  handleLanguageChange = languageSetting => this.setState({ languageSetting });
  handleAccessListChange = accessList => this.setState({ accessList });
  handleAccessChange = access => this.setState({ access });
  handleVotePercentChange = value => this.setState({ votePercent: value });
  handleShowNSFWPosts = event => this.setState({ showNSFWPosts: event.target.checked });
  handleShowImagesOnly = event => this.setState({ showImagesOnly: event.target.checked });
  handleNightmode = event => this.setState({ nightmode: event.target.checked });
  handleRewriteLinksChange = event => this.setState({ rewriteLinks: event.target.checked });
  handleUseBetaChange = event => this.setState({ useBeta: event.target.checked });
  handleExitPageSettingChange = event => this.setState({ exitPageSetting: event.target.checked });

  handleUpvoteSettingChange(event) {
    this.setState({ upvoteSetting: event.target.checked });
  }

  render() {
    const {
      intl,
      reloading,
      locale: initialLocale,
      votingPower: initialVotingPower,
      boardSetting: initialBoardSetting,
      languageSetting: initialLanguageSetting,
      accessList: initialAccessList,
      access: initialAccess,
      showNSFWPosts: initialShowNSFWPosts,
      showImagesOnly: initialShowImagesOnly,
      nightmode: initialNightmode,
      loading,
    } = this.props;
    const {
      votingPower,
      locale,
      boardSetting,
      languageSetting,
      accessList,
      access,
      showNSFWPosts,
      showImagesOnly,
      nightmode,
      rewriteLinks,
      upvoteSetting,
      exitPageSetting,
    } = this.state;

    const languageOptions = [];

    if (locale === 'auto') {
      languageOptions.push(
        <Select.Option disabled key="auto" value="auto">
          <FormattedMessage id="select_language" defaultMessage="Select your language" />
        </Select.Option>,
      );
    }

    LANGUAGES.forEach(lang => {
      languageOptions.push(
        <Select.Option key={lang.id} value={lang.id}>
          {getLanguageText(lang)}
        </Select.Option>,
      );
    });

    return (
      <div className="shifted">
        <Helmet>
          <title>{intl.formatMessage({ id: 'settings', defaultMessage: 'Settings' })} - WeYouMe</title>
        </Helmet>
        <div className="settings-layout container">
          <Affix className="leftContainer" stickPosition={77}>
            <div className="left">
              <LeftSidebar />
            </div>
          </Affix>
          <div className="center">
            <h1>
              <FormattedMessage id="settings" defaultMessage="Settings" />
            </h1>
            {reloading ? (
              <Loading center={false} />
            ) : (
              <div className="Settings">
              <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="boards" defaultMessage="Board Selection" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="board_info"
                      defaultMessage="Which board do you want to post to by default?"
                    />
                  </p>
                  <Select
                    defaultValue={initialBoardSetting}
                    value={boardSetting}
                    style={{ width: '100%', maxWidth: 240 }}
                    onChange={this.handleBoardChange}
                  >
                    <Select.Option value={boardValues.pics} key={boardValues.pics}>
                      <FormattedMessage id="board_pics" defaultMessage="Pictures" />
                    </Select.Option>
                    <Select.Option value={boardValues.vids} key={boardValues.vids}>
                      <FormattedMessage id="board_vids" defaultMessage="Videos" />
                    </Select.Option>
                    <Select.Option value={boardValues.news} key={boardValues.news}>
                      <FormattedMessage id="board_news" defaultMessage="News" />
                    </Select.Option>
                    <Select.Option value={boardValues.music} key={boardValues.music}>
                      <FormattedMessage id="board_music" defaultMessage="Music" />
                    </Select.Option>
                    <Select.Option value={boardValues.tech} key={boardValues.tech}>
                      <FormattedMessage id="board_tech" defaultMessage="Technology" />
                    </Select.Option>
                    <Select.Option value={boardValues.politics} key={boardValues.politics}>
                      <FormattedMessage id="board_politics" defaultMessage="Politics" />
                    </Select.Option>
                    <Select.Option value={boardValues.crypto} key={boardValues.crypto}>
                      <FormattedMessage id="board_crypto" defaultMessage="Crypto" />
                    </Select.Option>
                    <Select.Option value={boardValues.intro} key={boardValues.intro}>
                      <FormattedMessage id="board_intro" defaultMessage="Introductions" />
                    </Select.Option>
                    <Select.Option value={boardValues.games} key={boardValues.games}>
                      <FormattedMessage id="board_games" defaultMessage="Games" />
                    </Select.Option>
                    <Select.Option value={boardValues.sport} key={boardValues.sport}>
                      <FormattedMessage id="board_sport" defaultMessage="Sport" />
                    </Select.Option>
                    <Select.Option value={boardValues.text} key={boardValues.text}>
                      <FormattedMessage id="board_text" defaultMessage="Text" />
                    </Select.Option>
                    <Select.Option value={boardValues.links} key={boardValues.links}>
                      <FormattedMessage id="board_links" defaultMessage="Links" />
                    </Select.Option>
                    <Select.Option value={boardValues.nsfw} key={boardValues.nsfw}>
                      <FormattedMessage id="board_nsfw" defaultMessage="NSFW" />
                    </Select.Option>
                    <Select.Option value={boardValues.random} key={boardValues.random}>
                      <FormattedMessage id="board_random" defaultMessage="Random" />
                    </Select.Option>
                  </Select>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="language_tag" defaultMessage="Posting Language Selection" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="language_info"
                      defaultMessage="Which posting language do you want to use?"
                    />
                  </p>
                  <Select
                    defaultValue={initialLanguageSetting}
                    value={languageSetting}
                    style={{ width: '100%', maxWidth: 240 }}
                    onChange={this.handleLanguageChange}
                  >
                    <Select.Option value={"en"}>
                      <FormattedMessage id="lan_en" defaultMessage="English" />
                    </Select.Option>
                    <Select.Option value={"hi"}>
                      <FormattedMessage id="lan_hi" defaultMessage="Hindi" />
                    </Select.Option>
                    <Select.Option value={"zh"}>
                      <FormattedMessage id="lan_zh" defaultMessage="Chinese" />
                    </Select.Option>
                    <Select.Option value={"es"}>
                      <FormattedMessage id="lan_es" defaultMessage="Spanish" />
                    </Select.Option>
                    <Select.Option value={"de"}>
                      <FormattedMessage id="lan_de" defaultMessage="German" />
                    </Select.Option>
                    <Select.Option value={"fr"}>
                      <FormattedMessage id="lan_fr" defaultMessage="French" />
                    </Select.Option>
                    <Select.Option value={"ru"}>
                      <FormattedMessage id="lan_ru" defaultMessage="Russian" />
                    </Select.Option>
                    <Select.Option value={"ja"}>
                      <FormattedMessage id="lan_ja" defaultMessage="Japanese" />
                    </Select.Option>
                  </Select>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="access_message" defaultMessage="Post privacy setting" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="access_info"
                      defaultMessage="Which posting type do you want to use?"
                    />
                  </p>
                  <Select
                    defaultValue={initialAccess}
                    value={access}
                    style={{ width: '100%', maxWidth: 240 }}
                    onChange={this.handleAccessChange}
                  >
                    <Select.Option value={'public'}>
                      <i className="iconfont icon-group" />
                      <FormattedMessage id="public_post" defaultMessage="Public Post" />
                    </Select.Option>
                    <Select.Option value={'private'}>
                      <i className="iconfont icon-lock" />
                      <FormattedMessage id="private_post" defaultMessage="Encrypted Private Post" />
                    </Select.Option>
                  </Select>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="select_accesslist" defaultMessage="Private Post Connections List" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="access_list"
                      defaultMessage="These users will be able to access your encrypted private posts."
                    />
                  </p>
                <Select
                  ref={ref => {
                    this.select = ref;
                  }}
                  defaultValue={initialAccessList}
                  value={accessList}
                  onChange={this.handleAccessListChange}
                  className="Editor__accesslist"
                  mode="tags"
                  placeholder={intl.formatMessage({
                    id: 'accesslist_placeholder',
                    defaultMessage: 'Add usernames here:',
                  })}
                  dropdownStyle={{ display: 'none' }}
                  tokenSeparators={[' ', ',']}
                />
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="voting_power" defaultMessage="Voting Power" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="voting_power_info"
                      defaultMessage="You can enable Voting Power slider to specify exact percentage of your Voting Power to use for like."
                    />
                  </p>
                  <Radio.Group
                    defaultValue={initialVotingPower}
                    value={votingPower}
                    onChange={this.handleVotingPowerChange}
                  >
                    <Radio value="off">
                      <FormattedMessage id="voting_power_off" defaultMessage="Disable slider" />
                    </Radio>
                    <Radio value="on">
                      <FormattedMessage id="voting_power_on" defaultMessage="Enable slider" />
                    </Radio>
                  </Radio.Group>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="vote_percent" defaultMessage="Default vote percent" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="vote_percent_info"
                      defaultMessage="You can select your default vote value. It will be used as default value in voting slider and as value used for vote when voting slider is disabled."
                    />
                  </p>
                  <div className="Settings__section__component">
                    <RawSlider
                      initialValue={this.state.votePercent}
                      onChange={this.handleVotePercentChange}
                    />
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="language" defaultMessage="Language" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="language_info"
                      defaultMessage="What language do you want to use on WeYouMe?"
                    />
                  </p>
                  <Select
                    defaultValue={initialLocale}
                    value={locale}
                    style={{ width: '100%', maxWidth: 240 }}
                    onChange={this.handleLocaleChange}
                  >
                    {languageOptions}
                  </Select>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="nsfw_posts" defaultMessage="NSFW Posts" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="display_nsfw_posts_details"
                      defaultMessage="Enable posts tagged with NSFW to be shown as default, and NSFW usernames to be shown in discovery."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="nsfw_posts"
                      defaultChecked={initialShowNSFWPosts}
                      checked={showNSFWPosts}
                      onChange={this.handleShowNSFWPosts}
                    >
                      <FormattedMessage
                        id="display_nsfw_posts"
                        defaultMessage="Display NSFW Content"
                      />
                    </Checkbox>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="image_mode" defaultMessage="Image Only Mode" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="display_image_mode_details"
                      defaultMessage="All posts will only display their preview images."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="image_mode"
                      defaultChecked={initialShowImagesOnly}
                      checked={showImagesOnly}
                      onChange={this.handleShowImagesOnly}
                    >
                      <FormattedMessage
                        id="dimage_only_display"
                        defaultMessage="Only Show Images"
                      />
                    </Checkbox>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="nightmode" defaultMessage="Nightmode" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="nightmode_details"
                      defaultMessage="You can enable this option for a more eye-friendly experience at night."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="nightmode"
                      defaultChecked={initialNightmode}
                      checked={nightmode}
                      onChange={this.handleNightmode}
                    >
                      <FormattedMessage id="use_nightmode" defaultMessage="Use Nightmode" />
                    </Checkbox>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="rewrite_links" defaultMessage="Rewrite links" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="rewrite_links_details"
                      defaultMessage="You can enable this option to replace alpha.weyoume.io links with alpha.weyoume.io links."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="rewrite_links"
                      checked={rewriteLinks}
                      onChange={this.handleRewriteLinksChange}
                    >
                      <FormattedMessage id="rewrite_links" defaultMessage="Rewrite links" />
                    </Checkbox>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="upvote_setting" defaultMessage="Like my posts" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="upvote_setting_details"
                      defaultMessage="Enable this option to automatically like your own posts."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="upvote_setting"
                      checked={upvoteSetting}
                      onChange={this.handleUpvoteSettingChange}
                    >
                      <FormattedMessage id="upvote_setting" defaultMessage="Like my posts" />
                    </Checkbox>
                  </div>
                </div>
                <div className="Settings__section">
                  <h3>
                    <FormattedMessage id="enable_exit_page" defaultMessage="Enable exit page" />
                  </h3>
                  <p>
                    <FormattedMessage
                      id="enable_exit_page_details"
                      defaultMessage="Enable this option to use the exit page when clicking on an external link."
                    />
                  </p>
                  <div className="Settings__section__checkbox">
                    <Checkbox
                      name="exit_page_setting"
                      checked={exitPageSetting}
                      onChange={this.handleExitPageSettingChange}
                    >
                      <FormattedMessage id="enable_exit_page" defaultMessage="Enable exit page" />
                    </Checkbox>
                  </div>
                </div>
                <Action primary big loading={loading} onClick={this.handleSave}>
                  <FormattedMessage id="save" defaultMessage="Save" />
                </Action>
                <div className="Settings__version">
                  <p>
                    <FormattedMessage
                      id="version"
                      defaultMessage="Version: {version}"
                      values={{ version: packageJson.version }}
                    />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
