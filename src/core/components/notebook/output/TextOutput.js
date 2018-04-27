import React from 'react';
import PropTypes from 'prop-types'
import '../../../../css/Notebook.css'

/**
 * Simple component to display the output from a workflow module. Expects a
 * list of strings containing the output test. The text is displayed inside a
 * pre element. If the isError flag is true  the output is formated accordingly.
 */
class TextOutput extends React.Component {
    static propTypes = {
        isError: PropTypes.bool.isRequired,
        lines: PropTypes.array.isRequired
    }
    /**
     * Show output in pre-element. Depending on the hasError flag the element
     * css class is set.
     */
    render() {
        const { isError, lines } = this.props;
        // Set formating based on isError flag
        let css = 'collapsed-output';
        if (isError) {
            css += '-error';
        }
        let content = null;
        if (lines.length > 0) {
            content = (
                <pre className='plain-text'>
                    {lines.join('\n')}
                </pre>
            );
        }
        return (
            <div className={css}>
                { content }
            </div>
        )
    }
}

export default TextOutput
