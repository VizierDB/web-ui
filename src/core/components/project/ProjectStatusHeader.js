import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Icon } from 'semantic-ui-react';
import ShareLinkModal from '../modals/ShareLinkModal'
import { pageUrl } from '../../util/App'
import '../../../css/App.css'
import '../../../css/ProjectPage.css'


/**
 * Display a status header for the current resource workflow. Shows the workflow
 * branch and shareable link.
 */
class ProjectStatusHeader extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        workflow: PropTypes.object.isRequired
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
        const { project, workflow } = this.props;
        const { showModal } = this.state;
        let readOnlyContent = null;
        if (workflow.readOnly) {
            readOnlyContent = (
                <span>
                    <span>{'at '}</span>
                    <span className='highlight-date'>{workflow.createdAt}</span>
                    <span className='left-padding-md'>
                        (<a href={pageUrl(project.id, workflow.branch.id)}>Go Live!)
                    </a></span>
                </span>
            );
        }
        return (
            <div className='project-status'>
                <span>{<Icon name='fork' />}</span>
                <span className='highlight-branch'>{workflow.branch.name}</span>
                { readOnlyContent }
                <span className='project-status-dropdown'>
                    <Button
                        icon='linkify'
                        circular
                        size='mini'
                        title='Share link to this notebook'
                        onClick={this.openModal}
                    />
                </span>
                <ShareLinkModal
                    open={showModal}
                    project={project}
                    workflow={workflow}
                    onClose={this.closeModal}
                />
            </div>
        );
    }
    openModal = () => (this.setState({showModal: true}));
}

export default ProjectStatusHeader;
