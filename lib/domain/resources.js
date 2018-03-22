/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");

    module.exports = stampit({
        props: {
            resource: null,
            propName: "Name"
        },
        init(config = {}) {
            if (!this.retrieve) {
                this.retrieve = require("targetprocess-api/retrieve")(Object.assign({resource: this.resource}, config));
            }
        },
        methods: {
            getId(name) {
                const condition = `${this.propName} eq '${name.replace(/'/g, "\\'")}'`;

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
