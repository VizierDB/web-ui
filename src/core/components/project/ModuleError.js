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
import { OutputText } from '../../resources/Notebook';
import '../../../css/Notebook.css';

/**
 * Display an error message that resulted during workflow execution. Displays
 * the workflow module that caused the error.
 */
class ModuleError extends React.Component {
    static propTypes = {
        module: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired
    }
    render() {
        const { title, module } = this.props;
        const lines = new OutputText(module.stderr).lines;
        return (
            <div className='notebook-cell-error'>
                <h3>{title}</h3>
                <pre className='cell-cmd-error'>
                    {module.text}
                </pre>
                <div className='collapsed-output-error'>
                    <pre className='plain-text'>
                        {lines.join('\n')}
                    </pre>
                </div>
            </div>
        );
    }
}

export default ModuleError;
