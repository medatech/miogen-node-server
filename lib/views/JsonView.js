var Class = require('../class/class'),
    JsonView;
    
JsonView = Class.extend({
    
    init: function () {
    },
    
    render: function (document) {
        if (document !== null) {
            return JSON.stringify(document.getCollection(), null, 4);
        }
        else {
            return '';
        }
    }
    
});

module.exports = JsonView;