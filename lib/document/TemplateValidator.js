/*global module, require, console */

var Class = require('../class/class'),
    validate = require('validator').check,
    TemplateValidator;
    

TemplateValidator = Class.extend({
    template: null,
    errors: null,
    
    init: function (template) {
        this.template = template;
    },
    
    getErrors: function () {
        return this.errors;
    },
    
    /*
            url: {type: 'uri', required: true},
            email: {type: 'email', required: true},
            selectors: {
                type: 'array',
                items: [
                    {
                        prompt: 'Property',
                        data: {
                            property: {type: 'text', maxLen: 255},
                            currentValue: {type: 'text', readOnly: true}
                        }
                    },
                    {
                        prompt: 'Custom Selector',
                        data: {
                            name: {type: 'text', maxLen: 255, prompt: 'Name'},
                            selector: {type: 'text', maxLen: 255, prompt: 'Selector'},
                            currentValue: {type: 'text', readOnly: true}
                        }
                    },
                    {
                        prompt: 'Regular Expression',
                        data: {
                            name: {type: 'text', maxLen: 255, prompt: 'Name'},
                            regex: {type: 'regex', maxLen: 255, prompt: 'Regular Expression'},
                            currentValue: {type: 'text', readOnly: true}
                        }
                    }
                ]
            },
            expires: {type: 'datetime', readOnly: true}
     */
    
    
    validate: function (userData) {
        this.errors = [];
        // Make sure it only contains the data child
//        console.log('user data:');
//        console.log(userData);
//        console.log('template data:');
//        console.log(this.template.data);
        this.validateContains(userData, {
            data: 'object'
        });
        
        this.validateData(userData === null ? {} : (userData.data || {}), this.template.data || {});
        
        return this.errors.length === 0;
    },
    
    validateData: function (userData, templateData) {
        var field, templateField, required, readOnly;
        
        //console.log(userData, templateData);
        
        // Go through every field in the data and validate each field
        for (field in userData) {
            if (userData.hasOwnProperty(field)) {
                if (!templateData.hasOwnProperty(field)) {
                    this.errors.push({
                        prompt: 'Unexpected data field "' + field + '"',
                        inlinePrompt: 'Invalid',
                        field: field
                    });
                }
                else {
                    // Validate the field
                    this.validateField(field, userData[field], templateData[field]);
                }
            }
        }
        
        // Then go through each template field and make sure the required fields exist
        for (field in templateData) {
            if (templateData.hasOwnProperty(field)) {
                templateField = templateData[field];
                
                required = templateField.hasOwnProperty('required') ? templateField.required : false;
                
                if (required && userData.hasOwnProperty(field) === false) {
                    this.errors.push({
                        prompt: 'Missing required field "' + field + '"',
                        inlinePrompt: 'Required',
                        field: field
                    });
                }
                else {
                    readOnly = templateField.hasOwnProperty('readOnly') ? templateField.readOnly : false;
                    if (readOnly && userData.hasOwnProperty(field)) {
                        this.errors.push({
                            prompt: 'Not allowed to specify field "' + field + '" as it is read only',
                            inlinePompt: 'Read only',
                            field: field
                        });
                    }
                }
            }
        }
        
    },

    getFieldProperties: function (templateData) {
        var attribute,
            properties;
        
        properties = {
            required: false,
            readOnly: false,
            minLen: 0,
            maxLen: null, // No max len
            min: null, // No min
            max: null, // No max
            decimals: null, // No decimal precision
            prompt: null, // No prompt
            type: 'string',
            options: [], // Default to no choice options when type is choice
            items: [], // Default to no items when type is array
            query: null,
            data: null
        };
        
        // No mix in the template values
        for (attribute in templateData) {
            if (templateData.hasOwnProperty(attribute)) {
                properties[attribute] = templateData[attribute];
            }
        }
        
        return properties;
    },

    getDecimals: function (value) {
        // Convert to string
        var parts = new String(value).toString().split('.');
        if (parts.length === 1) {
            return 0;
        }
        else {
            return parts[1].length;
        }
    },
    
    isUrl: function (s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return regexp.test(s);
    },

    isValidChoice: function (value, options) {
        var i, iLen;
        
        if (options === null && value !== null) {
            return false; // No options specified, so it should not have a value set
        }
        
        for (i = 0, iLen = options.length; i < iLen; i += 1) {
            //console.log(value + '(' + typeof(value) + ') === ' + options[i].value + '(' + typeof(options[i].value));
            if (options[i].value === value) {
                return true;
            }
        }
        
        return false;
    },

    validateField: function (fieldName, fieldData, templateData) {
        var props, value, validateValue = true, i, item;
        
        //console.log('Validating ' + fieldName);
        
        props = this.getFieldProperties(templateData);
        value = fieldData === null ? null : (fieldData.hasOwnProperty('value') ? fieldData.value : null);
        
        //console.log('Value: ' + value);
        
        switch (props.type) {
            case 'text':
            case 'password':
                if (value !== null && typeof (value) !== 'string') {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a string',
                        inlinePrompt: 'Not a string',
                        field: fieldName
                    });
                }
                break;
            case 'email':
                this.validateContains(fieldData, {value: 'string'});
                try {
                    validate(value).len(6, 64).isEmail();
                }
                catch (ex) {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" is not a valid email address',
                        inlinePrompt: 'Invalid',
                        field: fieldName
                    });
                }
                break;
            case 'boolean':
                if (value !== null && typeof(value) !== 'boolean') {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a boolean',
                        inlinePrompt: 'Invalid',
                        field: fieldName
                    });
                }
                break;
            case 'number':
                if (value !== null && typeof(value) !== 'number') {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a number',
                        inlinePrompt: 'Invalid',
                        field: fieldName
                    });
                }
                else {
                    // Validate the number of decimals
                    if (value !== null && props.decimals !== null && this.getDecimals(value) > props.decimals) {
                        this.errors.push({
                            prompt: 'Field "' + fieldName + '" must have a maximum of ' + props.decimals + ' decimal place' + (props.decimals === 1 ? '' : 's'),
                            inlinePrompt: 'Too many decimals',
                            field: fieldName
                        });
                    }
                }
                break;
            case 'url':
                if (value !== null && typeof(value) !== 'string') {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a string',
                        inlinePrompt: 'Not a string',
                        field: fieldName
                    });
                }
                else {
                    // Validate it is a url
                    if (value !== null && this.isUrl(value) === false) {
                        this.errors.push({
                            prompt: 'Field "' + fieldName + '" must be a valid URL',
                            inlinePrompt: 'Invalid',
                            field: fieldName
                        });
                    }
                }
                break;
            case 'timestamp':
            case 'date':
                if (value !== null && typeof(value) !== 'number') {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a valid timestamp',
                        inlinePrompt: 'Not a timestamp',
                        field: fieldName
                    });
                }
                break;
            case 'time':
                if (value !== null && Number.isNaN(Date.parse('2012-01-01 ' + value))) {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be a valid time',
                        inlinePrompt: 'Invalid',
                        field: fieldName
                    });
                }
                break;
            case 'choice':
                if (value !== null) {
                    if (!this.isValidChoice(value, props.options)) {
                        this.errors.push({
                            prompt: 'Field "' + fieldName + '" contains an invalid choice',
                            inlinePrompt: 'Invalid choice',
                            field: fieldName
                        });
                    }
                }
                break;
            case 'group':
                // This is a sub group, so validate that
                if (!fieldData.hasOwnProperty('data')) {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must contain a data child',
                        inlinePrompt: 'Missing data child',
                        field: fieldName
                    });
                }
                else {
                    this.validateData(fieldData.data, props.data || {});
                }
                validateValue = false;
                break;
            case 'array':
                if (fieldData !== null && (!fieldData instanceof Array)) {
                    this.errors.push({
                        prompt: 'Field "' + fieldName + '" must be an array',
                        inlinePrompt: 'Not an array',
                        field: fieldName
                    });
                }
                else {
                    // This means that the value is an array of child items which each must be validated
                    if (props.min !== null) {
                        if (props.min > 0 && fieldData === null) {
                            // We expect at least one item but it wasn't supplied
                            this.errors.push({
                                prompt: 'Field "' + fieldName + '" is required',
                                inlinePrompt: 'Required',
                                field: fieldName
                            });
                        }
                        else if (props.min > 0 && props.min > fieldData.length) {
                            // We don't have enough of them
                            this.errors.push({
                                prompt: 'Field "' + fieldName + '" must have at least ' + props.min + ' item' + (props.min === 1 ? '' : 's'),
                                inlinePrompt: 'Not enough items',
                                field: fieldName
                            });
                        }
                    }
                    
                    if (props.max !== null && fieldData !== null) {
                        if (props.max < fieldData.length) {
                            // We have too many
                            this.errors.push({
                                prompt: 'Field "' + fieldName + '" must have at most ' + props.max + ' item' + (props.max === 1 ? '' : 's'),
                                inlinePrompt: 'Too many items',
                                field: fieldName
                            });
                        }
                    }
                    
                    // Validate each item
                    if (fieldData !== null) {
                        for (i = 0; i < fieldData.length; i += 1) {
                            item = fieldData[i];
                            
                            if (!item.hasOwnProperty('data')) {
                                this.errors.push({
                                    prompt: 'Field "' + fieldName + '[' + i + ']" must contain a data child',
                                    inlinePrompt: 'Missing data child',
                                    field: fieldName + '[' + i + ']'
                                });
                            }
                            else {
                                //console.log(item);
                                this.validateData(item.data, templateData.data || {});
                            }
                        }
                    }
                }
                validateValue = false;
                break;
            default:
                this.errors.push({
                    prompt: 'Unknown template type "' + props.type + '"'
                });
        }
        
        if (validateValue) {
            // Validate required field
            if (value === null && props.required) {
                this.errors.push({
                    prompt: 'Field "' + fieldName + '" is required',
                    inlinePrompt: 'Required',
                    field: fieldName
                });
            }

            // Validate the length
            if (props.minLen !== null && value !== null && (""+value).length < props.minLen) {
                this.errors.push({
                    prompt: 'Field "' + fieldName + '" must be at least ' + props.minLen + ' character' + (props.minLen === 1 ? '' : 's'),
                    inlinePrompt: 'Too short',
                    field: fieldName
                });
            }

            if (props.maxLen !== null && value !== null && (""+value).length > props.maxLen) {
                this.errors.push({
                    prompt: 'Field "' + fieldName + '" must be no more than ' + props.maxLen + ' character' + (props.maxLen === 1 ? '' : 's'),
                    inlinePrompt: 'Too long',
                    field: fieldName
                });
            }

            if (props.min !== null && value !== null && value < props.min) {
                this.errors.push({
                    prompt: 'Field "' + fieldName + '" must be no less than ' + props.min,
                    inlinePrompt: 'Below minimum',
                    field: fieldName
                });
            }

            if (props.max !== null && value !== null && value > props.max) {
                this.errors.push({
                    prompt: 'Field "' + fieldName + '" must be no more than ' + props.max,
                    inlinePrompt: 'Above maximum',
                    field: fieldName
                });
            }
        }
    },
    
    validateContains: function (obj, children) {
        var objKey, objValue;
        
        // First make sure that all the object children exist in the valid children
        for (objKey in obj) {
            if (obj.hasOwnProperty(objKey)) {
                // Make sure it is expected
                if (children.hasOwnProperty(objKey)) {
                    objValue = obj[objKey];
    
                    // Make sure it's the correct type
                    if (typeof (objValue) !== children[objKey] || objValue === null || objValue instanceof Array) {
                        this.errors.push({
                            prompt: 'Invalid object type for element "' + objKey + '", expected "' + children[objKey] + '" but was "' + (objValue === null ? 'null' : (objValue instanceof Array ? 'Array' : typeof(objValue))) + '"'
                        });
                    }
                }
                else {
                    this.errors.push({
                        prompt: 'Unexpected element "' + objKey + '"'
                    });
                }
            }
        }
        
        // Now see if there are any missing children
        if (obj !== null) {
            for (objKey in children) {
                if (!obj.hasOwnProperty(objKey)) {
                    this.errors.push({
                        prompt: 'Missing element "' + objKey + '"'
                    });
                }
            }
        }
    }
});

module.exports = TemplateValidator;