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
import ReadOnlyWorkflowCellInput from '../input/ReadOnlyWorkflowCellInput';
import CellOutputArea from '../output/CellOutputArea';
import '../../../../css/Notebook.css';


/**
 * Cell in a read-only notebook. Displays a cell input area and cell output
 * area.
 */
class ReadOnlyNotebookCell extends React.Component {
    static propTypes = {
        cell: PropTypes.object.isRequired,
        errorState: PropTypes.bool.isRequired,
        sequenceIndex: PropTypes.number,
        onCreateBranch: PropTypes.func,
        onNavigateDataset: PropTypes.func,
        onOutputSelect: PropTypes.func,
        onShowAnnotations: PropTypes.func
    }
    render() {
        const {
            cell,
            errorState,
            sequenceIndex,
            onCreateBranch,
            onNavigateDataset,
            onOutputSelect,
            onShowAnnotations
        } = this.props;
        const { module, output } = cell;
        // The input area is read-only.
        let inputArea = (
            <ReadOnlyWorkflowCellInput
                cell={cell}
                errorState={errorState}
                sequenceIndex={sequenceIndex}
                onCreateBranch={onCreateBranch}
            />
        );
        // Show an output area if the cell contains output
        let outputArea = null;
        if ((!errorState) || (module.stdout.length > 0) || (module.stderr.length > 0)) {
            outputArea = (
                <CellOutputArea
                    activeDatasetCell={cell.activeDatasetCell}
                    cell={cell}
                    output={output}
                    onOutputSelect={onOutputSelect}
                    onNavigateDataset={onNavigateDataset}
                    onShowAnnotations={onShowAnnotations}
                />
            );
        }
        let cellCss = 'notebook-cell-ro';
        if (errorState) {
            cellCss += '-error';
        }
        return (
            <div className={cellCss}>
                { inputArea }
                { outputArea }
            </div>
        )
    }
}

export default ReadOnlyNotebookCell;
