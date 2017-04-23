///////////////////////////
// StateManager
// Holds various enumerable properties with getter/setters and custom callback support

/**
 * Creates a State Manager
 * @constructor
 * @param {object} initState Object containing the initial properties to add of the format : {prop: 'defaultvalue'} or {prop: ['defaultvalue', function callback() {...}]}. Callback is called when setting a value.
 */
const StateManager = function (initState) {
    let state = {}
    state.prototype = {
        __props: {},
        /**
         * Invokes the property setter in a functional fashion (ex.: myState.set('myprop')('newvalue'))
         * @param {string} propname Name of the property to set.
         * @returns {function} Setter for the new value
         */
        set: function (propname) {
            return function (newValue) {
                if (typeof this.__props[propname].callback === 'function') {
                    if (this.__props[propname].callback(this.__props[propname].value, newValue) === false) return
                    this.__props[propname].value = newValue
                }
            }.bind(this)
        },
        /**
         * Adds a new property to the State Manager
         * @param {string} propname Name of the new property
         * @param {*} defaultValue Default value of the new property
         * @param {function} callback Optional callback when a new value is set. Callback receives (oldValue, newValue). Return false to cancel the value change.
         */
        addProp: function (propname, defaultValue, callback) {
            this.__props[propname].value = defaultValue
            this.__props[propname].callback = callback
            Object.defineProperty(this, propname, {
                get: function () {
                    return this.__props[propname].value
                },
                set: this.set(propname),
                enumerable: true,
                configurable: true
            })
        },
        /**
         * Removes a property from the State Manager
         * @param {string} propname Name of the property to remove
         */
        delProp: function (propname) {
            delete this.__props[propname]
            delete this[propname]
        }
    }

    for (let o in initState) {
        if (Array.isArray(initState[o]) && initState[o].length === 2 && typeof initState[o][1] === 'function') {
            state.addProp(o, initState[o][0], initState[o][1])
        } else {
            state.addProp(o, initState[o])
        }
    }

    return state
}

module.exports = StateManager