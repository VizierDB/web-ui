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
import '../../../css/ResourceListing.css'

/**
 * Modal to input (or modify) the name of a resource. The optional isValid
 * function is used to check whether the entered value is valid or not.
 */
class FileUploadModal extends React.Component {
    static propTypes = {
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
        
        this.state = {file: null};
    }
    /**
     * Make sure the clear the internal state value on cancel.
     */
    handleCancel = () => {
        const { onCancel } = this.props;
        this.setState({file: null});
        onCancel();
    }
    onChange = (e) => {
        this.setState({file:e.target.files[0]})
      }
    /**
     * Call the provided onSubmit with the entered name. Use the optional
     * isValid function to check if the entered value is valid or not.
     */
    handleSubmit = (event) => {
        const { onSubmit } = this.props;
        const { file } = this.state
        // Return without submit if invalid value is given.
        if (file != null) {
        	onSubmit(file);
        }
        else 
        	return;
    }
    /**
     * Show simple modal with input text box.
     */
    render() {
        const { prompt, open, title } = this.props;
        const { file } = this.state;
        let message = null;
        if (prompt != null) {
            message = (<p>{prompt}</p>);
        }
        let validFile = file != null;
        
        return (
            <Modal open={open} size={'small'}>
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content>
                    <div className="resource-name">
                        {message}
                        <input type="file" onChange={this.onChange} />
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
                        disabled={!validFile}
                        onClick={this.handleSubmit}
                    />
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileUploadModal;
