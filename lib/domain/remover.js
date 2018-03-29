/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const resource = require("./resource");

    module.exports = resource.compose({
        props: {
            remover: null
        },

        // To get a regular instance:
        //     const instance = remover({domain, token});
        // To get an instance that is using a stub:
        //     remover.props({retrieve: stub});
        //     const instance = remover({domain, token});
        init(config = {}) {
            if (!this.remover) {
                this.remover = require("targetprocess-api/remove")(Object.assign({resource: this.resource}, config));
            }
        }
    });
}());
