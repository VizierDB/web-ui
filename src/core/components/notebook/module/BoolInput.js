/**
 * Checkbox for boolean input
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'semantic-ui-react'


class BoolInput extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.bool.isRequired
    }
    handleChange = (e, { checked }) => {
        const { id, handler } = this.props
        handler.setFormValue(id, checked)
    }
    render() {
        const { label, value } = this.props
        return (
            <tr>
                <td className='form-label'>{label}</td>
                <td className='form-control'>
                    <Checkbox slider checked={value} onChange={this.handleChange}/>
                </td>
            </tr>
        )
    }
}
/*<Form.Checkbox
    checked={value}
    onChange={this.handleChange}
/>*/

export default BoolInput
