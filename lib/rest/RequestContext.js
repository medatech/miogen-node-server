var Class = require('../class/class'),
    url = require('url'),
    qs = require('querystring'),
    HttpException = require('../exceptions/HttpException'),
    RequestContext;

RequestContext = Class.extend({
   
    httpRequest: null,
    uri: null,
    method: null,
    bodyData: null,
    params: null,
    cookies: null,
    payload: null,
    queryString: {},

    init: function (httpRequest) {
        this.httpRequest = httpRequest;
        this.uri = url.parse(httpRequest.url).pathname;
        this.method = httpRequest.method;

        this.bodyData = null;
        this.queryString = url.parse(httpRequest.url, true).query;

        this.params = {};
    },

    getHttpRequest: function () {
        return this.httpRequest;
    },
    
    getUri: function () {
        return this.uri;
    },
    
    getMethod: function () {
        return this.method;
    },

    addParam: function (key, value) {
        if (!this.params.hasOwnProperty(key)) {
            this.params[key] = [value];
        }
        else {
            this.params[key].push(value);
        }
    },

    getParamArray: function (key) {
        return this.params[key] || null;
    },

    getParam: function (key) {
        if (this.params.hasOwnProperty(key)) {
            return this.params[key].length > 0 ? this.params[key][0] : null;
        }
        else {
            return null;
        }
    },
    
    getQueryParameter: function (key, defaultValue) {
        if (this.queryString.hasOwnProperty(key)) {
            return this.queryString[key];
        }
        else {
            if (typeof (defaultValue) === 'undefined') {
                return null;
            }
            else {
                return defaultValue;
            }
        }
    },
    
    readData: function (callback) {
        callback(this.payload);
    },
    
    getData: function () {
        return this.payload;
    },
    
    initReadData: function (callback) {
        var body = '', t = this;
        
        if (this.method === 'POST' || this.method === 'PUT') {
            this.httpRequest.on('data', function (data) {
                body += data;
                if (body.length > (1024*1024)) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    this.httpRequest.connection.destroy();
                    console.log('Too much data from client, destroying connection');
                    callback(null);
                }
            });
            
            this.httpRequest.on('end', function () {
                try {
                    t.payload = JSON.parse(body);
                    callback(null);
                }
                catch (ex) {
                    callback(new HttpException(400));
                    console.log('Invalid JSON body: ' + ex);
                }
            });
        }
        else {
            callback(null);
        }
    },
    
    getCookie: function (key, defaultValue) {
        var t = this;
        
        if (typeof (defaultValue) === 'undefined') {
            defaultValue = null;
        }
        
        if (this.cookies === null) {
            this.cookies = {};
            // Read the cookies
            if (this.httpRequest.headers.cookie) {
                this.httpRequest.headers.cookie.split(';').forEach(function (cookie) {
                    var parts = cookie.split('=');
                    t.cookies[parts[0].trim()] = (parts[1] || '').trim();
                });
            }
        }
        
        if (this.cookies.hasOwnProperty(key)) {
            return this.cookies[key];
        }
        else {
            return defaultValue;
        }
    },
    
    getClientIP: function () {
        return this.httpRequest.connection.remoteAddress;
    }
});

module.exports = RequestContext;