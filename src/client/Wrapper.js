import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { LocaleProvider, Layout } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import Cookie from 'js-cookie';
import { findLanguage, getRequestLocale, getBrowserLocale, loadLanguage } from './translations';
import {
  getIsLoaded,
  getAuthenticatedUser,
  getAuthenticatedUserName,
  getLocale,
  getUsedLocale,
  getTranslations,
  getUseBeta,
  getNightmode,
  getShowNSFWPosts,
  getAllAccountsList
} from './reducers';
import { login, logout, busyLogin } from './auth/authActions';
import { getFollowing, getNotifications, getNetworkUsers, getAllAccounts } from './user/userActions';
import {
  getRate,
  getRewardFund,
  getTrendingTopics,
  setUsedLocale,
  setAppUrl,
} from './app/appActions';
import * as reblogActions from './app/Reblog/reblogActions';
import Redirect from './components/Utils/Redirect';
import NotificationPopup from './notifications/NotificationPopup';
import Topnav from './components/Navigation/Topnav';
import Botnav from './components/Navigation/Botnav';
import Transfer from './wallet/Transfer';
import PowerUpOrDown from './wallet/PowerUpOrDown';
import BBackTop from './components/BBackTop';

@withRouter
@connect(
  state => ({
    loaded: getIsLoaded(state),
    user: getAuthenticatedUser(state),
    username: getAuthenticatedUserName(state),
    usedLocale: getUsedLocale(state),
    translations: getTranslations(state),
    locale: getLocale(state),
    nightmode: getNightmode(state),
    showNSFWposts: getShowNSFWPosts(state),
    allAccounts: getAllAccountsList(state),
  }),
  {
    login,
    logout,
    getNetworkUsers,
    getFollowing,
    getNotifications,
    getRate,
    getRewardFund,
    getTrendingTopics,
    busyLogin,
    getRebloggedList: reblogActions.getRebloggedList,
    setUsedLocale,
    getAllAccounts,
  },
)
export default class Wrapper extends React.PureComponent {
  static propTypes = {
    route: PropTypes.shape().isRequired,
    user: PropTypes.shape().isRequired,
    locale: PropTypes.string.isRequired,
    history: PropTypes.shape().isRequired,
    usedLocale: PropTypes.string,
    translations: PropTypes.shape(),
    username: PropTypes.string,
    allAccounts: PropTypes.array.isRequired,
    login: PropTypes.func,
    logout: PropTypes.func,
    getFollowing: PropTypes.func,
    getNetworkUsers: PropTypes.func,
    getAllAccounts: PropTypes.func,
    getRewardFund: PropTypes.func,
    getRebloggedList: PropTypes.func,
    getRate: PropTypes.func,
    getTrendingTopics: PropTypes.func,
    getNotifications: PropTypes.func,
    setUsedLocale: PropTypes.func,
    busyLogin: PropTypes.func,
    nightmode: PropTypes.bool,
    showNSFWposts: PropTypes.bool,
  };

  static defaultProps = {
    usedLocale: null,
    translations: {},
    username: '',
    showNSFWposts: false,
    login: () => {},
    logout: () => {},
    getFollowing: () => {},
    getNetworkUsers: () => {},
    getRewardFund: () => {},
    getRebloggedList: () => {},
    getRate: () => {},
    getTrendingTopics: () => {},
    getNotifications: () => {},
    setUsedLocale: () => {},
    busyLogin: () => {},
    nightmode: false,
  };

  static async fetchData({ store, req, res }) {
    await store.dispatch(login());

    const appUrl = url.format({
      protocol: req.protocol,
      host: req.get('host'),
    });

    store.dispatch(setAppUrl(appUrl));

    const state = store.getState();

    const useBeta = getUseBeta(state);

    if (useBeta && appUrl === 'https://alpha.weyoume.io') {
      res.redirect(`https://alpha.weyoume.io${req.originalUrl}`);
      return;
    }

    let activeLocale = getLocale(state);
    if (activeLocale === 'auto') {
      activeLocale = req.cookies.language || getRequestLocale(req.get('Accept-Language'));
    }

    const lang = await loadLanguage(activeLocale);

    store.dispatch(setUsedLocale(lang));
  }

  constructor(props) {
    super(props);

    this.loadLocale = this.loadLocale.bind(this);
    this.handleMenuItemClick = this.handleMenuItemClick.bind(this);
  }

  componentDidMount() {
    const { showNSFWposts } = this.props;
    this.props.login().then(() => {
      this.props.getFollowing();
      this.props.getNotifications();
      this.props.busyLogin();
    });
    this.props.getNetworkUsers(showNSFWposts);
    this.props.getRewardFund();
    this.props.getRebloggedList();
    this.props.getRate();
    this.props.getTrendingTopics();
  }

  componentWillReceiveProps(nextProps) {
    const { locale } = this.props;

    if (locale !== nextProps.locale) {
      this.loadLocale(nextProps.locale);
    }
  }

  componentDidUpdate() {
    if (this.props.nightmode) {
      document.body.classList.add('nightmode');
    } else {
      document.body.classList.remove('nightmode');
    }
  }

  async loadLocale(locale) {
    let activeLocale = locale;
    if (activeLocale === 'auto') {
      activeLocale = Cookie.get('language') || getBrowserLocale();
    }

    const lang = await loadLanguage(activeLocale);

    this.props.setUsedLocale(lang);
  }

  handleMenuItemClick(key) {
    switch (key) {
      case 'logout':
        this.props.logout();
        break;
      case 'activity':
        this.props.history.push('/activity');
        break;
      case 'replies':
        this.props.history.push('/replies');
        break;
      case 'bookmarks':
        this.props.history.push('/bookmarks');
        break;
      case 'drafts':
        this.props.history.push('/drafts');
        break;
      case 'settings':
        this.props.history.push('/settings');
        break;
			case 'feed':
        this.props.history.push(`/feed-${this.props.username}/feed-${this.props.username}`);
        break;
			case 'hot':
        this.props.history.push('/hot-all/hot-all');
        break;
      case 'new':
        this.props.history.push('/created-all/created-all');
        break;
			case 'trending':
        this.props.history.push('/trending-all/trending-all');
        break;
      case 'boards':
        this.props.history.push('/boards');
        break;
      case 'discover':
        this.props.history.push('/discover/');
        break;
			case 'wallet':
        this.props.history.push('/wallet');
        break;
      case 'network':
        this.props.history.push('/network');
        break;
      case 'about':
        this.props.history.push('/about');
        break;
      case 'invite':
        this.props.history.push('/invite');
        break;
			case 'edit-profile':
        this.props.history.push('/edit-profile');
        break;
      case 'my-profile':
        this.props.history.push(`/@${this.props.username}`);
        break;
      default:
        break;
    }
  }

  render() {
    const { user, usedLocale, translations } = this.props;

    const language = findLanguage(usedLocale);

    return (
      <IntlProvider key={language.id} locale={language.localeData} messages={translations}>
        <LocaleProvider locale={enUS}>
          <Layout data-dir={language && language.rtl ? 'rtl' : 'ltr'}>
            <Layout.Header style={{ position: 'fixed', width: '100%', zIndex: 1050 }}>
              <Topnav username={user.name} onMenuItemClick={this.handleMenuItemClick} />
            </Layout.Header>
            <div className="content">
              {renderRoutes(this.props.route.routes)}
              <Redirect />
              <Transfer />
              <PowerUpOrDown />
              <NotificationPopup />
            </div>
            <Layout.Footer style={{ position: 'fixed', width: '100%', zIndex: 1050, bottom: '0%', padding: 0 }}>
              <Botnav username={user.name} onMenuItemClick={this.handleMenuItemClick} />
            </Layout.Footer>
          </Layout>

        </LocaleProvider>
      </IntlProvider>
    );
  }
}
