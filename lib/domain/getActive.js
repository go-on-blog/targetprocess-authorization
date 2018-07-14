/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");

    module.exports = stampit(retriever, {
        methods: {
            getActive(properties) {
                properties = properties || ["Id"];
                const condition = "(IsActive eq 'true')";

                return this.retriever.where(condition).pick(properties).take(1000).get();
            }
        }
    });
}());
