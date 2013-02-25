
var Class = require('../class/class'),
    HttpException = require('../exceptions/HttpException'),
    RestHandler;

RestHandler = Class.extend({
    
    moduleMap: null,
    
    init: function (moduleMap) {
        this.moduleMap = moduleMap;
        
        var collections = {}, i, j, map, regexUri;

        for (i = 0; i < this.moduleMap.length; i += 1) {
            map = this.moduleMap[i];

            //if (!collections.hasOwnProperty(map.moduleName)) {
            //    collections[map.moduleName] = new restCollections[map.moduleName]();
            //}

            //map.module = collections[map.moduleName];

            // Find all the parameters in the URI
            matches = map.uri.match(/({[a-zA-Z0-9-_]*})/g);
            regexUri = map.uri; // Store a reference to what will be the regex search string
            map.params = []; // this will contain the param names for each defined parameter
            if (matches !== null) {
                // Go through each param match
                for (j = 0; j < matches.length; j += 1) {
                    // Build up the regex string that will extract this param
                    regexUri = regexUri.replace(matches[j], '([a-zA-Z0-9-_]+)');
                    // Add the param name to the param list (removing the curley braces)
                    map.params.push(matches[j].substr(1, matches[j].length - 2));
                }
            }
            // Now create a final regex which means it must start with and end with the exact string
            map.regex = '^' + regexUri + '$';
        }
    },
    
    execute: function (request, response, callback) {
        var i, j, matches, callMethod = null, urlFound = false;

        // Search each regex to find out which module we are routing to
        for (i = 0; i < this.moduleMap.length; i += 1) {
            matches = request.getUri().match(new RegExp(this.moduleMap[i].regex));
            if (matches !== null) {
                urlFound = true;
                
                for (j = 1; j < matches.length; j += 1) {
                    request.addParam(this.moduleMap[i].params[j - 1], matches[j]);
                }

                switch (request.getMethod()) {
                    case 'GET': callMethod = 'doGet'; break;
                    case 'POST': callMethod = 'doPost'; break;
                    case 'PUT': callMethod = 'doPut'; break;
                    case 'DELETE': callMethod = 'doDelete'; break;
                    default: {
                        response.setStatusCode(405);
                        callback(new HttpException(405), response);
                    }
                }
                
                if (callMethod !== null) {
                    this.moduleMap[i].module[callMethod](request, response, function (ex) {
                        if (ex !== null) {
                            if (ex instanceof HttpException) {
                                response.setStatusCode(ex.getCode());
                            }
                            else {
                                response.setStatusCode(500); // Internal server error
                            }
                        }

                        callback(ex, response);

                    });
                }

                break; // No need to keep searching
            }
        }
        
        if (!urlFound) {
            response.setStatusCode(404);
            callback(new HttpException(404), response);
        }
    }
});

module.exports = RestHandler;