/**
 * Copyright (C) 2020 New York University
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
import '../../../css/TableOfContents.css';

/**
 * Dropdown menu for a notebook cell. Displays two icons with dropdown menus.
 * The first menu contains operations that are available for the cell. The
 * second menu allows to change the content that is being displayed in the cell
 * output area.
 */
class TableOfContents extends React.Component {
  static propTypes = {
    contents: PropTypes.array.isRequired,
  }
  state = {
    active: false
  }

  toggleState = () => { 
    this.setState({active: !this.state.active});
  }

  render() {
    const {
      contents
    } = this.props;
    const {
      active
    } = this.state

    const tocElements = []
    for(let element of contents){
      tocElements.push(
        <a className="element" href={"#cell-"+(element.linkToIdx+1)}>{ element.title }</a>
      )
    }

    var activityClass = "inactive";
    if(active){ activityClass = "active"; };

    return (
      <div className={ "toc " + activityClass }>
        <a className="toctoggle" onClick={this.toggleState}>≡</a>
        <div className="tocbody">
          {tocElements}
        </div>
      </div>
    )
  }
}

export default TableOfContents;
