import React from 'react'
import PropTypes from 'prop-types'
import { Button, Header, Icon, Modal } from 'semantic-ui-react'


class DeleteModal extends React.Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        onSubmit: PropTypes.func.isRequired,
        spreadsheet: PropTypes.object.isRequired,
        type: PropTypes.string.isRequired
    }
    /**
     * Cancel user action by calling the respective cancel method of the
     * associated spreadsheet.
     */
    cancel = () => {
        const { spreadsheet } = this.props
        spreadsheet.cancelAction()
    }
    /**
     * Call the onSubmit method that was passed as an argument to the component.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props
        onSubmit()
    }
    /**
     * Display a confirmation dialog that lets the user confirm or cancel a
     * delete operation.
     */
    render() {
        const { name, type } = this.props
        const title = 'Delete ' + type
        const message = 'Do you really want to delete ' + type.charAt(0).toLowerCase() + type.slice(1) + ' ' + name + '?'
        return (
            <Modal open={true} basic size='small'>
                <Header icon='trash' content={title} />
                <Modal.Content>
                    <p>{message}</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red' inverted onClick={this.cancel}>
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='green' inverted onClick={this.handleSubmit}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default DeleteModal
