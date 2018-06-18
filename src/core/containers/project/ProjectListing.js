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
import { connect } from 'react-redux'
import { Button, Icon, Table } from 'semantic-ui-react'
import {
    clearProjectActionError, createProject, deleteProject, fetchProjects,
    toggleShowProjectForm
} from '../../actions/project/ProjectListing'
import { IconButton } from '../../components/Button'
import { ErrorMessage } from '../../components/Message';
import DeleteResourceModal from '../../components/modals/DeleteResourceModal'
import CreateProjectForm from '../../components/project/CreateProjectForm'
import ContentSpinner from '../../components/ContentSpinner'
import { pageUrl } from '../../util/App.js';

import '../../../css/ResourceListing.css'


class ProjectListing extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        envs: PropTypes.array,
        fetchError: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        projects: PropTypes.array.isRequired,
        links: PropTypes.object,
        showForm: PropTypes.bool.isRequired
    }
    constructor(props) {
        super(props);
        // The local state keeps track of projects that the user wants to delete
        // or edit. If either value is non-null the respective modal to confirm
        // delete or edit the project is shown. At no point should both values
        // be non-null.
        this.state = {deleteProject: null}
    }
    /**
     * Load the project listing when the component mounts.
     */
    componentDidMount = () => (this.refresh());
    /**
     * Clear create or delete project error message.
     */
    clearActionError = () => {
        const { dispatch } = this.props
        dispatch(clearProjectActionError());
    }
    /**
     * Delete the project with the given Url.Delete
     */
    confirmDeleteProject = (project) => {
        const { dispatch } = this.props
        dispatch(deleteProject(project))
        this.hideModal()
    }
    /**
     * Hide all modals by setting the respective state variables to null..
     */
    hideModal = () => {
        this.setState({deleteProject: null})
    }
    /**
     * Re-load project lsiting (either when component mounts or when user
     * presses the refresh button).
     */
    refresh = () => {
        const { dispatch } = this.props
        dispatch(fetchProjects())
    }
    /**
     * Show a list of existing projects and the Create Project form. Optional, a
     * 'Delete Project' dialog is being displayed.
     */
    render() {
        const {
            isFetching,
            actionError,
            envs,
            fetchError,
            projects,
            showForm
        } = this.props;
        let content = null;
        if (isFetching) {
            content = <ContentSpinner text='Loading Projects ...'/>;
        } else if (fetchError) {
            content = (<ErrorMessage
                title="Error while loading project list"
                message={fetchError}
            />)
        } else {
            const tabHead = (
                    <Table.Row>
                        <Table.HeaderCell className="resource">Name</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Project type</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Last modified</Table.HeaderCell>
                        <Table.HeaderCell className="resource"></Table.HeaderCell>
                    </Table.Row>
            );
            let rows = [];
            for (let i = 0; i < projects.length; i++) {
                const pj = projects[i];
                const link = pageUrl(pj.id);
                rows.push(<Table.Row key={pj.id}>
                    <Table.Cell className={'resource'}>
                        <a className={'resource-link'} href={link}>{pj.name}</a>
                    </Table.Cell>
                    <Table.Cell className={'resource-text'}>
                        {envs.find(e => (e.id === pj.envId)).name}
                    </Table.Cell>
                    <Table.Cell className={'resource-text'}>{pj.lastModifiedAt}</Table.Cell>
                    <Table.Cell className={'resource-buttons'}>
                        <span className='button-wrapper'>
                            <IconButton name="trash" onClick={(event) => {
                                event.preventDefault();
                                this.showDeleteProjectModal(pj);
                            }}/>
                        </span>
                    </Table.Cell>
                </Table.Row>);
            }
            // Check if deleteProject is set. In that case display a modal
            // dialog for the user to either confirm (or cancel) project
            // deletion.
            const { deleteProject } = this.state
            let modal = null;
            if (deleteProject) {
                modal = (
                    <DeleteResourceModal
                        open={true}
                        prompt={'Do you really want to delete ' + deleteProject.name + '?'}
                        title='Delete Project'
                        value={deleteProject}
                        onCancel={this.hideModal}
                        onSubmit={this.confirmDeleteProject}
                    />
                );
            }
            // Display an error message generated while deleting or updating a
            // project. The message is shown at the bottom of the project
            // listing
            let projectActionErrorMessage = null
            if (actionError) {
                projectActionErrorMessage = (<ErrorMessage
                    title={actionError.title}
                    message={actionError.message}
                    onDismiss={this.clearActionError}
                />)
            }
            let createProjectForm = null;
            if (showForm) {
                createProjectForm = (
                    <CreateProjectForm
                        envs={envs}
                        onClose={this.toggleCreateProjectForm}
                        onSubmit={this.submitNewProject}
                    />
                );
            }
            content = (
                <div>
                    { projectActionErrorMessage }
                    { createProjectForm }
                    <Table singleLine>
                        <Table.Header>{tabHead}</Table.Header>
                        <Table.Body>{rows}</Table.Body>
                        <Table.Footer fullWidth>
                            <Table.Row>
                                <Table.HeaderCell colSpan='4'>
                                    <Button
                                        floated='right'
                                        icon
                                        labelPosition='left'
                                        size='tiny'
                                        onClick={this.refresh}
                                    >
                                      <Icon name='refresh' /> Refresh
                                    </Button>
                                    <Button
                                        floated='right'
                                        icon
                                        labelPosition='left'
                                        size='tiny'
                                        positive
                                        disabled={showForm}
                                        onClick={this.toggleCreateProjectForm}
                                    >
                                      <Icon name='plus' /> New Project ...
                                    </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                    </Table>
                    { modal }
                </div>
            );
        }
        return content;
    }
    /**
     * Show modal to confirm project deletion.
     */
    showDeleteProjectModal = (project) => {
        this.setState({deleteProject: project})
    }
    /**
     * Submit a create new project request. If the name is empty it is set to
     * 'undefined' by default.
     */
    submitNewProject = (name, env) => {
        const { dispatch, links } = this.props;
        this.toggleCreateProjectForm();
        let projectName = name.trim();
        if (projectName === '') {
            projectName = 'New Project';
        }
        dispatch(createProject(links.create, env, projectName));
    }
    /**
     * Toggle visibility of the create project form.
     */
    toggleCreateProjectForm = () => {
        const { dispatch } = this.props;
        dispatch(toggleShowProjectForm())
    }
}

const mapStateToProps = state => {

    return {
        actionError: state.projectListing.actionError,
        envs: state.projectListing.envs,
        fetchError: state.projectListing.fetchError,
        isFetching: state.projectListing.isFetching,
        projects: state.projectListing.projects,
        links: state.projectListing.links,
        showForm: state.projectListing.showForm
    }
}

export default connect(mapStateToProps)(ProjectListing)
