/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types'
import { Button, Modal } from 'semantic-ui-react'
import { TextInput } from '../notebook/input/form/TextInput'
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
        value: PropTypes.string,
        inputComponent: PropTypes.object
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
        let { value } = this.state
        if(!value && this.props.value){
        	value = this.props.value
        }
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
        const { isValid, prompt, open, title, inputComponent } = this.props;
        let { value } = this.state;
        let message = null;
        if(!value && this.props.value){
        	value = this.props.value
        }
        if (prompt != null) {
            message = (<p>{prompt}</p>);
        }
        let validName = true;
        if (isValid != null) {
            validName = isValid(value);
        }
        let Tag = 'TextInput'
        let inputProps = {}
        if(!inputComponent){
        	let ic = <TextInput
                id="EditResourceNameModal"
		        value={value}
	            onChange={this.handleChange}
	            onKeyDown={this.handleKeyDown}
		    />
        	Tag = ic.type;
            inputProps = Object.assign(inputProps, ic.props);
        }
        else {
            Tag = inputComponent.type;
            inputProps = Object.assign(inputProps, inputComponent.props);
            delete this.props.inputComponent;
        }
        return (
            <Modal open={open} size={'small'}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                    <div className="resource-name">
                        {message}
                        <Tag {...inputProps} />
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button  onClick={this.handleCancel}>Cancel</Button>
                    <Button
                        primary
                        icon='checkmark'
                        labelPosition='right'
                        content='Submit'
                        disabled={!validName}
                        onClick={this.handleSubmit}
                    />
                </Modal.Actions>
            </Modal>
        );
    }
}


export default EditResourceNameModal;
