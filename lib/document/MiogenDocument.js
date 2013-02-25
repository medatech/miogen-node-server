var Class = require('../class/class'),
    TemplateValidator = require('./TemplateValidator'),
    DataMixin = require('./DataMixin'),
    MiogenDocument;
    
MiogenDocument = Class.extend({
    
    doc: null,
    col: null,

    init: function (/* optional */ uri) {
        this.doc = {
            "collection": {
                "href": uri || null,
                "version": "1.0"
            }
        };

        this.col = this.doc['collection'];
    },
    
    /**
     * Sets the document URI
     * @param {String} uri The document URI
     */
    setUri: function (uri) {
        this.doc.collection.href = uri;
    },
    
    /**
     * Validate and apply the data to the collection item
     * @param {object} userData The user supplied data object for the collection
     * @param {object} template The Miogen template used to validate and apply the data
     * @param {boolean} setDefaults True means any omitted value will use the default value (e.g. POST)
     *                              False means it will leave the original data as is (e.g. PUT)
     */
    apply: function (userData, template, setDefaults) {
        var validator, errors, i, iLen, returnData = null;
        
        validator = new TemplateValidator(template);
        if (!validator.validate(userData)) {
            errors = validator.getErrors();
            for (i = 0, iLen = errors.length; i < iLen; i += 1) {
                this.addError(errors[i]);
            }
        }
        else {
            if (this.col.hasOwnProperty('items') === false || this.col.items.length === 0) {
                this.addItem({
                    href: null, // This will be set later
                    data: {}
                });
            }
            
            if (this.col.hasOwnProperty('items') && this.col.items.length === 1) {
                if (this.col.items[0].hasOwnProperty('data') === false) {
                    this.col.items[0].data = {};
                }
                
                DataMixin.mixin(this.col.items[0].data, userData.data || {}, template.data || {}, setDefaults);
                returnData = this.col.items[0].data;
            }
            else {
                throw "Can only apply data when there is one item in the collection";
            }
        }
        
        return returnData;
    },
    
    hasErrors: function () {
        if (!this.col.hasOwnProperty('errors')) {
            return false;
        }
        else {
            return this.col.errors.length > 0;
        }
    },

    setNoItems: function () {
        this.col.items = [];
    },

    addItem: function (item) {
        if (!this.col.hasOwnProperty('items')) {
            this.col.items = [item];
        }
        else {
            this.col.items.push(item);
        }
    },

    getCollection: function () {
        return this.doc;
    },
    
    setTemplate: function (template) {
        this.col.templates = [template];
    },
    
    addTemplate: function (template) {
        if (!this.col.hasOwnProperty('templates')) {
            this.col.templates = [template];
        }
        else {
            this.col.templates.push(template);
        }
    },
    
    addLink: function (name, href, /* optional */ rel, /* optional */ prompt) {
        var link;
        
        if (typeof (rel) === 'undefined') {
            rel = null;
        }
        if (typeof (prompt) === 'undefined') {
            prompt = null;
        }
        
        link = {
            name: name,
            href: href
        };
        if (rel !== null) {
            link.rel = rel;
        }
        if (prompt !== null) {
            link.prompt = prompt;
        }
        
        if(!this.col.hasOwnProperty('links')) {
            this.col.links = [link];
        }
        else {
            this.col.links.push(link);
        }
    },
    
    addQuery: function (name, href, /* optional */ template, /* optional */ rel, /* optional */ paramData, /* optional */ prompt) {
        var query;
        
        if (typeof (template) === 'undefined') {
            template = null;
        }
        
        if (typeof (rel) === 'undefined') {
            rel = null;
        }
        
        if (typeof (paramData) === 'undefined') {
            paramData = null;
        }
        
        if (typeof (prompt) === 'undefined') {
            prompt = null;
        }
        
        query = {
            name: name,
            href: href
        };
        if (template !== null) {
            query.template = template;
        }
        if (rel !== null) {
            query.rel = rel;
        }
        if (paramData !== null) {
            query.data = paramData
        }
        if (prompt !== null) {
            query.prompt = prompt;
        }
        
        if(!this.col.hasOwnProperty('queries')) {
            this.col.queries = [query];
        }
        else {
            this.col.queries.push(query);
        }
    },
    
    addError: function (error) {
        if (!this.col.hasOwnProperty('errors')) {
            this.col.errors = [error];
        }
        else {
            this.col.errors.push(error);
        }
    }
});

module.exports = MiogenDocument;