import React from "react"
import PropTypes from 'prop-types'
import LoadDatasetForm from "./LoadDatasetForm";

ModuleInputFormDecorator.propTypes = {
    components:PropTypes.object.isRequired,
    selectedCommand: PropTypes.object.isRequired,
    cssTable:PropTypes.string,
    datasets: PropTypes.array.isRequired,
    selectedDataset:PropTypes.object,
    serviceProperties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default function ModuleInputFormDecorator(props) {
    const { components,
        selectedCommand,
        cssTable,
        datasets,
        selectedDataset,
        serviceProperties,
        values,
        onChange} = props;

    const undecorated = (
        <table className={cssTable}>
            <tbody>
            {components}
            </tbody>
        </table>);

    switch (selectedCommand.id) {
        case "load": return <LoadDatasetForm
            selectedCommand={selectedCommand}
            datasets={datasets}
            selectedDataset={selectedDataset}
            serviceProperties={serviceProperties}
            values = {values}
            onChange = {onChange}
        />
        default: return undecorated
    }

}
