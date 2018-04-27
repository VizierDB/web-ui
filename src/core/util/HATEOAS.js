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
