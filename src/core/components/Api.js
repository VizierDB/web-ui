/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { HATEOAS_API_DOC, HATEOAS_SELF } from '../util/HATEOAS';

import '../../css/Connection.css'

/**
 * Collection of componentsto interact with the Vizier DB Web service API.
 */


/**
 * Show Web Service API Connection info and documentation link.
 */
export class ConnectionInfo extends React.Component {
    static propTypes = {
        links: PropTypes.object.isRequired,
        name: PropTypes.string.isRequired
    }
    render() {
        const { name, links } = this.props;
        const url = links.get(HATEOAS_SELF);
        return (
            <div className='connection-info'>
                <pre className='connection-info'>
                    {'Connected to '}{name}{' @ '}
                    <a className="connection-link" target='_blank' href={url}>
                        {url}
                    </a>
                    <span className="docu-icon">
                        <a
                            href={links.get(HATEOAS_API_DOC)}
                            className='docu-icon'
                            target='_blank'
                        >
                            <i className='fa fa-book'/>
                        </a>
                    </span>
                </pre>
            </div>
        );
    }
}
