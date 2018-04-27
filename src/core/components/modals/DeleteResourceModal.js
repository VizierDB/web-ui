import React from 'react';
import PropTypes from 'prop-types'
import { Button, Header, Icon, Modal } from 'semantic-ui-react'


/**
 * Generic modal dialog to confirm deleting a resource object.
 */

class DeleteResourceModal extends React.Component {
    static propTypes = {
        open: PropTypes.bool.isRequired,
        onCancel: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        prompt: PropTypes.string,
        title: PropTypes.string.isRequired,
        value: PropTypes.object.isRequired
    }
    /**
     * Call the given submit method with the given object.
     */
    handleSubmit = () => {
        const { onSubmit, value } = this.props;
        onSubmit(value);
    }
    /**
     * Show simple confirm dialog.
     */
    render() {
        const { prompt, open, onCancel, title } = this.props;
        return (
            <Modal open={open} basic size='small'>
                <Header icon='trash' content={title} />
                <Modal.Content>
                    {prompt}
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red' inverted onClick={onCancel}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button
                        color='green'
                        inverted
                        onClick={this.handleSubmit}
                    >
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

DeleteResourceModal.defaultProps = {
    open: false
}

export default DeleteResourceModal;
