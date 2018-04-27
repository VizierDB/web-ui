/**
 * Selector component for datasets.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from 'semantic-ui-react'


class DatasetSelector extends React.Component {
    static propTypes = {
        datasets: PropTypes.array.isRequired,
        id: PropTypes.string.isRequired,
        isRequired: PropTypes.bool.isRequired,
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired
    }
    handleChange = (e, { value }) => {
        const { id, onChange } = this.props
        onChange(id, value)
    }
    render() {
        const { datasets, isRequired, value } = this.props
        let options = [];
        if (!isRequired) {
            // Add entry to set value to empty if not required
            options.push({
                key: '',
                text: '<none>',
                value: ''
            })
        }
        for (let i = 0; i < datasets.length; i++) {
            const dataset = datasets[i];
            options.push({
                key: dataset.name,
                text: dataset.name,
                value: dataset.name
            })
        }
        return (
            <Dropdown
                value={value}
                selection
                fluid
                scrolling
                options={options}
                onChange={this.handleChange}
            />
        )
    }
}

export default DatasetSelector
