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
import { isErrorOrCanceled }  from '../../../resources/Workflow';
import '../../../../css/Notebook.css';


/**
 * Display the text representation of a workflow module command.
 */
class CellCommandText extends React.Component {
    static propTypes = {
        moduleState: PropTypes.number.isRequired,
        onDoubleClick: PropTypes.func,
        text: PropTypes.string.isRequired
    }
    render() {
        const { moduleState, onDoubleClick, text } = this.props;
        // The stylesheet class name depends on the state of the module. Append
        // error-state in case of an error or if the module was canceled.
        let css = 'cell-cmd-text';
        if (isErrorOrCanceled(moduleState)) {
            css += ' error-state';
        }
        return  (<pre className={css} onDoubleClick={onDoubleClick}>{text}</pre>);
    }
}

export default CellCommandText;
