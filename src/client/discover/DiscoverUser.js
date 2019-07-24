import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import urlParse from 'url-parse';
import { Link } from 'react-router-dom';
import ReputationTag from '../components/ReputationTag';
import Avatar from '../components/Avatar';
import FollowButton from '../widgets/FollowButton';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import formatter from '../helpers/blockchainProtocolFormatter';

const DiscoverUser = ({ user, totalSCORE, SCOREbackingTMEfundBalance}) => {

  const parsedJSON = _.attempt(JSON.parse, user.json);
  const userJSON = _.isError(parsedJSON) ? user.json : parsedJSON;
  const userProfile = _.has(userJSON, 'profile') ? userJSON.profile : {};
  const username = user.name;
  
  const followerCount = user.follower_count;
  const location = userProfile.location;
  const posts = user.post_count;
  const fullName = userProfile.name;
  const about = userProfile.about;
  let website = userProfile.website;

  if (website && website.indexOf('http://') === -1 && website.indexOf('https://') === -1) {
    website = `http://${website}`;
  }

  const url = urlParse(website);
  let hostWithoutWWW = url.host;

  if (hostWithoutWWW.indexOf('www.') === 0) {
    hostWithoutWWW = hostWithoutWWW.slice(4);
  }

  return (
    <div key={"discover-"+username} className="DiscoverPage__user">
      <div className="DiscoverPage__user__content">
        <div className="DiscoverPage__user__links">
          <Link to={`/@${username}`}>
            <Avatar username={username} size={40} />
          </Link>
          <div className="DiscoverPage__user__profile">
            <div className="DiscoverPage__user__profile__header">
              <Link to={`/@${username}`}>
                <span className="DiscoverPage__user__name">
                  <span className="username">{fullName || username}</span>
                </span>
                <ReputationTag reputation={user.reputation} />
              </Link>
                <div className="DiscoverPage__user__follow">
                  <FollowButton username={username} />
                </div>
              </div>
              <div className="DiscoverPage__user__Followercount">
                <span> {followerCount} {' Followers '} </span>
              </div>
              <div className="DiscoverPage__user__PowerBalance">
                <span> 
                  <FormattedNumber
                    value={parseFloat(
                    formatter.SCOREinTMEvalue(
                    user.SCORE,
                    totalSCORE,
                    SCOREbackingTMEfundBalance,
                  ),
                )}
                />
                {' POWER '}
                </span>
              </div>
              <div className="DiscoverPage__user__postcount">
                <span>
                  {posts}{' Posts '}
                </span>
              </div>
              <div className="DiscoverPage__user__location">
                {location && (
                  <span>
                    <i className="iconfont icon-coordinates text-icon" />
                    {`${location} `}
                  </span>
                )}
                {website && (
                  <span>
                    <i className="iconfont icon-link text-icon" />
                    <a target="_blank" rel="noopener noreferrer" href={website}>
                      {`${hostWithoutWWW}${url.pathname.replace(/\/$/, '')}`}
                    </a>
                  </span>
                )}
              </div>
              <div className="DiscoverPage__user__about">
                {about}
              </div>
          </div>
        </div>
      </div>
    <div className="DiscoverPage__user__divider" />
    </div>
  );
};

DiscoverUser.propTypes = {
  user: PropTypes.shape().isRequired,
};

export default DiscoverUser;
