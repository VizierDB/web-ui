/**
 * Dropdown selector for uploaded files
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class TextSelector extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        value: PropTypes.string
    }
    handleChange = (event, { value }) => {
        const { id, handler } = this.props
        handler.setFormValue(id, value)
    }
    render() {
        const { label, options, value } = this.props
        const listing = [];
        for (let i = 0; i < options.length; i++) {
            const val = options[i];
            listing.push({
                key: val,
                text: val,
                value: val
            })
        }
        return (
            <tr>
                <td className='form-label'>{label}</td>
                <td className='form-control'>
                    <Dropdown
                        text={value}
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

export default TextSelector
