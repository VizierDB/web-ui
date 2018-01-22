/**
 * A Python command cell contains a text field for the command content and a
 * submit button.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python'

class CodeEditor extends React.Component {
    static propTypes = {
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        value: PropTypes.string
    }
    handleChange = (value) => {
        const { id, handler } = this.props
        handler.setFormValue(id, value)
    }
    render() {
        const { value } = this.props
        return (
            <CodeMirror
                value={value}
                onChange={this.handleChange}
                options={{
                    lineNumbers: true,
                    mode: 'python',
                    indentUnit: 4
                }}
            />
        );
    }
}

export default CodeEditor
