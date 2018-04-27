import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Icon } from 'semantic-ui-react';
import ShareLinkModal from '../modals/ShareLinkModal'
import { pageUrl } from '../../util/App'
import '../../../css/App.css'
import '../../../css/ProjectPage.css'


/**
 * Display a status header for the current resource workflow. Shows the workflow
 * branch and shareable link. For read only workflows the creating data and a
 * 'Go Live' link are shown as well.
 */
class ProjectStatusHeader extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        workflow: PropTypes.object.isRequired,
        onReverse: PropTypes.func
    }
    constructor(props) {
        super(props);
        this.state = {showModal: false};
    }
    closeModal = () => (this.setState({showModal: false}));
    render() {
        const { project, workflow, onReverse } = this.props;
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
        // Show the reverse order menu  item only if handler is given
        let reverseItem = null;
        if (onReverse != null) {
            reverseItem = (
                <Dropdown.Item
                    key='reverse'
                    icon='sort'
                    text='Reverse Order'
                    onClick={onReverse}
                />
            );
        }
        const trigger = (<Icon name='bars' />);
        return (
            <div className='project-status'>
                <span>{<Icon name='fork' />}</span>
                <span className='highlight-branch'>{workflow.branch.name}</span>
                { readOnlyContent }
                <span className='project-status-dropdown'>
                    <Dropdown trigger={trigger} pointing='top right' icon={null}>
                        <Dropdown.Menu>
                            <Dropdown.Item
                                key='share'
                                icon='linkify'
                                text='Share Link'
                                onClick={this.openModal}
                            />
                            {reverseItem}
                        </Dropdown.Menu>
                    </Dropdown>
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
