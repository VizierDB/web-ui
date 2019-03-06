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
import { PropTypes } from 'prop-types';
import {Controlled as CodeMirror} from 'react-codemirror2'
import '../../../../css/Notebook.css';


/**
 * Display the text representation of a workflow module command.
 */
class CellCommandText extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        onDoubleClick: PropTypes.func
    }
    render() {
        const { cell, onDoubleClick } = this.props;
        const { command, text } = cell.module;
        // The stylesheet class name depends on the state of the module. Append
        // error-state in case of an error or if the module was canceled.
        let css = 'cell-cmd-text';
        if (cell.isErrorOrCanceled()) {
            css += ' error-state';
        }
        let content = null;
        if (cell.isCode()) {
            content = (
                <CodeMirror
                    value={text.trim()}
                    options={{
                        lineNumbers: false,
                        mode: cell.getCodeLanguage(),
                        indentUnit: 4
                    }}
                    readOnly={true}
                />
            );
        } else {
            content = text;
        }
        return (<pre className={css} onDoubleClick={onDoubleClick}>{content}</pre>);
    }
}

export default CellCommandText;
