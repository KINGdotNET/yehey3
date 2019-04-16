import React from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import { NavLink } from 'react-router-dom';
import { Button } from 'antd';
import _ from 'lodash';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount.js';
import './About.less';

class About extends React.Component {

  render() {

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
                            Welcome to the WeYouMe Testnet Alpha V0.3.2
                        </h1>
                        <ul className="AboutList">
                            <h3>
                                To get started: 
                            </h3>
                            <li>
                                <a href="https://auth.weyoume.io/register" target="_blank"><Button>Register an account here.</Button></a>
                            </li>
                            <li>
                                Reserve your username and WYM allocation (For all EZIRA, BTS, and STEEMPower Holders):
                            </li>
                            <li>
                                <a href="https://share.hsforms.com/1MCBMlc3BQqyylpjQsqhHKA34jhu" target="_blank" ><Button>Username and WYM registration</Button></a>
                            </li>
                            <li>
                                Learn more about the roadmap envisioned for the WeYouMe Protocol by signing up for our information pack.
                            </li>
                            <li>
                                <a href="https://share.hsforms.com/1C3S3z9rNSEa2XmVKZzWs_g34jhu" target="_blank" ><Button>Information Pack</Button></a>
                            </li>
                        </ul>
                        <ul className="AboutList">
                            
                            <li>
                                WeYouMe is a peer to peer social media protocol.
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
                                We believe Social media should drive Positive change and Individual freedom.
                                Powered by We, Chosen by You, Rewarded by Me. 
                                WeYouMe is a blockchain protocol to enable everyone to share information and value freely. 
                                Creators will be able to earn cryptocurrency when they upload great content, and control their own data. 
                            </li>
                            <li>
                                You can create posts, and vote on other posts to sort them on the trending page.
                            </li>
                            <li>
                                <a href='https://alpha.weyoume.io/trending-intro/hot-intro' > Creating an introduction post is a great way to start on WeYouMe. </a> 
                            </li>
                            <li>
                                When other users like your post, you will earn testnet POWER, and will have more voting power to rank posts.
                            </li>
                            <li>
                                You can send TestMeCoin to other users by <a href='https://alpha.weyoume.io/wallet'> going to your wallet </a> and pressing "Send", or by pressing the send button on each post or comment to send a tip.
                            </li>
                            <li>
                                If you have any questions, <a href='https://t.me/WeYouMeNetwork' > feel free to ask our team and community in our telegram channel </a>
                            </li>
                            <li>
                                <a href="https://alpha.weyoume.io/@weyoume/welcome-to-weyoume"> Visit our Welcome and Questions thread to see the log of our updates and news, or ask any questions. </a>   
                            </li>
                            <li>
                                To find some users to follow, check out the <a href='https://alpha.weyoume.io/discover/'> discover list. </a> Accounts that post great content will be added to the list regularly. 
                            </li>
                            <li>
                                To Read the Source code of the WeYouMe blockchain, and Application, head to <a href="https://github.com/weyoume">Our Github repository. We are open to pull requests and issues.</a>
                            </li>
                            <li>
                                Made with ❤️ in Melbourne, Australia. <a href="mailto:harrison@weyoume.io" > [Email the team] </a>
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