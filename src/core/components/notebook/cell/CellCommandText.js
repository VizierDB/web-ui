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
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import '../../../../css/Notebook.css';


/**
 * Display the text representation of a workflow module command.
 */
class CellCommandText extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        onDoubleClick: PropTypes.func,
        onClick: PropTypes.func
    }
    render() {
        const { cell, onClick, onDoubleClick } = this.props;
        const text = cell.module.text;
        // The stylesheet class name depends on the state of the module. Append
        // error-state in case of an error or if the module was canceled.
        let css = 'cell-cmd-text';
        let content = null;
        if (cell.isCodeCell()) {
            // Use Syntax highlighter:
            // https://github.com/conorhastings/react-syntax-highlighter
            // CodeMirror did not work here for some reason.
            const style = {marginTop: '-5px'};
            return (
                <SyntaxHighlighter
                    customStyle={style}
                    language={cell.getCodeLanguage()}
                    onClick={onClick}
                    onDoubleClick={onDoubleClick}
                    style={githubGist}
                >
                    {text}
                </SyntaxHighlighter>
            );
        } else {
            content = text;
        }
        return (<pre className={css} onClick={onClick} onDoubleClick={onDoubleClick}>{content}</pre>);
    }
}

export default CellCommandText;
