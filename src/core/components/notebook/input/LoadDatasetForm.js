import React, {useState, useEffect} from "react"
import {Tab} from "semantic-ui-react";
import ModuleFormControl from "./form/ModuleFormControl";
import {DT_CODE, DT_FILE_ID} from "../../../resources/Engine";

export default function LoadDatasetForm(props) {
    const {selectedCommand, datasets, selectedDataset, serviceProperties, values, onChange} = props

    const initialState = {
        "name":null,
        "file":{"fileid":null,"filename":null,"url":null},
        "loadFormat":"csv",
        "loadInferTypes":false,
        "loadDetectHeaders":false,
        "loadDataSourceErrors":false,
        "loadOptions":[]
    }

    const [localSourceState, setLocalSourceState] = useState(initialState);
    const [remoteSourceState, setRemoteSourceState] = useState(initialState);
    const [activeIndex,setActiveIndex] = useState(0)

    const state = [localSourceState, remoteSourceState]
    const setState = [setLocalSourceState, setRemoteSourceState]

    // load cell state values into the form when reading
    useEffect(()=> {
        if(values["file"]["url"]===null){
            setState[0](values)
            setActiveIndex(0)
        }else{
            setState[1](values)
            setActiveIndex(1)
        }
    },[])

    const handleValueChange = (id, value) => {
        setState[activeIndex]({
            ...state[activeIndex],
            [id]:value
        })
        onChange(id,value)
    }

    //
    const handleTabChange = (e, { activeIndex }) => {
        setActiveIndex(activeIndex)
        //completely replace parent state
        for (let id in state[activeIndex]){
            onChange(id, state[activeIndex][id])
        }
    }

    const panes = [
        { menuItem: 'FROM LOCAL MACHINE', render: ()=> <Tab.Pane>{
            <LoadFormPane
                datasets = {datasets}
                selectedDataset={selectedDataset}
                serviceProperties={serviceProperties}
                selectedCommand={selectedCommand}
                tabState={localSourceState}
                isUrlPane={false}
                onChange={handleValueChange}
            />}</Tab.Pane>},
        { menuItem: 'FROM THE INTERNET', render: ()=> <Tab.Pane>{
                <LoadFormPane
                    datasets = {datasets}
                    selectedDataset={selectedDataset}
                    serviceProperties={serviceProperties}
                    selectedCommand={selectedCommand}
                    tabState={remoteSourceState}
                    isUrlPane={true}
                    onChange={handleValueChange}
                />}</Tab.Pane>}
    ]

    return <Tab
        activeIndex={activeIndex}
        onTabChange={handleTabChange}
        panes={panes} />

}

const LoadFormPane = (props) => {
    const {datasets,
        selectedDataset,
        serviceProperties,
        selectedCommand,
        tabState,
        isUrlPane,
        onChange} = props

    let cssTable = 'form-table wide';
    let components = [];

    for (let i = 0; i < selectedCommand.parameters.length; i++) {
        let para = selectedCommand.parameters[i];

        // create a url selector instead of a file selector
        if (isUrlPane===true && para.datatype=== DT_FILE_ID){
            para = {"datatype":"url","hidden":false,"id":"file","index":0,"name":"URL","required":true}
        }
        if ((para.parent == null) && (para.hidden !== true) && (para.datatype !== DT_CODE)) {
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
                            value={tabState[para.id]}
                            onChange={onChange}
                        />
                    </td>
                </tr>
            );
        }
    }

    return <table className={cssTable}><tbody>{components}</tbody></table>
}
