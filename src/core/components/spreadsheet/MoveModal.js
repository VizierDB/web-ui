import React from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Modal } from 'semantic-ui-react'
import '../../../css/ResourceListing.css'

class MoveModal extends React.Component {
    static propTypes = {
        maxValue: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        onSubmit: PropTypes.func.isRequired,
        spreadsheet: PropTypes.object.isRequired,
        type: PropTypes.string.isRequired
    }
    constructor(props) {
        super(props)
        this.state = {targetPosition: '', invalidValue: true}
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
     * Handle changes in the input control. The submit button is only enabled
     * if a valid number between 0 and maxValue has been entered.
     */
    handleChange = (event) => {
        const { maxValue } = this.props
        const val = parseInt(event.target.value, 10)
        let invalid = true;
        if (!isNaN(val)) {
            invalid = (val< 0) || (val > maxValue)
        }
        this.setState({
            targetPosition: event.target.value,
            invalidValue: invalid
        })
    }
    /**
     * Handle ESC and RETURN to cancel or submit the modal.
     */
    handleKeyDown = (event) => {
        const { onSubmit } = this.props
        const { targetPosition, invalidValue } = this.state
        if ((event.keyCode === 13) && (!invalidValue)) {
            onSubmit(parseInt(targetPosition, 10))
        } else if (event.keyCode === 27) {
            this.cancel();
        }
    }
    /**
     * Submit the user input using the provided onSubmit callback. Only submit
     * if the entered value is valid.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props
        const { targetPosition, invalidValue } = this.state
        if (!invalidValue) {
            onSubmit(parseInt(targetPosition, 10))
        }
    }
    render() {
        const { name, type } = this.props
        const title = 'Move ' + type
        const message = 'Enter target position for ' + type.charAt(0).toLowerCase() + type.slice(1) + ' ' + name
        return (
            <Modal open={true} size={'small'}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                    <div className="resource-name">
                        <p>{message}</p>
                        <Input
                            autoFocus
                            className="resource-name-input"
                            value={this.state.targetPosition}
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
                        content="Move"
                        disabled={this.state.invalidValue}
                        onClick={this.handleSubmit}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default MoveModal
