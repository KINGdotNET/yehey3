import Wrapper from '../client/Wrapper';

import Bookmarks from '../client/bookmarks/Bookmarks';
import Drafts from '../client/post/Write/Drafts';
import Replies from '../client/replies/Replies';
import Activity from '../client/activity/Activity';
import Wallet from '../client/wallet/Wallet';
import Transaction from '../client/wallet/Transaction';
import Editor from '../client/post/Write/Write';
import Settings from '../client/settings/Settings';
import ProfileSettings from '../client/settings/ProfileSettings';
import Invite from '../client/invite/Invite';
import User from '../client/user/User';
import UserProfile from '../client/user/UserProfile';
import UserComments from '../client/user/UserComments';
import UserFollowers from '../client/user/UserFollowers';
import UserFollowing from '../client/user/UserFollowing';
import UserReblogs from '../client/user/UserReblogs';
import UserWallet from '../client/user/UserWallet';
import UserActivity from '../client/activity/UserActivity';
import Post from '../client/post/Post';
import Page from '../client/feed/Page';
import Search from '../client/search/Search';
import Notifications from '../client/notifications/Notifications';
import Error404 from '../client/statics/Error404';
import ExitPage from '../client/statics/ExitPage';
import Boards from '../client/discover/Boards';
import Network from '../client/discover/Network';
import About from '../client/discover/About';
import Welcome from '../client/discover/Welcome';
import BlockPage from '../client/discover/BlockPage';
import DiscoverPage from '../client/discover/DiscoverPage';
import DiscoverRecommended from '../client/discover/DiscoverRecommended';
import DiscoverFollowers from '../client/discover/DiscoverFollowers';
import DiscoverPower from '../client/discover/DiscoverPower';
import DiscoverPosts from '../client/discover/DiscoverPosts';
import DiscoverRandom from '../client/discover/DiscoverRandom';
import Coins from '../client/discover/Coins';
import Authorize from '../client/components/Authorize';
import Messages from '../client/messages/Messages';
import MessagesHome from '../client/messages/MessagesHome';
import Sign from '../client/components/Sign';
import Generate from '../client/components/GenerateLink';

const routes = [
  {
    component: Wrapper,
    routes: [
      {
        path: '/bookmarks',
        exact: true,
        component: Bookmarks,
      },
      {
        path: '/generate',
        exact: true,
        component: Generate,
      },
      {
        path: '/sign/:type?/:base64?',
        component: Sign,
      },
      {
        path: '/drafts',
        exact: true,
        component: Drafts,
      },
      {
        path: '/login',
        exact: true,
        component: Authorize,
      },
      {
        path: '/replies',
        exact: true,
        component: Replies,
      },
      {
        path: '/activity',
        exact: true,
        component: Activity,
      },
      {
        path: '/wallet',
        exact: true,
        component: Wallet,
      },
      {
        path: '/editor',
        component: Editor,
        exact: true,
      },
      {
        path: '/settings',
        exact: true,
        component: Settings,
      },
      {
        path: '/edit-profile',
        exact: true,
        component: ProfileSettings,
      },
      {
        path: '/invite',
        exact: true,
        component: Invite,
      },
      {
        path: '/notifications',
        exact: true,
        component: Notifications,
      },
      {
        path: '/@:name/(comments|followers|followed|reblogs|transfers|activity)?',
        component: User,
        exact: true,
        routes: [
          {
            path: '/@:name',
            exact: true,
            component: UserProfile,
          },
          {
            path: '/@:name/comments',
            exact: true,
            component: UserComments,
          },
          {
            path: '/@:name/followers',
            exact: true,
            component: UserFollowers,
          },
          {
            path: '/@:name/followed',
            exact: true,
            component: UserFollowing,
          },
          {
            path: '/@:name/reblogs',
            exact: true,
            component: UserReblogs,
          },
          {
            path: '/@:name/transfers',
            exact: true,
            component: UserWallet,
          },
          {
            path: '/@:name/activity',
            exact: true,
            component: UserActivity,
          },
        ],
      },
      {
        path: '/discover/(followers|power|posts|random)?',
        exact: true,
        component: DiscoverPage,
        routes: [
          {
            path: '/discover',
            exact: true,
            component: DiscoverRecommended,
          },
          {
            path: '/discover/followers',
            exact: true,
            component: DiscoverFollowers,
          },
          {
            path: '/discover/power',
            exact: true,
            component: DiscoverPower,
          },
          {
            path: '/discover/posts',
            exact: true,
            component: DiscoverPosts,
          },
          {
            path: '/discover/random',
            exact: true,
            component: DiscoverRandom,
          },
        ],
      },
      {
        path: '/boards',
        exact: true,
        component: Boards,
      },
      {
        path: '/network',
        exact: true,
        component: Network,
      },
      {
        path: '/about',
        exact: true,
        component: About,
      },
      {
        path: '/welcome',
        exact: true,
        component: Welcome,
      },
      {
        path: '/:category?/@:author/:permlink',
        component: Post,
      },
      {
        path: '/search',
        component: Search,
      },
      {
        path: '/tx/:txid',
        exact: true,
        component: Transaction,
      },
      {
        path: '/messages',
        exact: true,
        component: MessagesHome,
      },
      {
        path: '/messages/@:recipient',
        exact: true,
        component: Messages,
      },
      {
        path: '/block/:num',
        exact: true,
        component: BlockPage,
      },
      {
        path: '/exit',
        component: ExitPage,
      },
      {
        path: '/:sortBy1(created|active|trending|hot|promoted|feed)?-:category1?/:sortBy2(created|active|trending|hot|promoted|feed)?-:category2?',
        component: Page,
      },
      {
        path: '/feed',
        component: Page,
      },
      {
        path: '/coins',
        exact: true,
        component: Coins,
      },
      {
        path: '/',
        component: Page,
      },
      {
        path: '*',
        component: Error404,
      },
    ],
  },
];

export default routes;
