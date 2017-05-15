const m = require('mithril')


/**
 * Holds the values and validation functions of Validating form fields
 * @class
 * @property {object} fields Contains all the added fields in the form fields[fieldname] = {validate, reset, value}
 * @method allValid Calls the validate on every form elements and return true if all are valid.
 * @method allReset Resets all the form elements to default validation state. Does not clear the value.
 * @method allValues Returns an object containing all the values of the form elements in the form {fieldname: fieldvalue}
 */
const ValidationManager = function () {
    return {
        fields: {},
        allValid: function () {
            let valid = true
            for (let k in this.fields) {
                if (!this.fields[k].validate()) {
                    valid = false
                }
            }
            return valid
        },
        allReset: function () {
            for (let k in this.fields) {
                this.fields[k].reset()
            }
        },
        allValues: function () {
            let vals = {}
            for (let k in this.fields) {
                vals[k] = this.fields[k].value
            }
        }
    }
}

module.exports.ValidationManager = ValidationManager

/**
 * ValidatingInput
 * usage: m(ValidatingInput, {options: {options})
 * 
 * @param options Object containing form field configuration
 * @param options.name input id
 * @param options.type input type
 * @param options.label input label
 * @param options.validPattern RegEx indicating the valid pattern
 * @param options.onvalidate(text) Function called during validation. text contains the field value. Must return true|false if it passes validation or not.
 * @param options.onchange(text) Function called if selection changes. text contains new the new field value.
 * @param options.stdMessage Message to be displayed in the default state (e.g. help text)
 * @param options.errMessage Message to be displayed in case of failed validation
 * @param options.showValid indicates whether or not to show feedback if the field is valid (default: false)
 * @param {ValidationManager} options.fields pass a ValidationManager, will add an object containing methods validate, reset and the fieldValue to a key named after the fieldname
 * @param fields.validate() starts validation using the first available method in that order:
    1. If you explicitely specify a validation state and message as parameters, they will be used as is
    2. If onvalidate is assigned, will use the provided function to validate.
    3. Else, will use validPattern to validate.
 * @param fields.reset() resets the validation state to default
 * @param fields.value holds the field value
 */
const ValidatingInput = {}

ValidatingInput.oninit = function (vnode) {
    const options = vnode.attrs.options
    options.showValid = options.showValid || false
    options.fields.fields[options.name] = {value: ''}
    options.fields.fields[options.name].reset = () => {
        this.hasValidation = false
        this.isValid = false
        this.validMessage = options.stdMessage || ''
        m.redraw()
    }
    options.fields.fields[options.name].validate = (valid, message) => {
        if ((valid !== undefined) && (message !== undefined)) {
            this.isValid = valid
            this.validMessage = this.isValid ? (options.showValid ? '' : options.stdMessage || '') : message || ''
        } else if (typeof options.onvalidate === 'function') {
            this.isValid = options.onvalidate(options.fields.fields[options.name].value)
            this.validMessage = this.isValid ? (options.showValid ? '' : options.stdMessage || '') : options.errMessage || ''
        } else {
            let pattern = options.validPattern || /.*/gi
            this.isValid = options.fields.fields[options.name].value.match(pattern)
            this.validMessage = this.isValid ? (options.showValid ? '' : options.stdMessage || '') : options.errMessage || ''
        }
        this.hasValidation =  this.isValid ? options.showValid : true
        m.redraw()
        return this.isValid
    }
    this.hasValidation = false
    this.isValid = false
    this.validMessage = options.stdMessage || ''
    this.fieldValue = options.fieldValue
    this.fieldChange = (e) => {
        if (typeof options.onchange === 'function') options.onchange(e.target.value)
        options.fields.fields[options.name].value = e.target.value
    }
}

ValidatingInput.view = function (vnode) {
    const options = vnode.attrs.options
    return m('div.form-group' + (this.hasValidation ? '.has-feedback' + (this.isValid ? '.has-success' : '.has-error') : ''), [
                m('label.control-label', {for: options.name}, options.label),
                m('input.form-control#' + options.name, {type: options.type, onchange: this.fieldChange, value: options.fields.fields[options.name].value}),
                this.hasValidation ? m('span.glyphicon.form-control-feedback' + (this.isValid ? '.glyphicon-ok' : '.glyphicon-remove')) : '',
                this.validMessage !== '' ? m('span.help-block', this.validMessage) : ''
            ])
}

module.exports.ValidatingInput = ValidatingInput

/**
 * ValidatingSelect
 * usage: m(ValidatingSelect, {options: {options})
 * 
 * @param options Object containing form field configuration
 * @param options.name input id
 * @param options.label input label
 * @param {Array} options.choices array containing [value, label] pairs for the select control choices
 * @param options.onvalidate(text) Mandatory. Function called during validation. text contains the field value. Must return true|false if it passes validation or not.
 * @param options.onchange(text) Function called if selection changes. text contains new the new field value.
 * @param options.stdMessage Message to be displayed in the default state (e.g. help text)
 * @param options.errMessage Message to be displayed in case of failed validation
 * @param options.showValid indicates whether or not to show feedback if the field is valid (default: false)
 * @param {ValidationManager} options.fields pass a ValidationManager, will add an object containing methods validate, reset and the fieldValue to a key named after the fieldname
 * @param fields.validate() starts validation. you must have provided onvalidate function for it to work.
 * @param fields.reset() resets the validation state to default
 * @param fields.value holds the field value
 */
const ValidatingSelect = {}

ValidatingSelect.oninit = function (vnode) {
    const options = vnode.attrs.options
    options.showValid = options.showValid || false
    options.default = options.default === undefined ? -1 : options.default
    options.fields[options.name] = {value: ''}
    options.fields[options.name].reset = () => {
        this.hasValidation = false
        this.isValid = false
        this.validMessage = options.stdMessage || ''
        m.redraw()
    }
    options.fields[options.name].validate = (valid, message) => {
        if ((valid !== undefined) && (message !== undefined)) {
            this.isValid = valid
            this.validMessage = this.isValid ? (options.showValid ? '' : options.stdMessage || '') : message || ''
        } else if (typeof options.onvalidate === 'function') {
            this.isValid = options.onvalidate(options.fields.fields[options.name].value)
            this.validMessage = this.isValid ? (options.showValid ? '' : options.stdMessage || '') : options.errMessage || ''
        }
        this.hasValidation =  this.isValid ? options.showValid : true
        m.redraw()
        return this.isValid
    }
    this.hasValidation = false
    this.isValid = false
    this.validMessage = options.stdMessage || ''
    this.fieldValue = options.fieldValue
    this.fieldChange = (e) => {
        if (typeof options.onchange === 'function') options.onchange(e.target.value)
        options.fields.fields[options.name].value = e.target.value
    }
}

ValidatingSelect.view = function (vnode) {
    const options = vnode.attrs.options
    return m('div.form-group' + (this.hasValidation ? '.has-feedback' + (this.isValid ? '.has-success' : '.has-error') : ''), [
                m('label.control-label', {for: options.name}, options.label),
                m('select.form-control#' + options.name, {onchange: this.fieldChange}, 
                    options.choices.map((item) => {
                        return m('option', {value: item[0], selected: (item[0] === options.fields.fields[options.name].value)}, item[1])
                    })
                ),
                this.validMessage !== '' ? m('span.help-block', this.validMessage) : ''
            ])
}

module.exports.ValidatingSelect = ValidatingSelect