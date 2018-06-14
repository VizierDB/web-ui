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
 * Manipulate timestamps for Vizier-DB resources.
 */
var moment = require('moment-timezone');
export const utc2LocalTime = (timestamp) => {
    const localDate = moment.tz(timestamp, "UTC");
    return localDate.tz(moment.tz.guess()).format('DD-MMM-YYYY HH:mm:ss');
}
