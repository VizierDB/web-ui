/**
 * Collection of componentsto interact with the Vizier DB Web service API.
 */

import React from 'react';
import PropTypes from 'prop-types';

import '../../css/Connection.css'


/**
 * Show Web Service API Connection info and documentation link.
 */
export class ConnectionInfo extends React.Component {
    static propTypes = {
        api: PropTypes.object
    }
    render() {
        const { api } = this.props;
        if (api != null) {
            const { name, links } = api;
            const url = links.self;
            return (
                <div className='connection-info'>
                    <pre className='connection-info'>
                        {'[ Connected to '}{name}{' : '}
                        <a className="connection-link" href={url}>
                            {url}
                        </a>
                        <span className="docu-icon">
                            <a
                                href={links.doc}
                                className='docu-icon'
                                target='_blank'
                            >
                                <i className='fa fa-book'/>
                            </a>
                        </span>
                        {' ]'}
                    </pre>
                </div>
            );
        } else {
            return null;
        }
    }
}
