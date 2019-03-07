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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Icon } from 'semantic-ui-react';
import ShareLinkModal from '../modals/ShareLinkModal'
import { notebookPageUrl } from '../../util/App'
import '../../../css/App.css'
import '../../../css/ProjectPage.css'


/**
 * Display a status header for the current resource workflow. Shows the workflow
 * branch and shareable link.
 */
class NotebookStatusHeader extends Component {
    static propTypes = {
        branch: PropTypes.object.isRequired,
        notebook: PropTypes.object.isRequired,
        onSwitchBranch: PropTypes.func.isRequired,
        project: PropTypes.object.isRequired,
    }
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }
    /**
     * Close the shareable link modal.
     */
    closeModal = () => (this.setState({showModal: false}));
    /**
     * Show information about the current workflow version and a button to
     * display the shareable link modal.
     */
    render() {
        const { branch, notebook, onSwitchBranch, project } = this.props;
        const { showModal } = this.state;
        let readOnlyContent = null;
        if (notebook.readOnly) {
            readOnlyContent = (
                <span>
                    <span className='right-padding-sm'>{'at '}</span>
                    <span className='info-date'>{notebook.createdAt}</span>
                    <span className='padding-sm'>
                        <span className='clickable-icon'>
                            <Icon
                                name='play'
                                title='Go Live!'
                                onClick={() => (onSwitchBranch(branch))}
                            />
                        </span>
                    </span>
                </span>
            );
        }

        let url = window.location.protocol + '//' + window.location.host;
        url += notebookPageUrl(project.id, branch.id, notebook.id);

        return (
            <div className='notebook-header status-header'>
                <span>{<Icon name='fork' />}</span>
                <span>{'On branch '}</span>
                <span className='right-padding-sm'>
                    <span className='info-bold'>{branch.name}</span>
                </span>
                { readOnlyContent }
                <span className='clickable-icon'>
                    <Icon
                        name='linkify'
                        title='Get shareable link to this notebook'
                        onClick={this.openModal}
                    />
                </span>
                <ShareLinkModal
                    url={url}
                    onClose={this.closeModal}
                    open={showModal}
                />
            </div>
        );
    }
    openModal = () => (this.setState({showModal: true}));
}

export default NotebookStatusHeader;
