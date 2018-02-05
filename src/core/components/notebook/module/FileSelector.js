/**
 * Dropdown selector for uploaded files
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class FileSelector extends React.Component {
    static propTypes = {
        files: PropTypes.array.isRequired,
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.string
    }
    handleChange = (event, { value }) => {
        const { id, handler } = this.props
        handler.setFormValue(id, value)
    }
    render() {
        const { files, label, value } = this.props
        let selectedFileName = ''
        const options = [];
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
            <tr>
                <td className='form-label'>{label}</td>
                <td className='form-control'>
                    <Dropdown
                        text={selectedFileName}
                        selection
                        fluid
                        scrolling
                        options={options}
                        onChange={this.handleChange}
                    />
                </td>
            </tr>
        );
    }
}

export default FileSelector
