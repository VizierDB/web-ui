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

import { getProperty } from '../util/Api';
import { HATEOASReferences } from '../util/HATEOAS';

/**
 * Identifier of the default branch for curation projects.
 */
export const DEFAULT_BRANCH = 'master'


// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------

/**
 * Descriptor for a project branch. Contains the basic information about the
 * branch (i.e., .id, .name, and .links).
 */
export class BranchDescriptor {
    /**
     * Initialize the descriptor from a Json object that is a BranchDescriptor
     * serialization returned by the Web API.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = getProperty(json, 'name', 'undefined');
        this.isDefault = json.isDefault;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}
