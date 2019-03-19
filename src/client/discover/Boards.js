import React from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import { NavLink } from 'react-router-dom';

import _ from 'lodash';

import './Boards.less';

class Boards extends React.Component {

  render() {
    return(

  <div className="shifted">
    <div className="feed-layout container">
            <Affix className="leftContainer" stickPosition={77}>
              <div className="left">
                <LeftSidebar />
              </div>
            </Affix>
      <div className = "center">
        <div className="Boards">
        <ul className = "BoardList">
				<li>
			      <NavLink to="/trending-intro/hot-intro" >
				      <i className="iconfont icon-addressbook" />
				      <FormattedMessage id="introductions" defaultMessage="Introductions" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-pics/hot-pics" >
				      <i className="iconfont icon-picture" />
				      <FormattedMessage id="pictures" defaultMessage="Pictures" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-news/hot-news" >
				      <i className="iconfont icon-headlines" />
				      <FormattedMessage id="news" defaultMessage="News" />
			      </NavLink>
		      </li>
					<li>
			      <NavLink to="/trending-blog/hot-blog" >
				      <i className="iconfont icon-document" />
				      <FormattedMessage id="blog" defaultMessage="Blog" />
			      </NavLink>
		      </li>
					<li>
			      <NavLink to="/trending-links/hot-links" >
				      <i className="iconfont icon-link" />
				      <FormattedMessage id="links" defaultMessage="Links" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-music/hot-music" >
				      <i className="iconfont icon-systemprompt" />
				      <FormattedMessage id="music" defaultMessage="Music" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-vids/hot-vids" >
				      <i className="iconfont icon-playon" />
				      <FormattedMessage id="videos" defaultMessage="Videos" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-tech/hot-tech" >
				      <i className="iconfont icon-computer" />
				      <FormattedMessage id="tech" defaultMessage="Tech" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-science/hot-science" >
				      <i className="iconfont icon-manage" />
				      <FormattedMessage id="science" defaultMessage="Science" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-politics/hot-politics" >
				      <i className="iconfont icon-order" />
				      <FormattedMessage id="politics" defaultMessage="Politics" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending-blockchain/hot-blockchain" >
				      <i className="iconfont icon-bitcoin" />
				      <FormattedMessage id="crypto" defaultMessage="Blockchain" />
			      </NavLink>
		      </li>
					<li>
			      <NavLink to="/trending-games/hot-games" >
				      <i className="iconfont icon-select" />
				      <FormattedMessage id="games" defaultMessage="Games" />
			      </NavLink>
		      </li>
					<li>
			      <NavLink to="/trending-random/hot-random" >
				      <i className="iconfont icon-emoji" />
				      <FormattedMessage id="random" defaultMessage="Random" />
			      </NavLink>
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

export default Boards;