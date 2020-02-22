import React from "react"
import { Tab } from 'semantic-ui-react'
import _ from 'lodash'
import {DT_FILE_ID, DT_CODE} from "../../../resources/Engine";
import ModuleFormControl from "./form/ModuleFormControl";
import PropTypes from 'prop-types'

ModuleInputFormDecorator.PropTypes = {
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
        case "load": return decorateLoadDataset(components, selectedCommand)
        default: return undecorated
    }

    function decorateLoadDataset(components, selectedCommand){
        // todo: reorg - via json definition / add advanced options
        // todo: create Url pane via the definitions json
        const UrlUploadPane = (selectedCommand) => {

            let cssTable = 'form-table wide';
            let components = [];

            const para = {"datatype":"url","hidden":false,"id":"file","index":0,"name":"URL","required":true}
            components.push(
                <tr key={para.id}>
                    <td className='form-label'>{para.name}</td>
                    <td className='form-control'>
                        <ModuleFormControl
                            key={para.id}
                            controlSpec={para}
                            datasets={datasets}
                            selectedDataset={selectedDataset}
                            serviceProperties={serviceProperties}
                            value={values[para.id]}
                            onChange={onChange}
                        />
                    </td>
                </tr>
            );

            for (let i = 0; i < selectedCommand.parameters.length; i++) {
                const para = selectedCommand.parameters[i];
                // Skip elements that are part of a group, hidden or are of type
                // code
                if ((para.parent == null) && (para.hidden !== true) && (para.datatype !== DT_CODE) && (para.datatype !== DT_FILE_ID)) {
                    components.push(
                        <tr key={para.id}>
                            <td className='form-label'>{para.name}</td>
                            <td className='form-control'>
                                <ModuleFormControl
                                    key={para.id}
                                    controlSpec={para}
                                    datasets={datasets}
                                    selectedDataset={selectedDataset}
                                    serviceProperties={serviceProperties}
                                    value={values[para.id]}
                                    onChange={onChange}
                                />
                            </td>
                        </tr>
                    );
                }
            }

            return <table className={cssTable}><tbody>{components}</tbody></table>
        }

        const output = <table className='form-table wide'><tbody>{components}</tbody></table>
        const panes = [
            { menuItem: 'FROM LOCAL MACHINE', render: ()=> <Tab.Pane>{output}</Tab.Pane>},
            { menuItem: 'FROM THE INTERNET', render: () => <Tab.Pane>{UrlUploadPane(selectedCommand)}</Tab.Pane>},
        ]

        return <Tab panes={panes} />
    }

}
