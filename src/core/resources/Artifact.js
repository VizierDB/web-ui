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
 * Artifact descriptor containing artifact identifier, type, and name.
 */
export class ArtifactDescriptor {
    constructor(id, name, mime_type, artifact_type, links) {
        this.id = id;
        this.name = name;
        this.artifact_type = artifact_type;
        this.mime_type = mime_type;
        this.links = links;
    }
    /**
     * Initialize from a Json object that contains a dataset descriptor returned
     * by the Web API. Note that the name and column information are optional.
     */
    fromJson(json) {
        this.id = json.id;
        this.name = json.name
        this.artifact_type = json.category;
        this.mime_type = json.objType;
        this.links = new HATEOASReferences(json.links);
        return this;
    }
}
