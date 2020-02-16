import React from 'react';
import Action from '../components/Button/Action';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Helmet } from 'react-helmet';
import ScrollToTop from '../components/Utils/ScrollToTop';
import ScrollToTopOnMount from '../components/Utils/ScrollToTopOnMount';
import { withRouter } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { Button } from 'antd';
import _ from 'lodash';
import Carousel, { Dots } from '@brainhubeu/react-carousel';
import CreateAccount from '../components/CreateAccount';
import './Welcome.less';

@withRouter

class Welcome extends React.Component {
    static propTypes = {
        location: PropTypes.shape().isRequired,
        history: PropTypes.shape().isRequired,
        options: PropTypes.shape().isRequired,
    };

    static defaultProps = {
        options: {
            app: process.env.AUTH_API_CLIENT_ID,
            baseURL: process.env.AUTH_URL,
            callbackURL: process.env.AUTH_API_REDIRECT_URL,
            scope: []
        },
    }
    
    constructor(props) {
        super(props);
        this.state = {
          value: 0,
        };
    }

    getHomeLoginURL = () => {
        const { options } = this.props;
        var loginURL = '/login?client_id=' + options.app + '&redirect_uri=' + encodeURIComponent(options.callbackURL);
        return loginURL;
    };

    onChange = value => this.setState({ value });
    
    render() {
        return(
            <div>
            <Helmet>
                <title> Welcome to WeYouMe</title>
                <meta name="robots" content={'index,follow'} />
            </Helmet>
            <ScrollToTop />
            <ScrollToTopOnMount />
            <div className="shifted">
                <div className="feed-layout container">
                    <div className="center">   
                        <div className="Welcome">
                            <Carousel
                                className="Welcome__carousel"
                                clickToChange
                                stopAutoPlayOnHover
                                centered
                                slidesPerPage={1}
                                autoPlay={5000}                             
                                value={this.state.value}
                                onChange={this.onChange} >
                                    <img src="/images/NewWelcome1.png" className="Welcome__image" />
                                    <img src="/images/NewWelcome2.png" className="Welcome__image" />
                                    <img src="/images/NewWelcome3.png" className="Welcome__image" />
                                    <img src="/images/NewWelcome4.png" className="Welcome__image" />
                                    <img src="/images/NewWelcome5.png" className="Welcome__image" />
                            </Carousel>
                        <div className="Welcome__dots__container">
                            <Dots
                                className="Welcome__dots"
                                value={this.state.value}
                                onChange={this.onChange}
                                number={5}
                                />
                        </div>
                        <div className="Welcome__login"> 
                            <Button className="Welcome__login__button">
                                <NavLink to={this.getHomeLoginURL()} className="Welcome__login__link">
                                    <div className="Welcome__login__text"> 
                                        <FormattedMessage id="login" defaultMessage="Login" />
                                    </div>
                                </NavLink>
                            </Button>
                            <h6 className="Welcome__choice">
                                <FormattedMessage id="or" />
                            </h6>
                        </div>
                        <div className="Welcome__register">
                            <CreateAccount/>
                        </div> 
                    </div>
                </div>
            </div>
        </div>
    </div>
        );
    }
}

export default Welcome;