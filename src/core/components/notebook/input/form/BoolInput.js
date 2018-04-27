/**
 * Checkbox for boolean input
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'semantic-ui-react'
import '../../../../../css/ModuleForm.css';


class BoolInput extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        value: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired
    }
    handleChange = (e, { checked }) => {
        const { id, onChange } = this.props
        onChange(id, checked)
    }
    render() {
        const { value } = this.props
        return (
            <span className='boolctrl'>
                <Checkbox checked={value} onChange={this.handleChange}/>
            </span>
        );
    }
}
/*<Form.Checkbox
    checked={value}
    onChange={this.handleChange}
/>*/

export default BoolInput
