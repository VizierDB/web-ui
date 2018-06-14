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

/**
 * Create a dictionary of HATEOAS references from an array of (rel,href)-pairs.
 */
export class HATEOASReferences {
    /**
     * Expects an array of HATEOAS reference objects as returned by the API.
     * Constructs an object that has one property per rel key in the reference
     * list.
     */
    constructor(links) {
        for (let i = 0; i < links.length; i++) {
            const ref = links[i]
            this[ref.rel] = ref.href
        }
    }
}
