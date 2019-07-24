import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getAccountLite, getUserImageKey, DEFAULT_PROFILE_IMAGE } from '../helpers/apiHelpers'
import './Avatar.less';

// Attempts to load Avatar images from the reducer cause significant delays when loading account objects
// and cause components to stall when loading new images for the first time.

class Avatar extends React.Component {

	constructor(props) {
		super(props);
	
		this.state = {
		  profileImage: DEFAULT_PROFILE_IMAGE,
		};
	  }

	static propTypes = {
		username: PropTypes.string,
		size: PropTypes.number,
	};
	
	static defaultProps = {
		size: 100,
	};

	componentDidMount() {
		const { 
			username,
		} = this.props;

		var storedProfileImage = DEFAULT_PROFILE_IMAGE;
		const imageKey = getUserImageKey(username);

		if (!_.isEmpty(localStorage.getItem(imageKey))) {
			storedProfileImage = localStorage.getItem(imageKey);
			this.setState({
				profileImage: storedProfileImage,
			});

		} else if (username && !_.isEmpty(localStorage)) {
			getAccountLite(username);
			this.forceUpdate;
		}	
	};

  	render(){
		const { 
			username, 
			size,
		} = this.props;

		const {
			profileImage,
		} = this.state;
	
		var style = {
			minWidth: `${size}px`,
			width: `${size}px`,
			height: `${size}px`,
		};
		
		if (username) {
			style = {
				...style,
				backgroundImage: `url(${profileImage})`,
			};
		}
		return (
			<div className="Avatar" style={style} >
			</div>
		)
	} 
};

export function getAvatarURL(profileImage) {
	return profileImage ? profileImage : DEFAULT_PROFILE_IMAGE;		
}
	
export default Avatar;