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
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Icon } from 'semantic-ui-react'
import { createProject } from '../../actions/project/ProjectListing'
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import { LargeMessageButton } from '../../components/Button';
import { MainPageResource } from '../../util/App.js';
import ProjectListing from '../project/ProjectListing'
import ResourcePage from '../../components/ResourcePage';
import { isNotEmptyString, notebookPageUrl } from '../../util/App.js';
import { HATEOAS_PROJECTS_CREATE } from '../../util/HATEOAS';
import '../../../css/App.css'
import '../../../css/ResourceListing.css'


class MainPage extends Component {
    static propTypes = {
        homePageContent: PropTypes.string,
        projects: PropTypes.array,
        serviceApi: PropTypes.object,
        userSettings: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        // Flag indicating if the create modal is being shown.
        this.state = {showModal: false};
    }
    /**
     * Submit a create new project request. If the name is empty it is set to
     * 'undefined' by default.
     */
    handleCreateProject = (name) => {
        const { dispatch, history, serviceApi } = this.props;
        const url = serviceApi.links.get(HATEOAS_PROJECTS_CREATE);
        this.hideModal();
        dispatch(createProject(url, name, history));
    }
    /**
     * Show page for a selected project.
     */
    handleShowProjectPage = (project) => {
        const { history } = this.props;
        history.push(notebookPageUrl(project.id, project.defaultBranch));
    }
    /**
     * Set the show modal flag to false;
     */
    hideModal = () => (this.setState({showModal: false}));
    /**
     */
    render() {
        const {
            dispatch,
            homePageContent,
            projects,
            serviceApi,
            userSettings
        } = this.props;
        // Headline and optional description contained in the service descriptor
        let headline = null;
        let description = null;
        if (homePageContent != null) {
            headline  = homePageContent.headline;
            description = homePageContent.description;
        } else {
            headline = (
                <span>
                    Vizier
                    <span className='headline-small'>
                        Streamlined Data Curation
                    </span>
                </span>
            );
        }
        // If the list of project is empty show a message and button to add a
        // new project.
        let listingContent = null;
        if ((projects != null) && (projects.length === 0)) {
            listingContent = (
                <div className='empty-list-message'>
                    <LargeMessageButton
                        message='Your project list is empty. Start by creating a new project.'
                        icon='plus'
                        onClick={this.showCreateProjectModal}
                    />
                </div>
            );
        } else {
            listingContent = (
                <div>
                    <div className='project-listing'>
                        <ProjectListing />
                    </div>
                    <Button
                        icon
                        labelPosition='left'
                        size='tiny'
                        positive
                        onClick={this.showCreateProjectModal}
                    >
                      <Icon name='plus' /> New Project ...
                    </Button>
                </div>
            );
        }
        const content = (
            <div className='home-content'>
                <h1 className='home-headline'>{headline}</h1>
                { description }
                { listingContent }
                <EditResourceNameModal
                    isValid={isNotEmptyString}
                    open={this.state.showModal}
                    prompt='Enter a name for the new project'
                    title={'Create project'}
                    onCancel={this.hideModal}
                    onSubmit={this.handleCreateProject}
                />
            </div>
        );
        return (
            <ResourcePage
                content={content}
                contentCss='wide'
                dispatch={dispatch}
                isActive={false}
                projectList={projects}
                resource={MainPageResource()}
                serviceApi={serviceApi}
                userSettings={userSettings}
            />
        );
    }
    /**
     * Show the create project modal.
     */
    showCreateProjectModal = () => (this.setState({showModal: true}));
}

const mapStateToProps = state => {

    return {
        homePageContent: state.mainPage.homePageContent,
        projects: state.projectListing.projects,
        serviceApi: state.serviceApi,
        userSettings: state.app.userSettings
    }
}

export default withRouter(connect(mapStateToProps)(MainPage))
