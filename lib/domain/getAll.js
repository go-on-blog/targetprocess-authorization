/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");

    module.exports = stampit(retriever, {
        methods: {
            getAll(properties) {
                properties = properties || ["Id"];

                return this.retriever.pick(properties).take(1000).get();
            }
        }
    });
}());
