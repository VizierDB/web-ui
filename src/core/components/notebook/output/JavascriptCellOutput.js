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
      deps: PropTypes.array.isRequired,
      css: PropTypes.array,
    }

    componentDidMount() {
      const { code, deps, css } = this.props

      // Compute which dependencies we nee dto load
      var neededDeps = []
      for(var i in deps){
        if(!document.getElementById("import-"+deps[i])){
          console.log("Need to download javascript: "+deps[i])
          neededDeps.push(deps[i])
        }
      }
      if(css){
        for(var i in css){
          if(!document.getElementById("import-"+css[i])){
            console.log("Need to download css: "+css[i])
            if(!document.getElementById("import-"+css[i])){
              const stylesheet = document.createElement('link')
              stylesheet.rel = "stylesheet"
              stylesheet.href = css[i]
              stylesheet.id = "import-"+css[i]
              document.body.appendChild(stylesheet)
            }
          }
        }
      }
      var trigger = () => {
        try {
          eval(code)
        } catch(error) {
          console.log("Error running javascript: "+error)
          console.log("---- code ----")
          console.log(code)
        }
      }
      neededDeps = neededDeps.reverse()
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
