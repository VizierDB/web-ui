import React from 'react';
import PropTypes from 'prop-types'
import { Button, Input, Modal } from 'semantic-ui-react'
import '../../../css/ResourceListing.css'

/**
 * Modal to input (or modify) the name of a resource. The optional isValid
 * function is used to check whether the entered value is valid or not.
 */
class EditResourceNameModal extends React.Component {
    static propTypes = {
        isValid: PropTypes.func,
        prompt: PropTypes.string,
        open: PropTypes.bool.isRequired,
        onCancel: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        value: PropTypes.string
    }
    /**
     * Keep the new resource name in the local state.
     */
    constructor(props) {
        super(props)
        let { value } = props;
        if (value == null) {
            value = '';
        }
        this.state = {value: value};
    }
    /**
     * Make sure the clear the internal state value on cancel.
     */
    handleCancel = () => {
        const { onCancel } = this.props;
        this.setState({value: ''});
        onCancel();
    }
    /**
     * Handle changes in the input control.
     */
    handleChange = (event) => {
        const val = event.target.value
        this.setState({value: val})
    }
    /**
     * Handle ESC and RETURN to cancel or submit the name update request.
     */
    handleKeyDown = (event) => {
        const { onCancel } = this.props;
        if (event.keyCode === 13) {
            this.handleSubmit();
        } else if (event.keyCode === 27) {
            onCancel();
        }
    }
    /**
     * Call the provided onSubmit with the entered name. Use the optional
     * isValid function to check if the entered value is valid or not.
     */
    handleSubmit = (event) => {
        const { isValid, onSubmit } = this.props;
        const { value } = this.state
        // Return without submit if invalid value is given.
        if (isValid != null) {
            if (!isValid(value)) {
                return;
            }
        }
        onSubmit(value);
    }
    /**
     * Show simple modal with input text box.
     */
    render() {
        const { isValid, prompt, open, title } = this.props;
        const { value } = this.state;
        let message = null;
        if (prompt != null) {
            message = (<p>{prompt}</p>);
        }
        let validName = true;
        if (isValid != null) {
            validName = isValid(value);
        }
        return (
            <Modal open={open} size={'small'}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                    <div className="resource-name">
                        {message}
                        <Input
                            autoFocus
                            className="resource-name-input"
                            value={value}
                            onChange={this.handleChange}
                            onKeyDown={this.handleKeyDown}
                        />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button  negative onClick={this.handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        positive
                        icon='checkmark'
                        labelPosition='right'
                        content="Done"
                        disabled={!validName}
                        onClick={this.handleSubmit}
                    />
                </Modal.Actions>
            </Modal>
        );
    }
}

export default EditResourceNameModal;