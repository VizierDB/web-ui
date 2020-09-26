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

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Icon } from 'semantic-ui-react'
import Dropzone from 'react-dropzone';
import { formatBytes } from '../../../../util/App';

/**
 * Dropdown selector for uploaded files. The value is an object that contains
 * the following fields: fileid, oneOf(filename, url). The fileid is the unique
 * identifier of the selected file. If null, no file has been selected. The
 * filename is the name of a file that was uploaded from disk. The url is
 * the Url of a file that has been uploaded from the Web.
 *
 */
class FileSelector extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        serviceProperties: PropTypes.object.isRequired,
        value: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired
    }
    /**
     * Clear the currently selected source file.
     */
    clearSourceFile = () => {
        const { id, onChange } = this.props
        onChange(id, {fileid: null, filename: null, url: null});
    }
    /**
     * Dispatch upload file action when a file is dropped in the Dropzone.
     */
    handleFileDrop = (files) => {
        const { id, onChange } = this.props
        // Submit new value with additional file information
        onChange(id, {fileid: null, filename: files[0].name, file: files[0], url: null});
    }
    render() {
        const { serviceProperties } = this.props;
        const { fileid, filename } = this.props.value;
        let content = null;
        let css = null;
        if ((filename != null)) {
            let action = null;
            if (fileid != null) {
                action = 'Uploaded';
            } else {
                action = 'Upload';
            }
            let name = null;
            let text = null;
            if (filename != null) {
                text = action + ' file from local disk'
                name = filename;
            } else {
                name = 'unknown';
            }
            css = 'file-content';
            content = (
                <div>
                    <p className='info-text'>{text}</p>
                    <p className='file-name'>{name}</p>
                    <Button
                        icon='trash'
                        title='Clear source file'
                        size='large'
                        negative
                        onClick={this.clearSourceFile}
                    />
                </div>
            );
        } else {
            let uploadInfo = null
            if (serviceProperties.maxFileSize) {
                uploadInfo = (
                    <p className='upload-info'>
                        <Icon name='info circle' />
                        <span>
                            The size for file uploads is limited to
                        </span>
                        <span className='upload-size'>
                            {' ' + formatBytes(serviceProperties.maxFileSize, 2)}
                        </span>
                    </p>
                )
            }
            css = 'file-selector';
            content = (
                <div>
                    <p className='info-text md-top'>Upload file from local disk</p>
                    <div className='dropzone-container'>
                        <div className='dropzone'>
                            <Dropzone onDrop={this.handleFileDrop} multiple={false}>
                                <p className='p-dropzone'>Drop file here or click to select file to upload.</p>
                            </Dropzone>
                        </div>
                    </div>
                    { uploadInfo }
                </div>
            );
        }
        return (
            <div className={css}>
                {content}
            </div>
        );
    }
}

export default FileSelector
