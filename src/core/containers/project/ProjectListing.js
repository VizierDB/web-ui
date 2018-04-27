import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Icon, Table } from 'semantic-ui-react'
import {
    deleteProject, fetchProjects, projectDeleteError, projectEditErrorInListing,
    updateProjectNameInListing
} from '../../actions/project/ProjectListing'
import CreateProjectForm from './CreateProjectForm'
import { IconButton } from '../../components/Button'
import { ErrorMessage } from '../../components/Message';
import DeleteResourceModal from '../../components/modals/DeleteResourceModal'
import EditResourceNameModal from '../../components/modals/EditResourceNameModal'
import ContentSpinner from '../../components/ContentSpinner'
import { isNotEmptyString, pageUrl } from '../../util/App.js';

import '../../../css/ResourceListing.css'


class ProjectListing extends Component {
    static propTypes = {
        envs: PropTypes.array,
        deleteError: PropTypes.string,
        editError: PropTypes.string,
        fetchError: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        projects: PropTypes.array.isRequired,
        links: PropTypes.object
    }
    constructor(props) {
        super(props);
        // The local state keeps track of projects that the user wants to delete
        // or edit. If either value is non-null the respective modal to confirm
        // delete or edit the project is shown. At no point should both values
        // be non-null.
        this.state = {deleteProject: null, editProject: null}
    }
    /**
     * Load the project listing when the component mounts.
     */
    componentDidMount = () => (this.refresh());
    /**
     * Clear delete project error message
     */
    clearDeleteProjectError = () => {
        const { dispatch } = this.props
        dispatch(projectDeleteError(null))
    }
    /**
     * Clear delete project error message
     */
    clearEditProjectError = () => {
        const { dispatch } = this.props
        dispatch(projectEditErrorInListing(null))
    }
    /**
     * Delete the project with the given Url.Delete
     */
    confirmDeleteProject = (project) => {
        const { dispatch } = this.props
        dispatch(deleteProject(project))
        this.hideModals()
    }
    /**
     * Hide all modals by setting the respective state variables to null..
     */
    hideModals = () => {
        this.setState({deleteProject: null, editProject: null})
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
        const { isFetching, deleteError, editError, envs, fetchError, projects } = this.props;
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
                        <Table.HeaderCell className="resource">Created at</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Last modified</Table.HeaderCell>
                        <Table.HeaderCell className="resource"></Table.HeaderCell>
                    </Table.Row>
            );
            projects.sort(function(p1, p2) {return p1.name.localeCompare(p2.name)});
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
                    <Table.Cell className={'resource-text'}>{pj.createdAt}</Table.Cell>
                    <Table.Cell className={'resource-text'}>{pj.lastModifiedAt}</Table.Cell>
                    <Table.Cell className={'resource-buttons'}>
                        <span className='button-wrapper'>
                            <IconButton name="edit" onClick={(event) => {
                                event.preventDefault();
                                this.showEditProjectModal(pj);
                            }}/>
                        </span>
                        <span className='button-wrapper'>
                            <IconButton name="trash" onClick={(event) => {
                                event.preventDefault();
                                this.showDeleteProjectModal(pj);
                            }}/>
                        </span>
                    </Table.Cell>
                </Table.Row>);
            }
            // Check if deleteProject or editProject are set. In that case
            // display a modal dialog for the user to either confirm (or cancel)
            // project deletion or enter the new Pproject name. It is assumed
            // that at most one of the two values is non-null.
            const { deleteProject, editProject } = this.state
            let modal = null;
            if (deleteProject) {
                modal = (
                    <DeleteResourceModal
                        open={true}
                        prompt={'Do you really want to delete ' + deleteProject.name + '?'}
                        title='Delete Project'
                        value={deleteProject}
                        onCancel={this.hideModals}
                        onSubmit={this.confirmDeleteProject}
                    />
                );
            } else if (editProject) {
                modal = (
                    <EditResourceNameModal
                        isValid={isNotEmptyString}
                        open={true}
                        title='Enter a new project name ...'
                        value={editProject.name}
                        onCancel={this.hideModals}
                        onSubmit={this.submitProjectNameUpdate}
                    />
                );
            }
            // Display an error message generated while deleting or updating a
            // project. The message is shown at the bottom of the project
            // listing
            let projectActionErrorMessage = null
            if (deleteError) {
                projectActionErrorMessage = (<ErrorMessage
                    title="Error while deleting project"
                    message={deleteError}
                    onDismiss={this.clearDeleteProjectError}
                />)
            } else if (editError) {
                projectActionErrorMessage = (<ErrorMessage
                    title="Error while updating project name"
                    message={editError}
                    onDismiss={this.clearEditProjectError}
                />)
            }
            content = (
                <div>
                    <Table singleLine>
                        <Table.Header>{tabHead}</Table.Header>
                        <Table.Body>{rows}</Table.Body>
                        <Table.Footer fullWidth>
                            <Table.Row>
                                <Table.HeaderCell colSpan='5'>
                                    <Button
                                        floated='right'
                                        icon
                                        labelPosition='left'
                                        size='tiny'
                                        onClick={this.refresh}
                                    >
                                      <Icon name='refresh' /> Refresh
                                    </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                    </Table>
                    { modal }
                    { projectActionErrorMessage }
                    <CreateProjectForm />
                </div>
            );
        }
        return content;
    }
    /**
     * Show modal to confirm project deletion.
     */
    showDeleteProjectModal = (project) => {
        this.setState({deleteProject: project, editProject: null})
    }
    /**
     * Show modal to edit project name.
     */
    showEditProjectModal = (project) => {
        this.setState({deleteProject: null, editProject: project})
    }
    /**
    * Submit the update file name request.
    */
   submitProjectNameUpdate = (name) => {
       const {dispatch } = this.props
       const { editProject } = this.state
       dispatch(updateProjectNameInListing(editProject, name))
       this.hideModals()
   }
}

const mapStateToProps = state => {

    return {
        envs: state.projectListing.envs,
        fetchError: state.projectListing.fetchError,
        deleteError: state.projectListing.deleteError,
        editError: state.projectListing.editError,
        isFetching: state.projectListing.isFetching,
        projects: state.projectListing.projects,
        links: state.projectListing.links
    }
}

export default connect(mapStateToProps)(ProjectListing)
