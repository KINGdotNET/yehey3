import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import './DiscoverMenu.less';

class DiscoverMenu extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    defaultKey: PropTypes.string,
  };

  static defaultProps = {
    onChange: () => {},
    defaultKey: 'recommended',
  };

  constructor(props) {
    super(props);
    this.state = {
      current: props.defaultKey ? props.defaultKey : 'recommended',
    };
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      current: nextProps.defaultKey ? nextProps.defaultKey : 'recommended',
    });
  };

  getItemClasses = key =>
    classNames('DiscoverMenu__item', { 'DiscoverMenu__item--active': this.state.current === key });

  handleClick = e => {
    const key = e.currentTarget.dataset.key;
    this.setState({ current: key }, () => this.props.onChange(key));
  };

  render() {
    return (
      <div className="DiscoverMenu">
        <div className="container menu-layout">
          <div className="left" />
          <Scrollbars
            universal
            autoHide
            renderView={({ style, ...props }) => (
              <div style={{ ...style, marginBottom: '-20px', marginRight: '-17px' }} {...props} />
            )}
            style={{ width: '100%', height: 46 }}
          >
            <ul className="DiscoverMenu__menu center">
              <li
                className={this.getItemClasses('recommended')}
                onClick={this.handleClick}
                role="presentation"
                data-key="recommended"
              >
                <FormattedMessage id="recommended" defaultMessage="Recommended" />
              </li>
              <li
                className={this.getItemClasses('followers')}
                onClick={this.handleClick}
                role="presentation"
                data-key="followers"
              >
                <FormattedMessage id="followers" defaultMessage="Top Followers" />
              </li>
              <li
                className={this.getItemClasses('power')}
                onClick={this.handleClick}
                role="presentation"
                data-key="power"
              >
                <FormattedMessage id="power" defaultMessage="Top POWER" />
              </li>
              <li
                className={this.getItemClasses('posts')}
                onClick={this.handleClick}
                role="presentation"
                data-key="posts"
              >
                <FormattedMessage id="posts" defaultMessage="Top Posts" />
              </li>
              <li
                className={this.getItemClasses('random')}
                onClick={this.handleClick}
                role="presentation"
                data-key="random"
              >
                <FormattedMessage id="random" defaultMessage="Random" />
              </li>
            </ul>
          </Scrollbars>
        </div>
      </div>
    );
  };
};

export default DiscoverMenu;
