/**
 * Copyright (C) 2018 New York University
 *                    University at Buffalo,
 *                    Illinois Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Form, Button } from 'semantic-ui-react';
import '../../../css/DatasetCaveat.css'

/**
 * Display a list of dataset errors detected by mimir
 */
class DatasetRepair extends React.Component {
    static propTypes = {
        reason: PropTypes.object.isRequired,
        onRepairError: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {expanded: false, repairValue: '' }
    }

    handleExpand = () => {
    	const { expanded } = this.state;
    	this.setState({expanded:!expanded})
    }

    handleRepairError = (acknowledge) => (event) => {
    	const { onRepairError, reason } = this.props;
    	const { repairValue } = this.state;
    	onRepairError(reason.value, repairValue, acknowledge);
    }

    handleRepairChange = (e, { value }) => {
    	this.setState({repairValue:value})
    }

    buildRepairElement = (elkey, elvalue) => {
    	const { repairValue } = this.state;
    	if(elkey === 'reason' && elvalue.repair.selector === 'list'){
    		const repairValues = elvalue.repair.values
    		let elements = []
    		if(Array.isArray(repairValues )){
    			for(let i = 0; i<repairValues.length; i++){
        			elements.push({
                        key: ''+repairValues[i].choice,
                        text: ''+repairValues[i].choice,
                        value: ''+repairValues[i].choice
                    })
        		}
    		}
    		return ( <Dropdown
			            value={repairValue}
			            selection
			            fluid
			            scrolling
			            options={elements}
			            onChange={this.handleRepairChange}
			        /> );
    	}
    	else if(elkey === 'reason' && elvalue.repair.selector === 'by_type'){
        	return ( <Form.Input
	                    placeholder={'repair'}
			            fluid
			            value={repairValue}
			            onChange={this.handleRepairChange}
			        /> );
    	}
    }
    /**
     *
     */
    render() {
    	const { reason } = this.props;
        const { value } = reason;
        const reasonElements = this.buildRepairElement('reason',value);


        let repairErrorButton = null
        if(value.repair.selector === 'list' || value.repair.selector === 'by_type'){
        	repairErrorButton = (<Button icon='tasks' positive onClick={this.handleRepairError(false)}>Repair</Button>)
	    }
	    let acknowledgeButton = (<Button icon='check' positive onClick={this.handleRepairError(true)}>Acknowledge</Button>)

        return (
        	<div className='dataset-reason-element' >
                <table><tr>
                	<td className='dataset-reason-icon'>
                		<h4>Repair:</h4>
                	</td>
                	<td className='dataset-reason-english'><div className='reason-repair'>{reasonElements}</div></td>
                	<td className='dataset-reason-goto'><div>{repairErrorButton}</div></td>
                	<td className='dataset-reason-goto'><div>{acknowledgeButton}</div></td>
                </tr></table>
            </div>
        );
    }
}

export default DatasetRepair;
