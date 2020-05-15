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
import { Icon, Table } from 'semantic-ui-react'
import { clearProjectActionError, deleteProject, fetchProjects } from '../../actions/project/ProjectListing'
import { ErrorMessage } from '../../components/Message';
import DeleteResourceModal from '../../components/modals/DeleteResourceModal'
import ContentSpinner from '../../components/ContentSpinner'
import { notebookPageUrl } from '../../util/App.js';
// For history to work this link was helpful. Does not seem to be required
// for all components (?).
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/withRouter.md
import { withRouter } from 'react-router';
import SearchBar from "../../components/SearchBar";

import '../../../css/ResourceListing.css'


class ProjectListing extends Component {
    static propTypes = {
        actionError: PropTypes.object,
        fetchError: PropTypes.string,
        fetchMessage: PropTypes.string.isRequired,
        isFetching: PropTypes.bool.isRequired,
        projects: PropTypes.array,
        links: PropTypes.object
    }
    constructor(props) {
        super(props);
        // The local state keeps track of the project that the user intends to
        // delete. If the value is non-null the delete modal for confirmation
        // is shown.
        this.state = {deleteProject: null, filteredProjects: this.props.projects}
        // Load the project listing
        const { dispatch } = this.props;
        dispatch(fetchProjects());
    }
    componentWillReceiveProps({projects}){
        this.setState({filteredProjects:projects})
    }
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
     * Show page for a selected project.
     */
    handleShowProjectPage = (project) => {
        const { history } = this.props;
        history.push(notebookPageUrl(project.id, project.defaultBranch));
    }
    /**
     * Hide all modals by setting the respective state variables to null..
     */
    hideModal = () => {
        this.setState({deleteProject: null})
    }
    /**
     * Display search bar filtered project listing
     **/
    filterProjectListing = (results) => {
        this.setState({
            filteredProjects: results
        })
    }
    /**
     * Show a list of existing projects and the Create Project form. Optional, a
     * 'Delete Project' dialog is being displayed.
     */
    render() {
        const {
            actionError,
            fetchError,
            fetchMessage,
            isFetching,
            projects
        } = this.props;
        let content = null;
        if (isFetching) {
            content = <ContentSpinner text={fetchMessage}/>;
        } else if (fetchError) {
            content = (<ErrorMessage
                title="Error while loading project list"
                message={fetchError}
            />)
        } else if (projects != null) {
            const tabHead = (
                    <Table.Row>
                        <Table.HeaderCell className="resource">Project</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Created</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Last modified</Table.HeaderCell>
                        <Table.HeaderCell className="resource"></Table.HeaderCell>
                    </Table.Row>
            );
            let {filteredProjects} = this.state;
            let rows = [];
            for (let i = 0; i < filteredProjects.length; i++) {
                const pj = filteredProjects[i];
                rows.push(<Table.Row key={pj.id}>
                    <Table.Cell className='resource'>
                        <a
                            className='resource-link'
                            onClick={() => (this.handleShowProjectPage(pj))}
                        >
                            {pj.name}
                        </a>
                    </Table.Cell>
                    <Table.Cell className='resource-text'>{pj.createdAt}</Table.Cell>
                    <Table.Cell className='resource-text'>{pj.lastModifiedAt}</Table.Cell>
                    <Table.Cell className='resource-buttons'>
                        <span className='button-wrapper'>
                            <Icon
                            name="trash"
                            link
                            onClick={() => (this.showDeleteProjectModal(pj))} />
                        </span>
                    </Table.Cell>
                </Table.Row>);
            }
            const noResults = (
                <Table.Row>
                    <Table.Cell className='resource-text'>
                        No Results Found!
                    </Table.Cell>
                </Table.Row>);
            if (filteredProjects.length < 1){
                rows.push(noResults)
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
            const searchBar = (
                    <SearchBar
                        projects={projects}
                        filterProjectListing={this.filterProjectListing}
                    />)

            content = (
                <div>
                    { projectActionErrorMessage }
                    { searchBar }
                    <Table singleLine>
                        <Table.Header>{tabHead}</Table.Header>
                        <Table.Body>{rows}</Table.Body>
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
}

const mapStateToProps = state => {
    return {
        actionError: state.projectListing.actionError,
        fetchError: state.projectListing.fetchError,
        fetchMessage: state.projectListing.fetchMessage,
        isFetching: state.projectListing.isFetching,
        projects: state.projectListing.projects,
        links: state.projectListing.links
    }
}

export default withRouter(connect(mapStateToProps)(ProjectListing))
