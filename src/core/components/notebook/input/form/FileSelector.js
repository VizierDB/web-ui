/**
 * Dropdown selector for uploaded files
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class FileSelector extends React.Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    handleChange = (event, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    render() {
        const { files, isRequired, value } = this.props
        let selectedFileName = ''
        const options = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            options.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            options.push({
                key: file.id,
                text: file.name,
                value: file.id
            })
            if (file.id === value) {
                selectedFileName = file.name
            }
        }
        return (
            <Dropdown
                text={selectedFileName}
                selection
                fluid
                scrolling
                options={options}
                onChange={this.handleChange}
            />
        );
    }
}

export default FileSelector
