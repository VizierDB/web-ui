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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon, Loader, Segment, Table } from 'semantic-ui-react';
import Dropzone from 'react-dropzone';
import {
    deleteFile, fetchFiles, fileDeleteError, fileUpdateError, updateFileName,
    uploadError, uploadFile
} from '../../actions/fileserver/Fileserver';
import { IconButton } from '../../components/Button';
import ContentSpinner from '../../components/ContentSpinner';
import { ErrorMessage } from '../../components/Message';
import DeleteResourceModal from '../../components/modals/DeleteResourceModal';
import EditResourceNameModal from '../../components/modals/EditResourceNameModal';
import { formatBytes, isNotEmptyString } from '../../util/App';
import '../../../css/App.css';
import '../../../css/Fileserver.css';
import '../../../css/ResourceListing.css';

/**
 * Container and component to interact with the Vizier DB File Server. The
 * component lists the uploaded files. It allows the user to upload new files,
 * edit file names, and delete files.
 */


/**
 * Return question mark if number is negative (i.e., missing file property due
 * to parsing error on backend).
 */
const formatNumber = (val) => {
    if (val < 0) {
        return '?'
    } else {
        return val
    }
}

class Fileserver extends Component {
    static propTypes = {
        deleteError: PropTypes.string,
        fetchError: PropTypes.string,
        updateError: PropTypes.string,
        uploadError: PropTypes.string,
        isFetching: PropTypes.bool.isRequired,
        isUploading: PropTypes.bool.isRequired,
        files: PropTypes.array.isRequired,
        links: PropTypes.object,
        serviceProperties: PropTypes.array.isRequired
    }
    constructor(props) {
        super(props);
        // The local state keeps track of the handles for files that the user
        // wants to delete or edit. If either value is non-null the respective
        // modal to confirm delete or edit the file name is shown. At no point
        // should both values be non-null.
        this.state = {deleteFile: null, editFile: null}
    }
    /**
     * Load the file listing when the component mounts.
     */
    componentDidMount = () => (this.refresh());
    /**
     * Remove delete file error message
     */
    clearDeleteError = () => {
        const { dispatch } = this.props
        dispatch(fileDeleteError(null))
    }
    /**
     * Remove file name update error message
     */
    clearUpdateError = () => {
        const { dispatch } = this.props
        dispatch(fileUpdateError(null))
    }
    /**
     * Remove file upload error message
     */
    clearUploadError = () => {
        const { dispatch } = this.props
        dispatch(uploadError(null))
    }
    /**
     * Delete the file with the given Url.
     */
    confirmDeleteFile = (fh) => {
        const { dispatch } = this.props
        dispatch(deleteFile(fh))
        this.setState({deleteFile: null})
    }
    /**
     * Set values for delete file and edit file to null so that no modal is
     * being shown.
     */
    hideModals = () => {
        this.setState({deleteFile: null, editFile: null})
    }
    /**
     * Dispatch upload file action when a file is dropped in the Dropzone.
     */
    onDrop(files) {
        const { links, dispatch } = this.props
        dispatch(uploadFile(links.upload, files[0]));
    }
    /**
     * Re-load file lsiting (either when component mounts or when user
     * presses the refresh button).
     */
    refresh = () => {
        const { dispatch } = this.props
        dispatch(fetchFiles())
    }
    /**
     * Show a list of existing files and the upload file form. Optional, a
     * 'Delete File' or a 'Update File Name' dialog are being displayed.
     */
    render() {
        const {
            isFetching, isUploading, deleteError, fetchError, updateError,
            uploadError, files, serviceProperties
        } = this.props;
        let content = null;
        if (isFetching) {
            // Show spinner while fetching files
            content = (<div className='spinner-padding-ms'><Loader inline active={true} size='massive'>Loading Files ...</Loader></div>)
        } else if (fetchError) {
            // Show error message if fetching files failed. No other components
            // are shown since this is a fatal error and something significant
            // is wrong.
            content = (<ErrorMessage
                title="Error while loading file list"
                message={fetchError}
            />)
        } else {
            // Show file listing as table and file upload form. If either of the
            // local state variables are set the respective modal is shown.
            const tabHead = (
                    <Table.Row>
                        <Table.HeaderCell className="resource">Name</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Size</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Created at</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Last Modified at</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Columns</Table.HeaderCell>
                        <Table.HeaderCell className="resource">Rows</Table.HeaderCell>
                        <Table.HeaderCell className="resource"></Table.HeaderCell>
                    </Table.Row>
            );
            files.sort(function(f1, f2) {return f1.name.localeCompare(f2.name)});
            let rows = [];
            for (let i = 0; i < files.length; i++) {
                const fh = files[i];
                rows.push(<Table.Row key={fh.id}>
                    <Table.Cell className={'resource'}>
                        <a className={'resource-link'} href={fh.links.download}>{fh.name}</a>
                    </Table.Cell>
                    <Table.Cell className={'resource-number'}>{formatBytes(fh.filesize, 2)}</Table.Cell>
                    <Table.Cell className={'resource-text'}>{fh.createdAt}</Table.Cell>
                    <Table.Cell className={'resource-text'}>{fh.lastModifiedAt}</Table.Cell>
                    <Table.Cell className={'resource-number'}>{formatNumber(fh.columns)}</Table.Cell>
                    <Table.Cell className={'resource-number'}>{formatNumber(fh.rows)}</Table.Cell>
                    <Table.Cell className={'resource-buttons'}>
                        <span className='button-wrapper'>
                            <IconButton name="edit" onClick={(event) => {
                                event.preventDefault();
                                this.showEditFileModal(fh);
                            }}/>
                        </span>
                        <span className='button-wrapper'>
                            <IconButton name="trash" onClick={(event) => {
                                event.preventDefault();
                                this.showDeleteFileModal(fh);
                            }}/>
                        </span>
                    </Table.Cell>
                </Table.Row>);
            }
            // Check if deleteFile or editFile are set. In that case display a
            // modal dialog for the user to either confirm (or cancel) file
            // deletion or enter the new file name. It is assumed that at most
            // one of the two values is non-null.
            const { deleteFile, editFile } = this.state
            let modal = null;
            if (deleteFile) {
                modal = (
                    <DeleteResourceModal
                        open={true}
                        onCancel={this.hideModals}
                        onSubmit={this.confirmDeleteFile}
                        prompt={'Do you really want to delete ' +  deleteFile.name + '?'}
                        title='Delete File'
                        value={deleteFile}
                    />
                );
            } else if (editFile) {
                modal = (
                    <EditResourceNameModal
                        isValid={isNotEmptyString}
                        open={true}
                        title='Enter a new file name ...'
                        value={editFile.name}
                        onCancel={this.hideModals}
                        onSubmit={this.submitFileNameUpdate}
                    />
                );
            }
            // Display an error message generated while deleting or editing a
            // file. The message will be displayed at the bottom of the file
            // listing table.
            let modalActionErrorMessage = null
            if (deleteError) {
                modalActionErrorMessage = (<ErrorMessage
                    title="Error while deleting file"
                    message={deleteError}
                    onDismiss={this.clearDeleteError}
                />)
            } else if (updateError) {
                modalActionErrorMessage = (<ErrorMessage
                    title="Error while updating file name"
                    message={updateError}
                    onDismiss={this.clearUpdateError}
                />)
            }
            // Display a dropzone to upload files or a spinner during upload
            let fileUploadForm = null;
            if (isUploading) {
                fileUploadForm = (
                    <ContentSpinner
                        text='Uploading file ...'
                        size='medium'
                    />
                );
            } else {
                let property = serviceProperties.find(prop => (prop.key === 'fileserver:maxFileSize'));
                let uploadInfo = null
                if (property) {
                    uploadInfo = (
                        <p className='upload-info'>
                            <Icon name='info circle' />
                            <span>
                                The size for file uploads is limited to
                            </span>
                            <span className='upload-size'>
                                {' ' + formatBytes(property.value, 2)}
                            </span>
                        </p>
                    )
                }
                fileUploadForm = (
                    <div>
                        <div className='dropzone-container'>
                            <div className="dropzone">
                                <Dropzone onDrop={this.onDrop.bind(this)} multiple={false}>
                                    <p>Drop file here or click to select file to upload.</p>
                                </Dropzone>
                            </div>
                        </div>
                        {uploadInfo}
                    </div>
                )
                if (uploadError) {
                    fileUploadForm = (
                        <div>
                            <ErrorMessage
                                title="Error while uploading file"
                                message={uploadError}
                                onDismiss={this.clearUploadError}
                            />
                            {fileUploadForm}
                        </div>
                    )
                }
            }
            content = (
                <div>
                    <Table singleLine>
                        <Table.Header>{tabHead}</Table.Header>
                        <Table.Body>{rows}</Table.Body>
                        <Table.Footer fullWidth>
                            <Table.Row>
                                <Table.HeaderCell colSpan='7'>
                                    <Button
                                        floated='right'
                                        icon
                                        labelPosition='left'
                                        size='tiny'
                                        onClick={this.refresh}
                                    >
                                      <Icon name='refresh' /> Refresh
                                    </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                            </Table.Footer>
                    </Table>
                    { modal }
                    { modalActionErrorMessage }
                    <Segment>
                        { fileUploadForm }
                    </Segment>
                </div>
            );
        }
        return content;
    }
    /**
     * Show modal to confirm file delete.
     */
    showDeleteFileModal(file) {
        this.setState({deleteFile: file})
    }
    /**
     * Show modal to confirm file delete.
     */
    showEditFileModal(file) {
        this.setState({editFile: file})
    }
    /**
     * Submit the update file name request.
     */
    submitFileNameUpdate = (name) => {
        const {dispatch } = this.props
        const { editFile } = this.state
        dispatch(updateFileName(editFile, name))
        this.hideModals()
    }
}

const mapStateToProps = state => {

    return {
        fetchError: state.fileserver.fetchError,
        deleteError: state.fileserver.deleteError,
        updateError: state.fileserver.updateError,
        uploadError: state.fileserver.uploadError,
        isFetching: state.fileserver.isFetching,
        isUploading: state.fileserver.isUploading,
        files: state.fileserver.files,
        links: state.fileserver.links,
        serviceProperties: state.fileserver.serviceProperties
    }
}

export default connect(mapStateToProps)(Fileserver)
