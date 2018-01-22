/**
 * Module containing a collection of different button comonents for the UI.
 */
import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import 'font-awesome/css/font-awesome.css';
import '../../../css/Button.css';

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
