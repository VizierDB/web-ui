/**
 * Form component that displays a text input field.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'
import { KEY } from '../../../../util/App';


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
        const { id, onChange, onSubmit } = this.props;
        const { ctrlKey, keyCode } = event;
        if ((onSubmit != null) && (keyCode === KEY.ENTER)) {
            onSubmit();
        } else if ((ctrlKey) && (keyCode === KEY.NULL)) {
            event.preventDefault();
            onChange(id, null);
        }
    }
    render() {
        const { placeholder, value } = this.props;
        // Get a string representation of the cell value. The value could be a
        // number, boolean, string or null.
        let strValue = null;
        if (value == null) {
            strValue = '';
        } else {
            strValue = value.toString();
        }
        return (
            <Form.Input
                placeholder={placeholder}
                fluid
                value={strValue}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
            />
        );
    }
}

export default TextControl
