/**
 * Simple component to display the output from a workflow module. Expects a
 * string containing the output test. The text is displayed inside a pre
 * element.
 */
import React from 'react';
import PropTypes from 'prop-types'
import DatasetChart from '../plot/DatasetChart'
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
        let content = null
        let css = 'collapsed-output'
        // There are currently two options for elements in stdout: (1) a list
        // of plain text lines or a chart view
        let isChartView = false
        if (module.stdout.length === 1) {
            isChartView = module.stdout[0].type === 'chart/view'
        }
        if (isChartView) {
            // At this point it is assumed that the chart data is contained in
            // the .result property of the output object.
            if (module.stdout[0].result) {
                const data = module.stdout[0].result
                content = <DatasetChart rows={data.rows} schema={data.schema} />
            }
        } else {
            content = []
            let lines = []
            // Assumes that all elements in the output are plain text lines. Any
            // other output is filtered out.
            for (let i = 0; i < module.stdout.length; i++) {
                const out = module.stdout[i]
                if (out.type === 'text/plain') {
                    lines.push(out.data)
                }
            }
            if (lines.length > 0) {
                content.push(
                    <pre key={content.length} className='plain-text'>
                        {lines.join('\n')}
                    </pre>
                )
            }
            if (module.stderr.length > 0) {
                // Error messages are expected to be of type text/plain only at
                // this point.
                lines = []
                css += '-error'
                for (let i = 0; i < module.stderr.length; i++) {
                    lines.push(module.stderr[i].data)
                }
                content.push(
                    <pre key={content.length} className='error-text'>
                        {lines.join('\n')}
                    </pre>
                )
            }
        }
        return (
            <div className={css}>
                { content }
            </div>
        )
    }
}

export default ModuleOutput
