var Class = require('../class/class'),
    JsonView = require('../views/JsonView'),
    MiogenDocument = require('../document/MiogenDocument'),
    ResponseContext;
    
ResponseContext = Class.extend({
   
    httpResponse: null,
    statusCode: 200,
    document: null,
    redirectUrl: null,
    retryAfterSeconds: 0,
    
    init: function (httpResponse) {
        this.httpResponse = httpResponse;
    },

    getHttpResponse: function () {
        return this.httpResponse;
    },

    setStatusCode: function (code) {
        this.statusCode = code;
    },

    getStatusCode: function () {
        return this.statusCode;
    },

    setError: function (uri, message) {
        var doc = new MiogenDocument(uri);
        doc.addError(message);
        this.setDocument(doc);
    },

    setDocument: function (document) {
        this.document = document;
    },

    getDocument: function () {
        return this.document;
    },
    
    setRedirectUrl: function (url) {
        this.redirectUrl = url;
    },
    
    getRedirectUrl: function () {
        return this.redirectUrl;
    },
    
    setRetryAfter: function (seconds) {
        this.retryAfterSeconds = seconds;
    },
    
    render: function (callback) {
        var jsonView = new JsonView(),
            headers;
            
        headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.redirectUrl !== null) {
            headers['Location'] = this.redirectUrl;
        }
        
        if (this.retryAfterSeconds !== 0) {
            headers['Retry-After'] = this.retryAfterSeconds;
        }
        
        this.httpResponse.writeHead(this.statusCode, headers);
        this.httpResponse.end(jsonView.render(this.document), 'utf8');
        
        if (typeof (callback) === 'function') {
            callback();
        }
    },
    
    setCookie: function (key, value) {
        
    }
});

module.exports = ResponseContext;