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

import { HATEOASReferences } from '../util/HATEOAS';


/**
 * Chart view descriptor containing name and links. Chart views don't have
 * separate unique identifier at the moment. The chart name is used as the
 * unique object identifier.
 */
export class ChartDescriptor {
    constructor(name, links) {
        this.id = name;
        this.name = name;
        this.links = links;
    }
    /**
     * Initialize from a Json object that contains a WorkflowResource returned
     * by the Web API.
     */
    fromJson(json) {
        this.id = json.name;
        this.name = json.name;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}
