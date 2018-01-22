/**
 * Collection of componentsto interact with the Vizier DB Web service API.
 */

import React from 'react';
import PropTypes from 'prop-types';

import '../../../css/Connection.css'


/**
 * Clickable icon button using Font Awesome icons.
 */
export const ConnectionInfo = ({api}) => {
    const url = api.links.self;
    return (
        <pre className="connection-info">
            {'[ Connected to '}{api.name}{' : '}
            <a className="connection-link" href={url}>
                {url}
            </a>
            <span className="docu-icon">
                <a
                    href={api.links.doc}
                    className="docu-icon"
                    target="_blank"
                >
                    <i className="fa fa-book"/>
                </a>
            </span>
            {' ]'}
        </pre>
    );
}

ConnectionInfo.propTypes = {
    api: PropTypes.object.isRequired
};
