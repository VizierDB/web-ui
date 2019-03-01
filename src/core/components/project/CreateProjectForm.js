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
import PropTypes from 'prop-types';
import { Button, Input, Form, Modal } from 'semantic-ui-react'

/**
 * Display a simple button and text field to create a new project with a
 * user-defined name.
 */
class CreateProjectForm extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {value: ''};
    }
    /**
     * Handle changes in the form control element by updating the internal state.
     */
    handleChange = (event) => {
        this.setState({value: event.target.value});
    }
    /**
     * Detect RETURN key press to submit form.
     */
    handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.handleSubmit();
        }
    }
    /**
     * Toggle form view whenever the edit or cancel button is clicked.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props
        const { value } = this.state
        onSubmit(value)
    }
    /**
     * Hide form by dispatching the toggle visibility action.
     */
    hideForm = () => {
        const { onClose } = this.props;
        onClose();
    }
    /**
     * Show the create project form. The form contains a text field to enter the
     * project name, and a submit button.
     */
    render() {
        return (
            <Modal open={true} dimmer={'inverted'} size={'small'}>
                <Modal.Header>New Project ...</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <Input
                                fluid
                                type='text'
                                placeholder='New Project Name ...'
                                value={this.state.value}
                                onChange={this.handleChange}
                                onKeyDown={this.handleKeyDown}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button  primary onClick={this.handleSubmit}>Submit</Button>
                    <Button  onClick={this.hideForm}>Close</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default CreateProjectForm;
