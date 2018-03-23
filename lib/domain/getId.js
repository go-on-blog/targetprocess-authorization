/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");

    module.exports = stampit(retriever, {
        props: {
            propName: "Name"
        },
        methods: {
            getId(value) {
                const condition = `${this.propName} eq '${value.replace(/'/g, "\\'")}'`;

                function normalize(arr) {
                    if (arr.length === 0) {
                        return null;
                    } else if (arr.length === 1) {
                        return arr[0].Id;
                    } else {
                        return arr.map((item) => item.Id);
                    }
                }

                return this.retrieve.where(condition).get().then(normalize);
            }
        }
    });
}());
