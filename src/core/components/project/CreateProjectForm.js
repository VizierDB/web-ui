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
import { Button, Checkbox, Input, Form, Modal } from 'semantic-ui-react'

/**
 * Display a simple button and text field to create a new project with a
 * user-defined name.
 */
class CreateProjectForm extends React.Component {
    static propTypes = {
        envs: PropTypes.array.isRequired,
        onClose: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        let selectedEnv = null;
        const { envs } = this.props;
        if (envs) {
            envs.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
            for (let i = 0; i < envs.length; i++) {
                const env = envs[i];
                if (selectedEnv === null) {
                    selectedEnv = env;
                } else if (env.default) {
                    selectedEnv = env;
                }
            }
        }
        this.state = {value: '', selectedEnv: selectedEnv};
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
     * Set the default workflow execution environment to the entry whose
     * identifier matches the given value.
     */
    handleSelectEnv = (e, { value }) => {
        const { envs } = this.props;
        if (envs) {
            for (let i = 0; i < envs.length; i++) {
                const env = envs[i];
                if (env.id === value) {
                    this.setState({selectedEnv: env})
                    return;
                }
            }
        }
    }
    /**
     * Toggle form view whenever the edit or cancel button is clicked.
     */
    handleSubmit = () => {
        const { onSubmit } = this.props
        const { selectedEnv, value } = this.state
        if (selectedEnv) {
            onSubmit(value,  selectedEnv)
        }
    }
    /**
     * Hide form by dispatching the toggle visibility action.
     */
    hideForm = () => {
        const { onClose } = this.props;
        onClose();
    }
    /**
     * Show the create project form. The form contains three main parts: a
     * dropdown to select the execution environment, a text field to enter the
     * project name, and a submit button. In addition there is a text line to
     * display the description about the selected execution environment and an
     * optional error message.
     */
    render() {
        const { envs } = this.props;
        const { selectedEnv } = this.state;
        // Check the isSubmitting flag to determine whether to display a spinner
        // or the form. Note that if environments are not set, null is returned.
        if (envs) {
            // Create option group for environments if there is more than one
            // option.
            let envOptions = null;
            if (envs.length > 1) {
                // Sort environments by their name
                envs.sort(function(e1, e2) {return e1.name.localeCompare(e2.name)});
                envOptions = [];
                for (let i = 0; i < envs.length; i++) {
                    const env = envs[i];
                    envOptions.push(
                        <Form.Field key={env.id}>
                            <Checkbox
                                radio
                                label={env.name}
                                name='checkboxRadioGroupEnvs'
                                value={env.id}
                                checked={selectedEnv.id === env.id}
                                onChange={this.handleSelectEnv}
                            />
                        </Form.Field>
                    )
                }
            }
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
                            { envOptions }
                        </Form>
                        <p className='info-text'>
                            Create new data curation project using
                            <span className='info-bold'>{selectedEnv.name}</span>:
                            <span className='info-highlight'>{selectedEnv.description}</span>
                        </p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button  primary onClick={this.handleSubmit}>Submit</Button>
                        <Button  onClick={this.hideForm}>Close</Button>
                    </Modal.Actions>
                </Modal>
            );
        } else {
            return null;
        }
    }
}

export default CreateProjectForm;
