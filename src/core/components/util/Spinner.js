import React from 'react';
import FontAwesome from 'react-fontawesome';
import 'font-awesome/css/font-awesome.css';
import '../../../css/Spinner.css';


/**
 * Larger spinner to indicate loading of content.
 */
export const ContentSpinner = () => (
    <div className="spinner-centered">
        <FontAwesome className="spinner" name="spinner" size="3x" spin/>
    </div>
);


/**
 * Small spinner that is left aligned
 */
export const UpdateFormSpinner = () => (
    <div className="spinner-left-align">
        <FontAwesome className="spinner" name="spinner" spin/>
    </div>
);
