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

import React from 'react';
import PropTypes from 'prop-types';
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/mode/sql/sql';
import '../../../../../css/App.css';
import '../../../../../css/ModuleForm.css';


class CodeCell extends React.Component {
    static propTypes = {
        cursorPosition: PropTypes.object.isRequired,
        editing: PropTypes.bool.isRequired,
        id: PropTypes.string.isRequired,
        isActiveCell: PropTypes.bool.isRequired,
        language: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        onCursor: PropTypes.func.isRequired,
        onFocus: PropTypes.func.isRequired,
        value: PropTypes.string,
    }
    /**
     * Handle changes in the code mirror editor. Keep track of the editor value
     * locally and propagate the state change to the conrolling notebook cell
     * input form..
     */
    handleChange = (editor, value, data) => {
        const { id, onChange } = this.props;
        let cursorp = editor.getCursor();
        if(data.to &&  data.from && data.origin){
        	if(data.origin === '+input' || data.origin === 'paste'){
        		let newLines = data.text;
        		let newLineCount =  newLines.length -1;
        		let lastLineLength = newLines[newLineCount].length;
        		let newLine = data.from.line + newLineCount;
        	    let newCh = lastLineLength;
        	    if(newLines.length === 1) {
        	    	newCh = data.from.ch + lastLineLength;
        	    }
        		cursorp = {line:newLine, ch:newCh};
        	}
        	else if(data.origin === '+delete') {
        		cursorp = {line:data.from.line, ch:data.from.ch};
        	}
        }
        onChange(id, value, cursorp);
    }
    /**
     * Handle cursor changes in the code mirror editor. Keep track of the cursor position
     * locally so that it sets properly on render.
     */
    handleCursorActivity = (editor, data) => {
        let cursorPos = editor.getCursor();
        this.props.onCursor(cursorPos);
    }
    /**
     * Show the code editor and optionally the code snippet selector.
     */
    render() {
        const {
            cursorPosition,
            isActiveCell,
            language,
            onFocus,
            value
        } = this.props;
        // The editor mode and the shown code snippet selector depends on the
        // value of the language property. By now we support the following
        // three languages: Python, Scala, SQL. It would be nice to have a more
        // comprehensive mapping of language identifier to CodeMirror modes.
        let mode = null;
        if (language === 'python') {
            mode = 'python';
        } else if (language === 'scala') {
            mode = 'text/x-scala';
        } else if (language === 'sql') {
            mode = 'text/x-sql';
        } else {
            console.log('Language is ' + language)
        }
        return (
            <div className='editor-container'>
                <CodeMirror
                    value={value}
                    cursor={cursorPosition}
                    options={{
                        autofocus: isActiveCell,
                        lineNumbers: true,
                        mode: mode,
                        indentUnit: 4
                    }}
                    onBeforeChange={(editor, data, value) => {
                        this.handleChange(editor, value, data);
                    }}
                	onCursor={(editor, data) => {
                		this.handleCursorActivity(editor, data)
                	}}
                    onFocus={onFocus}
                />
            </div>
        );
    }
}

export default CodeCell
