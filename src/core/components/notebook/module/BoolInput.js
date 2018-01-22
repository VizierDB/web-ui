/**
 * Checkbox for boolean input
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'


class BoolInput extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.bool.isRequired
    }
    handleChange = () => {
        const { id, handler, value } = this.props
        handler.setFormValue(id, !value)
    }
    render() {
        const { label, value } = this.props
        return (
            <Form.Group inline >
                <Form.Field width={1}><label>{label}</label></Form.Field>
                <Form.Checkbox
                    checked={value}
                    onChange={this.handleChange}
                />
            </Form.Group>
        )
    }
}

export default BoolInput
