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
        const text = module.stdout.slice(0)
        let css = 'collapsed-output'
        if (module.stderr.length > 0) {
            css += '-error'
            for (let i = 0; i < module.stderr.length; i++) {
                text.push(module.stderr[i])
            }
        }
        return (
            <pre className={css}>
                {text.join('\n')}
            </pre>
        )
    }
}

export default ModuleOutput
