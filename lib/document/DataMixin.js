var Class = require('../class/class'),
    sanitize = require('validator').sanitize,
    DataMixin;
    
DataMixin = Class.extend({
    
    init: function (data) {
    },
    
    mixin: function (targetData, userData, templateData, setDefaults) {
        var field, userGroupData, cleanValue, i, arrayData;
        
        // Go through all the template items and if they exist in the user data, set them
        for (field in templateData) {
            if (templateData.hasOwnProperty(field)) {
                if (templateData[field].type === 'group') {
                    // It's a group, so make sure it exists on the target side
                    if (targetData.hasOwnProperty(field) === false) {
                        targetData[field] = {data: {}};
                    }
                    
                    userGroupData = userData.hasOwnProperty(field) ? userData[field].data || {} : {};
                    
                    // Now recursively process the group
                    this.mixin(targetData[field].data, userGroupData, templateData[field].data || {}, setDefaults);
                }
                else if (templateData[field].type === 'array') {
                    targetData[field] = [];
                    
                    if (userData.hasOwnProperty(field)) {
                        for (i = 0; i < userData[field].length; i += 1) {
                            arrayData = {data: {}};
                            this.mixin(arrayData.data, userData[field][i].data, templateData[field].data, setDefaults);
                            targetData[field].push(arrayData);
                        }
                    }
                }
                else {
                    // Set the value if present in the user data
                    if (userData.hasOwnProperty(field) && userData[field].hasOwnProperty('value')) {
                        // Clean the data from any xss attacks
                        if (typeof(userData[field].value) === 'string') {
                            cleanValue = sanitize(userData[field].value).xss();
                        }
                        else {
                            cleanValue = userData[field].value;
                        }
                        
                        if (targetData.hasOwnProperty(field) === false) {
                            targetData[field] = {value: cleanValue};
                        }
                        else {
                            targetData[field].value = cleanValue;
                        }
                    }
                    else {
                        // The user data doesn't specify a value, so set it if we want to set defaults
                        if (setDefaults && templateData[field].hasOwnProperty('default')) {
                            targetData[field].value = templateData[field]['default'];
                        }
                        else if (setDefaults) {
                            // We still want to set the deafults, but the value wasn't supplied, so set null
                            targetData[field] = {value: null};
                        }
                    }
                }
            }
        }
    }
    
});

DataMixin.instance = null;
DataMixin.getInstance = function () {
    if (this.instance === null) {
        this.instance = new DataMixin();
    }
    return this.instance;
}

module.exports = {
    mixin: function (targetData, userData, templateData, setDefaults) {
        DataMixin.getInstance().mixin(targetData, userData, templateData, setDefaults);
    }
}