/**
 * Selector component for datasets.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


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
        let options = []
        for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i];
            options.push({
                key: dataset.name,
                text: dataset.name,
                value: dataset.name
            })
        }
        return (
            <tr>
                <td className='form-label'>{label}</td>
                <td className='form-control'>
                    <Dropdown
                        text={value}
                        selection
                        fluid
                        scrolling
                        options={options}
                        onChange={this.handleChange}
                    />
                </td>
            </tr>
        )
    }
}

export default DatasetSelector
