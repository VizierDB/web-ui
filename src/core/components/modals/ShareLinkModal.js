/**
 * Modal to display a shareable link for a notebook version
 */

import React from 'react';
import PropTypes from 'prop-types'
import { Button, Modal } from 'semantic-ui-react'
import { pageUrl } from '../../util/App'
import '../../../css/Modals.css'


class ShareLinkModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        project: PropTypes.object.isRequired,
        workflow: PropTypes.object.isRequired
    }
    /**
     * Show notebook cell content. There are four different layouts depending on
     * the values of the isExpanded and hasModule flags. The general layout is
     * two columns: the first column contain the cell index and the second
     * column the cell module.
     */
    render() {
        const { onClose, open, project, workflow } = this.props;
        let url = window.location.protocol + '//' + window.location.host
        url += pageUrl(project.id, workflow.branch.id, workflow.version);
        return (
            <Modal open={open} dimmer={false} size={'small'}>
                <Modal.Header>Share Link</Modal.Header>
                <Modal.Content>
                    <div>
                        <p className='share-header'>
                            Copy link below to share this notebook version
                        </p>
                        <p className='share-link'>
                            {url}
                        </p>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button  primary onClick={onClose}>Done</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ShareLinkModal;
