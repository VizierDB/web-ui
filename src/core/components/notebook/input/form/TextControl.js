/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
        onChange: PropTypes.func.isRequired
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
            />
        );
    }
}

export default TextControl
