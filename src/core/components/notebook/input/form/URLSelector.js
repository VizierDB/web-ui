import {Button, Form} from "semantic-ui-react";
import React, {useState} from "react";
import {KEY} from "../../../../util/App";
import PropTypes from 'prop-types'

URLSelector.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default function URLSelector(props) {
    const [downloadUrl, setDownloadUrl] = useState('');

    /**
     * Submit upload request from a given Url.
     */
    const uploadFromUrl = () => {
        const {id, onChange} = props
        if (downloadUrl.trim() !== '') {
            onChange(id, {fileid: null, filename: null, url: downloadUrl});
            setDownloadUrl('');
        }
    }

    /**
     * Handle changes in the Url form control.
     */
    const handleUrlChange = (event) => {
        setDownloadUrl(event.target.value);
    }

    /**
     * Detect RETURN key press in the Url control to submit form.
     */
    const handleUrlKeyDown = (event) => {
        if (event.keyCode === KEY.ENTER) {
            uploadFromUrl();
        }
    }

    /**
     * Clear the currently selected source file.
     */
    const clearSourceFile = () => {
        const { id, onChange } = props
        onChange(id, {fileid: null, filename: null, url: null});
    }

    const {fileid, url} = props.value;
    let content = null;
    let css = null;
    if ((url != null)) {
        let action = null;
        if (fileid != null) {
            action = 'Downloaded';
        } else {
            action = 'Download';
        }
        let name = url;
        let text = action + ' file from URL'
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
                    onClick={clearSourceFile}
                />
            </div>
        );
    } else {
        css = "file-selector"
        content = (<div>
            <p className='info-text md-top'>Download file from URL</p>
            <Form.Input
                type='text'
                value={downloadUrl}
                placeholder={'Upload File from Url'}
                icon='world'
                iconPosition='left'
                fluid
                action={<Button
                    icon='upload'
                    onClick={uploadFromUrl}
                />}
                onChange={handleUrlChange}
                onKeyDown={handleUrlKeyDown}
                onBlur={uploadFromUrl}
            />
        </div>)
    }
    return ( <div className={css}>
                {content}
            </div>)
}