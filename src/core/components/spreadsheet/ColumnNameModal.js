import React from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Modal } from 'semantic-ui-react'


class ColumnNameModal extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        spreadsheet: PropTypes.object.isRequired,
    }
    constructor(props) {
        super(props)
        this.state = {columnName: ''}
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
     * Update component state when user enters a value in the input control.
     */
    handleChange = (event) => {
        this.setState({columnName: event.target.value})
    }
    /**
     * Handle ESC and RETURN to cancel or submit the modal.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.handleSubmit()
        } else if (event.keyCode === 27) {
            this.cancel();
        }
    }
    /**
     * Submit the insert column action by calling the provided onSubmit method
     * with the user-provided column name.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props
        const { columnName } = this.state
        onSubmit(columnName.trim())
    }
    render() {
        return (
            <Modal open={true} size={'small'}>
                <Modal.Header>Insert Column</Modal.Header>
                <Modal.Content>
                    <div className="resource-name">
                        <p>Enter a name for the new column</p>
                        <Input
                            autoFocus
                            className="resource-name-input"
                            value={this.state.columnName}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                        />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button  negative onClick={this.cancel}>
                        Cancel
                    </Button>
                    <Button
                        positive
                        icon='checkmark'
                        labelPosition='right'
                        content="Insert"
                        onClick={this.handleSubmit}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default ColumnNameModal
