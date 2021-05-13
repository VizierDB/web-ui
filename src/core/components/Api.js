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
import { Button } from 'semantic-ui-react';
import ContentSpinner from './ContentSpinner';
import { HATEOAS_API_DOC } from '../util/HATEOAS';
import '../../css/App.css';
import '../../css/Connection.css'


/**
 * Component that continuously sends polling requests to the API and
 * dispatches the result to a given callback handler.
 *
 * Displays a cancel button to activate a given callback handler.
 *
 * https://stackoverflow.com/questions/46140764/polling-api-every-x-seconds-with-react
 */
export class ApiPolling extends React.Component {
    static propTypes = {
        interval: PropTypes.number.isRequired,
        onCancel: PropTypes.func.isRequired,
        onFetch: PropTypes.func.isRequired,
        resource: PropTypes.object.isRequired,
        text: PropTypes.string.isRequired
    }
    /**
     * Start a timer to call the provided fetch function at the specified
     * interval.
     */
    componentDidMount() {
        const { interval, onFetch, resource } = this.props;
        window.pollingTimer = setInterval(() => (onFetch(resource)), interval);
        this.timer = window.pollingTimer
    }
    /**
     * Cancel the fetch timer.
     */
    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }
    /**
     * Show a spinner with a cancel button.
     */
    render() {
        const { onCancel, text } = this.props;
        return (
            <div>
                <ContentSpinner text={ text } size='small' />
                <div className='centered'>
                    <Button
                        content='Cancel'
                        negative
                        title='Cancel active task'
                        onClick={onCancel}
                    />
                </div>
            </div>
        );
    }
}


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
        const url = links.getSelf();
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
