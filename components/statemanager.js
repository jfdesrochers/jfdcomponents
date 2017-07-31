'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

///////////////////////////
// StateManager
// Holds various enumerable properties with getter/setters and custom callback support

/**
 * Creates a State Manager
 * @constructor
 * @param {object} initState Object containing the initial properties to add of the format : {prop: 'defaultvalue'} or {prop: ['defaultvalue', function callback() {...}]}. Callback is called when setting a value.
 */
var StateManager = function () {
    function StateManager(initState) {
        _classCallCheck(this, StateManager);

        Object.defineProperty(this, '__props', {
            enumerable: false,
            configurable: true,
            value: {}
        });

        for (var o in initState) {
            if (Array.isArray(initState[o]) && initState[o].length === 2 && typeof initState[o][1] === 'function') {
                this.addProp(o, initState[o][0], initState[o][1]);
            } else {
                this.addProp(o, initState[o]);
            }
        }
    }

    /**
     * Invokes the property setter in a functional fashion (ex.: myState.set('myprop')('newvalue'))
     * @param {string} propname Name of the property to set.
     * @returns {function} Setter for the new value
     */


    _createClass(StateManager, [{
        key: 'set',
        value: function set(propname) {
            return function (newValue) {
                if (typeof this.__props[propname].callback === 'function') {
                    if (this.__props[propname].callback(this.__props[propname].value, newValue) === false) return;
                }
                this.__props[propname].value = newValue;
            }.bind(this);
        }

        /**
         * Adds a new property to the State Manager
         * @param {string} propname Name of the new property
         * @param {*} defaultValue Default value of the new property
         * @param {function} callback Optional callback when a new value is set. Callback receives (oldValue, newValue). Return false to cancel the value change.
         */

    }, {
        key: 'addProp',
        value: function addProp(propname, defaultValue, callback) {
            this.__props[propname] = {
                'value': defaultValue,
                'callback': callback
            };
            Object.defineProperty(this, propname, {
                get: function get() {
                    return this.__props[propname].value;
                },
                set: this.set(propname),
                enumerable: true,
                configurable: true
            });
        }

        /**
         * Removes a property from the State Manager
         * @param {string} propname Name of the property to remove
         */

    }, {
        key: 'delProp',
        value: function delProp(propname) {
            delete this.__props[propname];
            delete this[propname];
        }
    }]);

    return StateManager;
}();

module.exports = StateManager;