/**
 * Copyright (C) 2021 New York University
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
import ReactDOM from "react-dom";
import { PropTypes } from 'prop-types';


class JavascriptCellOutput extends React.Component {

    static propTypes = {
      html: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      deps: PropTypes.array.isRequired
    }

    componentDidMount() {
      const { code, deps } = this.props

      // Compute which dependencies we nee dto load
      var neededDeps = []
      for(var i in deps){
        if(!document.getElementById("import-"+deps[i])){
          console.log("Need to download: "+deps[i])
          neededDeps.push(deps[i])
        }
      }
      neededDeps = neededDeps.reverse()
      var trigger = () => {
        eval(code)
      }
      for(var i in neededDeps){
        const dep = neededDeps[i]
        const lastTrigger = trigger
        trigger = () => {
          if(!document.getElementById("import-"+dep)){
            const script = document.createElement('script')
            script.src = dep
            script.id = "import-"+dep
            script.onload = lastTrigger
            document.body.appendChild(script)
          } else {
            lastTrigger()
          }
        }
      }
      trigger()
    }

    render() {
      const { html } = this.props
      return <div className='output-content-html'
                  ref={ el => (this.div = el) }
                  dangerouslySetInnerHTML={{__html: html}}
             />
    }

}

export default JavascriptCellOutput;
