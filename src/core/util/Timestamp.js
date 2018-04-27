/**
 * Manipulate timestamps for Vizier-DB resources.
 */
var moment = require('moment-timezone');
export const utc2LocalTime = (timestamp) => {
    const localDate = moment.tz(timestamp, "UTC");
    return localDate.tz(moment.tz.guess()).format('DD-MMM-YYYY HH:mm:ss');
}
