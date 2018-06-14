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
