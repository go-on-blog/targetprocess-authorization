/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");

    module.exports = stampit(retriever, {
        methods: {
            filter(condition) {
                return this.retriever.where(condition).take(1000).get();
            }
        }
    });
}());
