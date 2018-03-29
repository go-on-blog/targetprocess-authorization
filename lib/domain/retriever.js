/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const resource = require("./resource");

    module.exports = resource.compose({
        props: {
            retriever: null
        },

        // To get a regular instance:
        //     const instance = retriever({domain, token});
        // To get an instance that is using a stub:
        //     retriever.props({retrieve: stub});
        //     const instance = retriever({domain, token});
        init(config = {}) {
            if (!this.retriever) {
                this.retriever = require("targetprocess-api/retrieve")(Object.assign({resource: this.resource}, config));
            }
        }
    });
}());
