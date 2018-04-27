/**
 * Module containing a collection of different button comonents for the UI.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import 'font-awesome/css/font-awesome.css';
import '../../css/Button.css';

/**
 * Clickable icon button using Font Awesome icons.
 */
export const IconButton = ({name, onClick}) => (
    <FontAwesome className="icon-button" name={name} onClick={onClick} />
)

IconButton.propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};


/**
 * Clickable icon button using Font Awesome icons.
 */
export const CloseButton = ({name, onClick}) => (
    <FontAwesome className="close-button" name={name} onClick={onClick} />
)

CloseButton.propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};


export const LargeMessageButton = ({message, icon, css, onClick}) => (
    <div className={css}>
        <p className='lg-message'>{message}</p>
        <p className='lg-button'>
            <IconButton name={icon + ' fa-4x'} onClick={onClick}/>
        </p>
    </div>
);

LargeMessageButton.propTypes = {
    css: PropTypes.string,
    icon: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};
