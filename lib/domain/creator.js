/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const resource = require("./resource");

    module.exports = resource.compose({
        props: {
            creator: null
        },

        init(config = {}) {
            if (!this.creator) {
                this.creator = require("targetprocess-api/create")(Object.assign({resource: this.resource}, config));
            }
        }
    });
}());
