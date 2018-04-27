import React from 'react';
import { PropTypes } from 'prop-types'
import '../../../../css/Notebook.css';


/**
 * Display a clickable cell index for a notebook cell that contains a workflow
 * module.
 */
class CellIndex extends React.Component {
    static propTypes = {
        sequenceIndex: PropTypes.number.isRequired,
        onClick: PropTypes.func.isRequired
    }
    render() {
        const { sequenceIndex, onClick } = this.props;
        return (
            <span>[
                <a className='cell-index' onClick={onClick}>{sequenceIndex}</a>
            ]</span>
        );
    }
}

export default CellIndex;
