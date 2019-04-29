import React from 'react';
import Action from '../components/Button/Action';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import Cookie from 'js-cookie';
import { connect } from 'react-redux';
import DiscoverUser from './DiscoverUser';
import { Button } from 'antd';
import _ from 'lodash';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount.js';
import {
    gettotalSCORE,
    getSCOREbackingTMEfundBalance,
  } from '../reducers';
  import {
    getGlobalProperties,
  } from '../wallet/walletActions';
import { getAccountWithFollowingCount } from '../helpers/apiHelpers';
import './About.less';

let referral = '';
    if (Cookie.get('referral')) {
        referral = Cookie.get('referral');
        //console.log("referral found: ", referral);
    }

@connect(
    (state) => ({
        totalSCORE: gettotalSCORE(state),
        SCOREbackingTMEfundBalance: getSCOREbackingTMEfundBalance(state),
    }),
    {
        getGlobalProperties,
    },
)

class About extends React.Component {
    static propTypes = {
        totalSCORE: PropTypes.string.isRequired,
        SCOREbackingTMEfundBalance: PropTypes.string.isRequired,
    };
    
    state = {
        user: {},
    };
    
    static fetchData({ store}) {
    return Promise.all([
            store.dispatch(getGlobalProperties()),
    ]);   
    }
    
    componentDidMount() {
    const { SCOREbackingTMEfundBalance, totalSCORE } = this.props;
    const { user } = this.state;

    if (_.isEmpty(SCOREbackingTMEfundBalance) || _.isEmpty(totalSCORE)) {
        this.props.getGlobalProperties();
    }

    if (_.isEmpty(user) && !_.isEmpty(referral)) {
        console.log("referral fetching user:", referral);
        getAccountWithFollowingCount(referral).then(user => {
        this.setState({
            user,
        })}).catch(err=>{console.error('err', err)});
        console.log("User retrieved: ", user.name);
        }
    }

    render() {
        const { user } = this.state;
        const { SCOREbackingTMEfundBalance, totalSCORE } = this.props;

        return(
            <div className="shifted">
            <ScrollToTopOnMount />
                <div className="feed-layout container">
                    <Affix className="leftContainer" stickPosition={77}>
                        <div className="left">
                        <LeftSidebar />
                        </div>
                    </Affix>
                    <div className = "center">   
                        <div className="About">
                            <h1>
                                Welcome to WeYouMe 
                            </h1>
                            <ul className="AboutList">
                                {user && (referral == user.name) && <li>
                                    You were invited by your friend:
                                </li>}
                                <li>
                                {user && (referral == user.name) && <div className="About__userreferral">
                                 <DiscoverUser 
                                    user={user} 
                                    totalSCORE={totalSCORE} 
                                    SCOREbackingTMEfundBalance={SCOREbackingTMEfundBalance}  
                                    /> </div>}
                                </li>
                                <li>
                                    <h2>
                                        To get started on our Testnet Alpha:
                                    </h2>
                                </li>
                                <li>
                                    <a href="https://auth.weyoume.io/register" target="_blank"> 
                                        <Action primary> Register account </Action>
                                    </a>
                                </li>
                                <li>
                                    Reserve your username and WYM allocation (For all EZIRA, BTS, and STEEMPower Holders):
                                </li>
                                <li>
                                    <a href="https://share.hsforms.com/1MCBMlc3BQqyylpjQsqhHKA34jhu" target="_blank" >
                                        <Button> Username and WYM registration </Button>
                                    </a>
                                </li>
                                <li>
                                    Learn more about The WeYouMe roadmap with our information pack.
                                    This includes our whitepaper and much more.
                                </li>
                                <li>
                                    <a href="https://share.hsforms.com/1C3S3z9rNSEa2XmVKZzWs_g34jhu" target="_blank" >
                                        <Button> Information Pack </Button>
                                    </a>
                                </li>
                            </ul>
                            <ul className="AboutList">
                                <li>
                                    WeYouMe is a peer to peer social media protocol with a positive purpose.
                                </li>
                                <li>
                                    Creators will be able to earn cryptocurrency when they upload great content, and control their own data. 
                                </li>
                                <li>
                                    You can create posts, and vote on other posts to sort them on the trending page.
                                </li>
                                <li>
                                    Creating an introduction post is a great way to start on WeYouMe.
                                </li>
                                <li>
                                    <a href='https://alpha.weyoume.io/trending-intro/hot-intro' > 
                                        <Button> Introduce Yourself </Button>
                                    </a>   
                                </li> 
                                <li>
                                    When other users like your post, you will earn testnet POWER, and will have more voting power to rank posts.
                                </li>
                                <li>
                                    You can send TestMeCoin to other users by going to your wallet
                                    and pressing "Send", or by pressing the send button on each post or comment to send a tip.
                                </li>   
                                <li>
                                    <a href='https://alpha.weyoume.io/wallet'> 
                                        <Button> Wallet </Button>
                                    </a> 
                                </li>
                                <li>
                                    If you have any questions, feel free to ask our team and community in our telegram channel 
                                </li>
                                <li>
                                    <a href='https://t.me/WeYouMeNetwork' target="_blank">
                                        <Button> Telegram </Button>
                                    </a>
                                </li>
                                <li>
                                    Visit our Welcome and Questions thread to see the log of our updates and news, or ask any questions. 
                                </li>
                                <li>
                                    <a href="https://alpha.weyoume.io/@weyoume/welcome-to-weyoume">
                                        <Button> Welcome Thread </Button>
                                    </a>   
                                </li>
                                <li>
                                    To find some users to follow, check out the discover page.
                                    Accounts that post great content will be added to the list regularly. 
                                </li>
                                <li>
                                    <a href='https://alpha.weyoume.io/discover/'> 
                                        <Button> Discover </Button>
                                    </a> 
                                </li>
                                <li>
                                    To Read the Source code of the WeYouMe blockchain, and Application, head to Our Github repository. 
                                    We are open to pull requests and issues. 
                                </li>
                                <li>
                                    <a href="https://github.com/weyoume"> 
                                        <Button> Github </Button> 
                                    </a>
                                </li>
                                <li><i>
                                    Please be advised that this is early stage experimental software, and testnet currency does not hold economic value. 
                                    The network's underlying blockchain may be restarted from time to time.
                                    Important content should be backed up before posting.
                                </i></li>
                                <li>
                                    Time of last restart: 2019-02-27 14:56:09
                                </li>
                                <li>
                                    Made with ❤️ in Melbourne, Australia.
                                </li>
                                <li>
                                    <a href="mailto:harrison@weyoume.io" > 
                                        <Button> Email Us </Button>
                                    </a>
                                </li>
                                </ul>
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

export default About;