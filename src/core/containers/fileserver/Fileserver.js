/**
 * Container and component to interact with the Vizier DB File Server. The
 * component lists the uploaded files. It allows the user to upload new files,
 * edit file names, and delete files.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Header, Icon, Input, Modal, Segment, Table } from 'semantic-ui-react'
import Dropzone from 'react-dropzone';
import {
    deleteFile, fetchFiles, fileDeleteError, fileUpdateError, updateFileName,
    uploadError, uploadFile
} from '../../actions/fileserver/Fileserver'
import { ContentSpinner } from '../../components/util/Spinner'
import { ErrorMessage } from '../../components/util/Message';
import { IconButton } from '../../components/util/Button'

import '../../../css/Fileserver.css'
import '../../../css/ResourceListing.css'


/**
 * Convert file size bytes into string. Copied from:
 * https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 */
function formatBytes(a, b) {
    if (a < 0) {
        return '?'
    } else if (a === 0) {
        return '0 Bytes'
    }
    const c=1024
    const d=b||2
    const e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"]
    const f=Math.floor(Math.log(a)/Math.log(c))
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
}

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
        this.state = {deleteFile: null, editFile: null, fileName: ''}
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
    confirmDeleteFile = (url) => {
        const { dispatch } = this.props
        dispatch(deleteFile(url))
        this.setState({deleteFile: null})
    }
    /**
     * Set values for delete file and edit file to null so that no modal is
     * being shown.
     */
    hideModals = () => {
        this.setState({deleteFile: null, editFile: null, fileName: ''})
    }
    /**
     * Handle changes in the edit file name text field.
     */
    handleFileNameChange = (event) => {
        this.setState({fileName: event.target.value});
    }
    /**
     * Detect RETURN key press to submit edit file name form.
     */
    handleFileNameKeyDown = (event) => {
        if (event.keyCode === 13) {
            this.submitFileNameUpdate();
        }
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
            content = (<ContentSpinner />)
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
                    <Modal open={true} basic size='small'>
                        <Header icon='trash' content='Delete File' />
                        <Modal.Content>
                            <p>Do you really want to delete '{deleteFile.name}'?</p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button basic color='red' inverted onClick={this.hideModals}>
                                <Icon name='remove' /> No
                            </Button>
                            <Button
                                color='green'
                                inverted
                                onClick={(event) => {
                                    event.preventDefault()
                                    this.confirmDeleteFile(deleteFile.links.delete)
                                }}
                            >
                                <Icon name='checkmark' /> Yes
                            </Button>
                        </Modal.Actions>
                    </Modal>
                );
            } else if (editFile) {
                modal = (
                        <Modal open={true} size={'small'}>
                            <Modal.Header>{'Enter a new file name ...'}</Modal.Header>
                            <Modal.Content>
                                <div className="resource-name">
                                    <Input
                                        autoFocus
                                        className="resource-name-input"
                                        value={this.state.fileName}
                                        onChange={this.handleFileNameChange}
                                        onKeyDown={this.handleFileNameKeyDown}
                                    />
                                </div>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button  negative onClick={this.hideModals}>
                                    Cancel
                                </Button>
                                <Button
                                    positive
                                    icon='checkmark'
                                    labelPosition='right'
                                    content="Rename"
                                    onClick={this.submitFileNameUpdate}
                                />
                            </Modal.Actions>
                        </Modal>
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
                    handleDismiss={this.clearDeleteError}
                />)
            } else if (updateError) {
                modalActionErrorMessage = (<ErrorMessage
                    title="Error while updating file name"
                    message={updateError}
                    handleDismiss={this.clearUpdateError}
                />)
            }
            // Display a dropzone to upload files or a spinner during upload
            let fileUploadForm = null;
            if (isUploading) {
                fileUploadForm = (
                    <div className='dropzone-spinner'>
                        <ContentSpinner />
                    </div>
                )
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
                                handleDismiss={this.clearUploadError}
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
        this.setState({editFile: file, fileName: file.name})
    }
    /**
     * Submit the update file name request.
     */
    submitFileNameUpdate = () => {
        const {dispatch } = this.props
        const { editFile, fileName } = this.state
        dispatch(updateFileName(editFile.links.rename, fileName))
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
