/**
 * Simple component to display the output from a workflow module. Expects a
 * string containing the output test. The text is displayed inside a pre
 * element.
 */
import React from 'react';
import PropTypes from 'prop-types'
import '../../../css/Notebook.css'


class ModuleOutput extends React.Component {
    static propTypes = {
        module: PropTypes.object.isRequired
    }
    /**
     * Show output in pre-element. Depending on the hasError flag the element
     * css class is set.
     */
    render() {
        const { module } = this.props
        const outputs = []
        let lines = []
        for (let i = 0; i < module.stdout.length; i++) {
            lines.push(module.stdout[i].data)
        }
        outputs.push(
            <pre key={outputs.length} className='plain-text'>
                {lines.join('\n')}
            </pre>
        )
        let css = 'collapsed-output'
        if (module.stderr.length > 0) {
            lines = []
            css += '-error'
            for (let i = 0; i < module.stderr.length; i++) {
                lines.push(module.stderr[i].data)
            }
            outputs.push(
                <pre key={outputs.length} className='error-text'>
                    {lines.join('\n')}
                </pre>
            )
        }
        return (
            <div className={css}>
                { outputs }
            </div>
        )
    }
}

export default ModuleOutput
