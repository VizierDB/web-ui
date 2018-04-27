/**
 * Form component that displays a text input field.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'


/**
 * Simple text control to input a string.
 */
class TextControl extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        onChange: PropTypes.func.isRequired,
        onSubmit: PropTypes.func
    }
    /**
     * Change handler for text control. Update the state of the control in the
     * component that maintains the state of the form that contains this text
     * control.
     */
    handleChange = (event, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    /**
     * Handle RETURN to submit the form that contains the text control (if a
     * onSubmit handler is given).
     */
    handleKeyDown = (event) => {
        const { onSubmit } = this.props;
        if ((onSubmit != null) && (event.keyCode === 13)) {
            onSubmit();
        }
    }
    render() {
        const { placeholder, value } = this.props;
        return (
            <Form.Input
                placeholder={placeholder}
                fluid
                value={value}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
            />
        );
    }
}

export default TextControl
