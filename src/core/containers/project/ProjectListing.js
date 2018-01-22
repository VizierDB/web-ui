import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Header, Icon, Input, Modal, Table } from 'semantic-ui-react'
import {
    deleteProject, fetchProjects, projectDeleteError, projectEditErrorInListing,
    updateProjectNameInListing
} from '../../actions/project/ProjectListing'
import CreateProjectForm from './CreateProjectForm'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import { IconButton } from '../../components/util/Button'
import { baseHref } from '../main/App.js';

import '../../../css/ResourceListing.css'


class ProjectListing extends Component {
    static propTypes = {
        engines: PropTypes.array,
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
        this.state = {deleteProject: null, editProject: null, projectName: ''}
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
    confirmDeleteProject = (url) => {
        const { dispatch } = this.props
        dispatch(deleteProject(url))
        this.hideModals()
    }
    /**
     * Handle changes in the edit project name text field.
     */
    handleProjectNameChange = (event) => {
        this.setState({projectName: event.target.value});
    }
    /**
     * Detect RETURN key press to submit form.
     */
    handleProjectNameKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.submitProjectNameUpdate();
        }
    }
    /**
     * Hide all modals by setting the respective state variables to null..
     */
    hideModals = () => {
        this.setState({deleteProject: null, editProject: null, projectName: ''})
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
        const { isFetching, deleteError, editError, engines, fetchError, projects } = this.props;
        let content = null;
        if (isFetching) {
            content = (<ContentSpinner />)
        } else if (fetchError) {
            content = (<ErrorMessage
                title="Error while loading project list"
                message={fetchError}
            />)
        } else {
            const tabHead = (
                    <Table.Row>
                        <Table.HeaderCell className="resource">Name</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Project engine</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Created at</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Last modified</Table.HeaderCell>
                        <Table.HeaderCell className="resource"></Table.HeaderCell>
                    </Table.Row>
            );
            projects.sort(function(p1, p2) {return p1.name.localeCompare(p2.name)});
            let rows = [];
            for (let i = 0; i < projects.length; i++) {
                const pj = projects[i];
                const link = baseHref + 'projects/' + pj.id;
                rows.push(<Table.Row key={pj.id}>
                    <Table.Cell className={'resource'}>
                        <a className={'resource-link'} href={link}>{pj.name}</a>
                    </Table.Cell>
                    <Table.Cell className={'resource-text'}>
                        {engines.find(e => (e.id === pj.engineId)).name}
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
            const { deleteProject, editProject, projectName } = this.state
            let modal = null;
            if (deleteProject) {
                modal = (
                    <Modal open={true} basic size='small'>
                        <Header icon='trash' content='Delete Project' />
                        <Modal.Content>
                            <p>Do you really want to delete '{deleteProject.name}'?</p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button basic color='red' inverted onClick={this.hideModals}>
                                <Icon name='remove' /> No
                            </Button>
                            <Button
                                color='green'
                                inverted
                                onClick={(event) => {
                                    event.preventDefault()
                                    this.confirmDeleteProject(deleteProject.links.delete)
                                }}
                            >
                                <Icon name='checkmark' /> Yes
                            </Button>
                        </Modal.Actions>
                    </Modal>
                );
            } else if (editProject) {
                modal = (
                        <Modal open={true} size={'small'}>
                            <Modal.Header>{'Enter a new project name ...'}</Modal.Header>
                            <Modal.Content>
                                <div className="resource-name">
                                    <Input
                                        autoFocus
                                        className="resource-name-input"
                                        value={projectName}
                                        onChange={this.handleProjectNameChange}
                                        onKeyDown={this.handleProjectNameKeyDown}
                                    />
                                </div>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button  negative onClick={this.hideModals}>
                                    Cancel
                                </Button>
                                <Button
                                    positive
                                    icon='checkmark'
                                    labelPosition='right'
                                    content="Rename"
                                    onClick={this.submitProjectNameUpdate}
                                />
                            </Modal.Actions>
                        </Modal>
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
                    handleDismiss={this.clearDeleteProjectError}
                />)
            } else if (editError) {
                projectActionErrorMessage = (<ErrorMessage
                    title="Error while updating project name"
                    message={editError}
                    handleDismiss={this.clearEditProjectError}
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
        this.setState({deleteProject: project, editProject: null, projectName: ''})
    }
    /**
     * Show modal to edit project name.
     */
    showEditProjectModal = (project) => {
        this.setState({deleteProject: null, editProject: project, projectName: project.name})
    }
    /**
    * Submit the update file name request.
    */
   submitProjectNameUpdate = () => {
       const {dispatch } = this.props
       const { editProject, projectName } = this.state
       dispatch(updateProjectNameInListing(editProject.links.update, projectName))
       this.hideModals()
   }
}

const mapStateToProps = state => {

    return {
        engines: state.serviceApi.engines,
        fetchError: state.projectListing.fetchError,
        deleteError: state.projectListing.deleteError,
        editError: state.projectListing.editError,
        isFetching: state.projectListing.isFetching,
        projects: state.projectListing.projects,
        links: state.projectListing.links
    }
}

export default connect(mapStateToProps)(ProjectListing)
