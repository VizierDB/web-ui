/**
 * Collection of functions that sort arrays of various objects.
 */

/**
 * Sort elements in a list by their .name property.
 */
export const sortByName = (objects) => (
    objects.sort(function(o1, o2) {return o1.name.localeCompare(o2.name)})
);
