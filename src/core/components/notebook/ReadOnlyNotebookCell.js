import React from 'react';
import { PropTypes } from 'prop-types';
import ReadOnlyWorkflowCellInput from './input/ReadOnlyWorkflowCellInput';
import CellOutputArea from './output/CellOutputArea';
import '../../../css/Notebook.css';


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
        onOutputSelect: PropTypes.func
    }
    render() {
        const {
            cell,
            errorState,
            sequenceIndex,
            onCreateBranch,
            onNavigateDataset,
            onOutputSelect
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
                    module={module}
                    output={output}
                    onOutputSelect={onOutputSelect}
                    onNavigateDataset={onNavigateDataset}
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
