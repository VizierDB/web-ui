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
import { Icon } from 'semantic-ui-react';
import '../../../css/DatasetError.css'

/**
 * Display a list of dataset errors detected by mimir 
 */
class DatasetReason extends React.Component {
    static propTypes = {
        reason: PropTypes.object.isRequired
    }
    
    constructor(props) {
        super(props);
        this.state = {expanded: false }
    }
    
    handleExpand = () => {
    	const { expanded } = this.state;
    	this.setState({expanded:!expanded})
    }
    
    buildReasonElement = (elkey, elvalue) => {
    	if(Array.isArray(elvalue)){
    		let elements = []
    		for(let i = 0; i<elvalue.length; i++){
    			elements.push(this.buildReasonElement(elkey+'.'+i,elvalue[i]))
    		}
    		return elements;
    	}
    	else if(elvalue instanceof Object){
    		let elements = []
    		for (let [ek, ev] of Object.entries(elvalue)) {
    			elements.push(this.buildReasonElement(elkey+'.'+ek,ev))
    		}
    		return elements;
    	}
    	else{
    		return (<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>{elkey}: </h4></td><td>{elvalue}</td></div>);
    	}
    }
    /**
     * 
     */
    render() {
    	const { reason } = this.props;
        const { id, key, value } = reason;
        const { expanded } = this.state;
        const reasonElements = this.buildReasonElement('reason',value);
        reasonElements.unshift(<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>id: </h4></td><td>{id}</td></div>)
        reasonElements.unshift(<div className='dataset-reason-element'><td className='dataset-reason-key'><h4>key: </h4></td><td>{key}</td></div>)
        
        let tableContent = null
        
        if(expanded){
        	tableContent = (<table>{reasonElements}</table>)
        }
        
        return (
            <div className='dataset-reason' onClick={this.handleExpand}>
                <table><tr><td className='dataset-reason-icon'><Icon name='warning sign' size='large' color='yellow'/></td><td className='dataset-reason-english'>{value.english}</td></tr></table>
                {tableContent}
            </div>
        );
    }
}

export default DatasetReason;

