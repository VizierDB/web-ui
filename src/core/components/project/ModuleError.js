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
        const lines = new OutputText(module.stderr).content.lines;
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
