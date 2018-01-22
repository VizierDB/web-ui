/**
 * Selector component for datasets.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'semantic-ui-react'


class DatasetSelector extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        handler: PropTypes.object.isRequired,
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        value: PropTypes.string
    }
    handleChange = (e, { value }) => {
        const { id, handler } = this.props
        handler.setFormValue(id, value)
    }
    render() {
        const { datasets, label, value } = this.props
        let datasetOptions = []
        for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i];
            datasetOptions.push(
                <Form.Radio
                    name={'dataset'}
                    key={dataset.name}
                    label={dataset.name}
                    value={dataset.name}
                    checked={value === dataset.name}
                    onChange={this.handleChange}
                />);
        }
        return (
            <Form.Group inline>
                <Form.Field width={1}><label>{label}</label></Form.Field>
                { datasetOptions }
            </Form.Group>
        )
    }
}

export default DatasetSelector
