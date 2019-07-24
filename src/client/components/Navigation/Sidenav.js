import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { NavLink } from 'react-router-dom';
import './Sidenav.less';

const isTrending = (match, location) => location.pathname.match(/trending/);
const is_Active = (match, location) => location.pathname.match(/active/);
const isNew = (match, location) => location.pathname.match(/created/);
const isHot = (match, location) => location.pathname.match(/hot/);
const isReplies = (match, location) => location.pathname.match(/replies/);
const isFeed = (match, location) => location.pathname.match(/feed/);
const isDiscover = (match, location) => location.pathname.match(/discover/);
const isBoards = (match, location) => location.pathname.match(/boards/);
const isNetwork = (match, location) => location.pathname.match(/network/);
const isAbout = (match, location) => location.pathname.match(/about/);
const isCoins = (match, location) => location.pathname.match(/coins/);

const Sidenav = ({ username }) =>
	<ul className="Sidenav">
		<li>
			<NavLink to="/boards" activeClassName="Sidenav__item--active" exact isActive={isBoards}>
				<i className="iconfont icon-barrage" />
				<FormattedMessage id="topics" defaultMessage="Topics" />
			</NavLink>
		</li>
		<li>
			<a href="https://wallet.bitshares.org/?r=weyoume#/market/EZIRA_BTS" target='_blank'>
				<i className="iconfont icon-chart" />
				<FormattedMessage id="exchange" defaultMessage="Exchange" />
			</a>
		</li>
		<li>
			<NavLink to="/about" activeClassName="Sidenav__item--active" isActive={isAbout}>
				<i className="iconfont icon-feedback" />
				<FormattedMessage id="about" defaultMessage="About" />
			</NavLink>
		</li>	
	</ul>
		;

Sidenav.propTypes = {
  username: PropTypes.string,
};

Sidenav.defaultProps = {
  username: undefined,
};

export default Sidenav;
