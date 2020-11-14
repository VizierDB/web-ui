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
import { Button, Modal, Input, Label } from 'semantic-ui-react'
import '../../../css/Modals.css'


/**
* Modal to display a shareable link for a notebook version
*/
class ShareLinkModal extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        open: PropTypes.bool.isRequired,
        url: PropTypes.string.isRequired,
        copySupport: PropTypes.bool.isRequired
    }

    state = {
        copySuccess: false
    }

    copyToClipboard = () => {
        this.textInput.select();
        document.execCommand('copy');
        this.setState({copySuccess : true})
    }

    /**
     * Show notebook cell content. There are four different layouts depending on
     * the values of the isExpanded and hasModule flags. The general layout is
     * two columns: the first column contain the cell index and the second
     * column the cell module.
     */
    render() {
        const { onClose, open, url, copySupport } = this.props;
        return (
            <Modal open={open} dimmer={'inverted'} size={'small'}>
                <Modal.Header>Share Link</Modal.Header>
                <Modal.Content>
                    <div>
                        <p className='share-header'>
                            Copy link below to share this notebook version
                        </p>
                        { // ensure copying to clipboard is supported by the browser else just display the link
                        	copySupport ?
                            <Input
                                fluid
                                readOnly
                                action={{
                                    icon: "copy",
                                    onClick: () => this.copyToClipboard(),
                                    content: this.state.copySuccess ? "Copied!" : "Copy"
                                }}
                                value = {url}
                                ref={ref=>this.textInput=ref}
                            /> :
                                <Label readOnly>
                                    <a href={url} target="_blank">{url}</a>
                                </Label>
                        }
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button  primary onClick={onClose}>Done</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ShareLinkModal;
