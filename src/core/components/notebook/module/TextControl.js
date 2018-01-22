/**
 * Form component that displays a text input field.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'


class TextControl extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ])
    }
    handleChange = (event, { value }) => {
        const { id, handler } = this.props
        handler.setFormValue(id, value)
    }
    render() {
        const { label, value } = this.props
        return (
            <Form.Group inline >
                <Form.Field width={1}><label>{label}</label></Form.Field>
                <Form.Input
                    placeholder={label}
                    value={value}
                    onChange={this.handleChange}
                    width={4}
                />
            </Form.Group>
        )
    }
}

export default TextControl
