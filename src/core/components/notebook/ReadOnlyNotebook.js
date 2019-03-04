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
import WorkflowModuleCell from './cell/WorkflowModuleCell';


/**
 * List of cells in a read-only notebook.
 */
class ReadOnlyNotebook extends React.Component {
    static propTypes = {
        notebook: PropTypes.object.isRequired,
        onCreateBranch: PropTypes.func.isRequired,
        reversed: PropTypes.bool.isRequired
    }
    render() {
        const { notebook, onCreateBranch, reversed } = this.props;
        // Create a notebook cell for each workflow module
        const notebookCells = [];
        for (let i = 0; i < notebook.cells.length; i++) {
            const cell = notebook.cells[i];
            notebookCells.push(
                <WorkflowModuleCell
                    key={cell.id}
                    cell={cell}
                    cellIndex={i+1}
                    notebook={notebook}
                    onCreateBranch={onCreateBranch}
                />
            );
        }
        // Reverse the notebook cells if flag is true
        if (reversed) {
            notebookCells.reverse();
        }
        return (
            <div>
                {notebookCells}
            </div>
        );
    }
}

export default ReadOnlyNotebook;
