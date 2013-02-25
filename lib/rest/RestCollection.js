var Class = require('../class/class'),
    HttpException = require('../exceptions/HttpException'),
    RestCollection;

RestCollection = Class.extend({

    init: function () {
    },

    doGet: function (request, response, callback) {
        callback(new HttpException(405), response);
    },

    doPost: function (request, response, callback) {
        callback(new HttpException(405), response);
    },

    doPut: function (request, response, callback) {
        callback(new HttpException(405), response);
    },

    doDelete: function (request, response, callback) {
        callback(new HttpException(405), response);
    }

});

module.exports = RestCollection;