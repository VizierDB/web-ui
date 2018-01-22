/**
 * Dropdown selector for uploaded files
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'


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
        const options = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            options.push({
                key: file.id,
                text: file.name,
                value: file.id
            })
        }
        return (
            <Form.Group inline >
                <Form.Field width={1}><label>{label}</label></Form.Field>
                <Form.Select
                    value={value}
                    options={options}
                    onChange={this.handleChange}
                    width={4}
                />
            </Form.Group>
        );
    }
}

export default FileSelector
