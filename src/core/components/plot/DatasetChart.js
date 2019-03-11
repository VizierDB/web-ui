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
import Plots from './Plots';
import '../../../css/Chart.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button, Icon } from 'semantic-ui-react';
import '../../../css/App.css';
import '../../../css/Chart.css';
import '../../../css/Notebook.css';


/*
 * Plot a dataset chart for given data.
 */

class DatasetChart extends React.Component {
    /*
     * The format of the given dataset object is as follows:
     *
     * "series": {
     *   "label": "string",
     *   "data": [0]
     *  },
     * "xAxis": {
     *   "data": [0]
     * },
     * "chart": {
     *   "type": "string",
     *   "grouped": true,
     * }
 }
     */

    static propTypes = {
        dataset: PropTypes.object.isRequired,
        identifier: PropTypes.string.isRequired,
        onSelectCell: PropTypes.func
    }

    /**
     * Export chart as a PDF. Generating a PDF file from react component which contains the chart.
     */
    generatePDF = () => {
        const { identifier } = this.props
        const plotName = 'plot_' + identifier
        const input = document.getElementById(plotName);
        html2canvas(input)
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'in'
            });
            pdf.addImage(imgData, 'JPEG', 0, 0);
            pdf.save(plotName + ".pdf");
          })
        ;
    }
    render() {
        const { dataset, identifier, onSelectCell } = this.props
        const plotName = 'plot_' + identifier
        if (dataset !== undefined) {
            return (
                <div>
                    <div className='output-header' onClick={onSelectCell}>
                        <span className='header-name'>{identifier}</span>
                    </div>
                    <div className='plot'>
                        <Plots
                            key={identifier}
                            identifier={plotName}
                            dataset={dataset}
                            onSelectCell={onSelectCell}
                        />
                    </div>
                    <div className='chart-download-btn'>
                        <Button size='small' color='green' onClick={this.generatePDF}>
                            <Icon name='download' />
                            Download Chart
                        </Button>
                    </div>
                </div>
            );
        } else {
            return null
        }
    }
}

export default DatasetChart
