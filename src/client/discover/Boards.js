import React from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';
import LeftSidebar from '../app/Sidebar/LeftSidebar';
import RightSidebar from '../app/Sidebar/RightSidebar';
import Affix from '../components/Utils/Affix';
import { NavLink } from 'react-router-dom';

import _ from 'lodash';

import './Boards.less';
import { H2 } from 'glamorous';

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
			      <NavLink to="/trending/pics" >
				      <i className="iconfont icon-picture" />
				      <FormattedMessage id="pictures" defaultMessage="Pictures" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/news" >
				      <i className="iconfont icon-headlines" />
				      <FormattedMessage id="news" defaultMessage="News" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/music" >
				      <i className="iconfont icon-systemprompt" />
				      <FormattedMessage id="music" defaultMessage="Music" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/vids" >
				      <i className="iconfont icon-playon" />
				      <FormattedMessage id="videos" defaultMessage="Videos" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/tech" >
				      <i className="iconfont icon-computer" />
				      <FormattedMessage id="tech" defaultMessage="Tech" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/science" >
				      <i className="iconfont icon-manage" />
				      <FormattedMessage id="science" defaultMessage="Science" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/politics" >
				      <i className="iconfont icon-order" />
				      <FormattedMessage id="politics" defaultMessage="Politics" />
			      </NavLink>
		      </li>
          <li>
			      <NavLink to="/trending/crypto" >
				      <i className="iconfont icon-bitcoin" />
				      <FormattedMessage id="crypto" defaultMessage="Crypto" />
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