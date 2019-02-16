import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import { Menu, Input, AutoComplete } from 'antd';
import { withRouter, Link } from 'react-router-dom';
import classNames from 'classnames';
import './PostFAB.less';

const styles = theme => ({
    fab: {
      margin: theme.spacing.unit,
    },
    extendedIcon: {
      marginRight: theme.spacing.unit,
    },
  });

function FloatingActionButtons(props, className, isModal, ...otherProps) {
  const { classes } = props;
  return (
    <div className ="FloatingActionButtons">
        <div className= {classNames(className, "FloatingActionButtons__container", {
          "FloatingActionButtons__container--shifted": isModal,
        })} >
            <Link to="/editor">
                <Fab color="secondary" aria-label="Edit" className={classes.fab} {...otherProps}>
                    <Icon>edit_icon</Icon>
                </Fab>
            </Link>
        </div>
    </div>
  );
}

FloatingActionButtons.propTypes = {
  classes: PropTypes.object.isRequired,
  isModal: PropTypes.bool,
};

FloatingActionButtons.defaultProps = {
  className: "FloatingActionButtons",
  isModal: false,
};

export default withStyles(styles)(FloatingActionButtons);