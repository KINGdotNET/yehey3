import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Menu, Input, AutoComplete, Button } from 'antd';
import Action from '../Button/Action';
import classNames from 'classnames';
import { searchAutoComplete } from '../../search/searchActions';
import { getUpdatedSCUserMetadata } from '../../auth/authActions';
import {
  getAutoCompleteSearchResults,
  getNotifications,
  getAuthenticatedUserSCMetaData,
  getIsLoadingNotifications,
} from '../../reducers';
import weauthjsInstance from '../../weauthjsInstance';
import { PARSED_NOTIFICATIONS } from '../../../common/constants/notifications';
import BTooltip from '../BTooltip';
import Avatar from '../Avatar';
import PopoverMenu, { PopoverMenuItem } from '../PopoverMenu/PopoverMenu';
import Popover from '../Popover';
import Notifications from './Notifications/Notifications';
import LanguageSettings from './LanguageSettings';
import './Topnav.less';

@injectIntl
@withRouter
@connect(
  state => ({
    autoCompleteSearchResults: getAutoCompleteSearchResults(state),
    notifications: getNotifications(state),
    userSCMetaData: getAuthenticatedUserSCMetaData(state),
    loadingNotifications: getIsLoadingNotifications(state),
  }),
  {
    searchAutoComplete,
    getUpdatedSCUserMetadata,
  },
)
class Topnav extends React.Component {
  static propTypes = {
    autoCompleteSearchResults: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.shape().isRequired,
    location: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
    username: PropTypes.string,
    notifications: PropTypes.arrayOf(PropTypes.shape()),
    searchAutoComplete: PropTypes.func.isRequired,
    getUpdatedSCUserMetadata: PropTypes.func.isRequired,
    onMenuItemClick: PropTypes.func,
    userSCMetaData: PropTypes.shape(),
    loadingNotifications: PropTypes.bool,
  };

  static defaultProps = {
    autoCompleteSearchResults: [],
    notifications: [],
    username: undefined,
    onMenuItemClick: () => {},
    userSCMetaData: {},
    loadingNotifications: false,
  };

  static handleScrollToTop() {
    if (window) {
      window.scrollTo(0, 0);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      searchBarActive: false,
      popoverVisible: false,
      searchBarValue: '',
    };
    this.handleMoreMenuSelect = this.handleMoreMenuSelect.bind(this);
    this.handleMoreMenuVisibleChange = this.handleMoreMenuVisibleChange.bind(this);
    this.handleSelectOnAutoCompleteDropdown = this.handleSelectOnAutoCompleteDropdown.bind(this);
    this.handleAutoCompleteSearch = this.handleAutoCompleteSearch.bind(this);
    this.handleSearchForInput = this.handleSearchForInput.bind(this);
    this.handleOnChangeForAutoComplete = this.handleOnChangeForAutoComplete.bind(this);
    this.hideAutoCompleteDropdown = this.hideAutoCompleteDropdown.bind(this);
  }

  handleMoreMenuSelect(key) {
    this.setState({ popoverVisible: false }, () => {
      this.props.onMenuItemClick(key);
    });
  }

  handleMoreMenuVisibleChange(visible) {
    this.setState({ popoverVisible: visible });
  }

  menuForLoggedOut = () => {
    const { location } = this.props;
    const { searchBarActive } = this.state;
    const next = location.pathname.length > 1 ? location.pathname : '';

    return (
      <div
        className={classNames('Topnav__menu-container Topnav__menu-logged-out', {
          'Topnav__mobile-hidden': searchBarActive,
        })}
      >
        <Menu className="Topnav__menu-container__menu" mode="horizontal">
          <Menu.Item key="signup">
            <Action primary>
            <a target="_blank" rel="noopener noreferrer" href={process.env.SIGNUP_URL}>
            <div className="Topnav__menu__link">
                <FormattedMessage id="signup" defaultMessage="Sign up" />
            </div>
            </a>
            </Action>
          </Menu.Item>
          <Menu.Item key="divider" disabled>
            |
          </Menu.Item>
          <Menu.Item key="login">
          <Action primary>
            <a href={weauthjsInstance.getLoginURL(next)} className="Topnav__menu__link">
            <div className="Topnav__menu__link"> 
                <FormattedMessage id="login" defaultMessage="Log in" />
            </div>
            </a>
          </Action>
          </Menu.Item>
        </Menu>
      </div>
    );
  };

  menuForLoggedIn = () => {
    const { intl, username, notifications, userSCMetaData } = this.props;
    const { searchBarActive, popoverVisible } = this.state;
    const lastSeenTimestamp = _.get(userSCMetaData, 'notifications_last_timestamp');
    const notificationsCount = _.isUndefined(lastSeenTimestamp)
      ? _.size(notifications)
      : _.size(
          _.filter(
            notifications,
            notification =>
              lastSeenTimestamp < notification.timestamp &&
              _.includes(PARSED_NOTIFICATIONS, notification.type),
          ),
        );
    const displayBadge = notificationsCount > 0;
    const notificationsCountDisplay = notificationsCount > 99 ? '99+' : notificationsCount;
    return (
      <div
        className={classNames('Topnav__menu-container', {
          'Topnav__mobile-hidden': searchBarActive,
        })}
      >
        <Menu selectedKeys={[]} className="Topnav__menu-container__menu" mode="horizontal">

          <Menu.Item key="home" className="Topnav__item--badge">
            <Link to={`/trending-all/feed-${username}`} className="Topnav__link Topnav__link--light Topnav__link--action">
                <i className="iconfont icon-homepage" />
                <FormattedMessage id="nav_home" defaultMessage="Home" />
            </Link>
          </Menu.Item>

          <Menu.Item key="search" className="Topnav__item--badge">
            <Link to="/search" className="Topnav__link Topnav__link--light Topnav__link--action">
                <i className="iconfont icon-search" />
                <FormattedMessage id="nav_search" defaultMessage="Search" />
            </Link>
          </Menu.Item>
          
          <Menu.Item key="write" className="Topnav__item--badge">
            <Link to="/editor" className="Topnav__link Topnav__link--light Topnav__link--action">
                <i className="iconfont icon-addition" />
                <FormattedMessage id="nav_post" defaultMessage="New Post" />
            </Link>
          </Menu.Item>

          <Menu.Item key="notifications" className="Topnav__item--badge">
                <Link to="/notifications" className="Topnav__link Topnav__link--light Topnav__link--action">
                <i className="iconfont icon-remind-old" />
                {displayBadge ? (
                  <div className="Topnav__notifications-count">{notificationsCountDisplay}</div>
                  ): null }
                <FormattedMessage id="nav_notifications" defaultMessage="Notifications" />
                </Link>
          </Menu.Item>

          <Menu.Item key="wallet" className="Topnav__item--badge">
                <Link to="/wallet" className="Topnav__link Topnav__link--light Topnav__link--action">
                  <i className="iconfont icon-wallet" />
                  <FormattedMessage id="nav_wallet" defaultMessage="Wallet" />
                </Link>
          </Menu.Item>

          <Menu.Item key="user" className="Topnav__item-user-main Topnav-dropdown-avatar-desktop">
            <Link className="Topnav__user" to={`/@${username}`} onClick={Topnav.handleScrollToTop}>
							<Avatar username={username} size={36} />
            </Link>
          </Menu.Item>
          <Menu.Item key="more" className="Topnav__menu--icon">
            <Popover
							className="popover-custom"
              placement="bottom"
              trigger="click"
              visible={popoverVisible}
              onVisibleChange={this.handleMoreMenuVisibleChange}
              overlayStyle={{ position: 'fixed' }}
              content={
								<PopoverMenu className="popoverMenu" onSelect={this.handleMoreMenuSelect}>
                  <PopoverMenuItem key="my-profile">
                    <FormattedMessage id="my_profile" defaultMessage="My profile" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="trending">
                    <FormattedMessage id="trending" defaultMessage="Trending" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="feed">
                    <FormattedMessage id="feed" defaultMessage="My Feed" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="hot">
                    <FormattedMessage id="hot" defaultMessage="Hot" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="new">
                    <FormattedMessage id="new" defaultMessage="New" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="boards">
                    <FormattedMessage id="boards" defaultMessage="Boards" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="discover">
                    <FormattedMessage id="discover" defaultMessage="Discover" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="bookmarks">
                    <FormattedMessage id="bookmarks" defaultMessage="Bookmarks" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="drafts">
                    <FormattedMessage id="drafts" defaultMessage="Drafts" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="network">
                    <FormattedMessage id="network" defaultMessage="Network" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="settings">
                    <FormattedMessage id="settings" defaultMessage="Settings" />
                  </PopoverMenuItem>
									<PopoverMenuItem key="edit-profile">
                    <FormattedMessage id="edit-profile" defaultMessage="Edit Profile" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="about">
                    <FormattedMessage id="about" defaultMessage="About" />
                  </PopoverMenuItem>
                  <PopoverMenuItem key="logout">
                    <FormattedMessage id="logout" defaultMessage="Logout" />
                  </PopoverMenuItem>
                </PopoverMenu>
              }
            >
              <a className="Topnav__link Topnav__link--light Topnav-dropdown-avatar-mobile">
								<Avatar username={username} size={36} />
              </a>
							<i className="iconfont icon-stealth Topnav-dropdown-caret" />
            </Popover>
          </Menu.Item>
        </Menu>
      </div>
    );
  };

  content = () => (this.props.username ? this.menuForLoggedIn() : this.menuForLoggedOut());

  handleMobileSearchButtonClick = () => {
    const { searchBarActive } = this.state;
    this.setState({ searchBarActive: !searchBarActive }, () => {
      this.searchInputRef.input.focus();
    });
  };

  hideAutoCompleteDropdown() {
    this.props.searchAutoComplete('');
  }

  handleSearchForInput(event) {
		let query = event.target.value;
    const value = event.target.value;
    this.hideAutoCompleteDropdown();
    this.props.history.push({
      pathname: '/search',
      search: `q=${value}`,
      state: {
        query: query,
      },
    });
  }

  debouncedSearch = _.debounce(value => this.props.searchAutoComplete(value), 300);

  handleAutoCompleteSearch(value) {
    this.debouncedSearch(value);
  }

  handleSelectOnAutoCompleteDropdown(value) {
		this.props.history.push(`/@${value}`);
		this.setState({
      searchBarValue: '',
    });
  }

  handleOnChangeForAutoComplete(value) {
		const { searchBarValue } = this.state;
			this.setState({
				searchBarValue: value,
			});
  }

  render() {
    const { intl, autoCompleteSearchResults } = this.props;
    const { searchBarActive, searchBarValue } = this.state;
    
    const dropdownOptions = autoCompleteSearchResults.map((option, i) => (
      <AutoComplete.Option key={`searchAccount-${i}`} value={option} className="Topnav__search-autocomplete">
        {`User: ${option}`}
      </AutoComplete.Option>
    ));
    const formattedAutoCompleteDropdown = _.isEmpty(searchBarValue)
      ? []
      : dropdownOptions.concat([

        <AutoComplete.Option disabled key="searchTag" className="Topnav__search-tag">
          <Link to={`/trending-${searchBarValue}/hot-${searchBarValue}`} key="searchTag-link">
            <span onClick={this.hideAutoCompleteDropdown} role="presentation">
                {intl.formatMessage(
                  {
                    id: 'search_tag_results',
                    defaultMessage: 'Tag: {search}',
                  },
                  { search: searchBarValue },
                )}
            </span>
          </Link>
        </AutoComplete.Option>,
        <AutoComplete.Option disabled key="searchPage-all" className="Topnav__search-all-results">
            <Link
              to={{
                pathname: '/search',
                search: `?q=${searchBarValue}`,
                state: { query: searchBarValue },
              }}
            >
              <span onClick={this.hideAutoCompleteDropdown} role="presentation">
                {intl.formatMessage(
                  {
                    id: 'search_all_results_for',
                    defaultMessage: 'Search all results for {search}',
                  },
                  { search: searchBarValue },
                )}
              </span>
            </Link>
          </AutoComplete.Option>
        ]);
    
    //console.log("formattedAutoCompleteDropdown:", formattedAutoCompleteDropdown);

    return (
      <div className="Topnav">
        <div className="topnav-layout">
          <div className={classNames('left', { 'Topnav__mobile-hidden': searchBarActive })}>
            <Link className="Topnav__brand" to="/trending-all/hot-all">
							<img src="/images/logo.png" className="Topnav__brand__logo"></img>
              <img src="/images/logo-mobile.png" className="Topnav__brand__logo-mobile"></img>
            </Link>
          </div>
          <div className={classNames('center', { mobileVisible: searchBarActive })}>
            <div className="Topnav__input-container">
              <AutoComplete
                dropdownClassName="Topnav__search-dropdown-container"
                dataSource={formattedAutoCompleteDropdown}
                onSearch={this.handleAutoCompleteSearch}
                onSelect={this.handleSelectOnAutoCompleteDropdown}
                onChange={this.handleOnChangeForAutoComplete}
                defaultActiveFirstOption={false}
                dropdownMatchSelectWidth={false}
                optionLabelProp="value"
                value={searchBarValue}
              >
                <Input
                  ref={ref => {
                    this.searchInputRef = ref;
                  }}
                  onPressEnter={this.handleSearchForInput}
                  placeholder={intl.formatMessage({
                    id: 'search_placeholder',
                    defaultMessage: 'Search:',
                  })}
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </AutoComplete>
              <i className="iconfont icon-search" />
            </div>
          </div>
          <div className="right">
            {this.content()}
          </div>
        </div>
      </div>
    );
  }
}

export default Topnav;
