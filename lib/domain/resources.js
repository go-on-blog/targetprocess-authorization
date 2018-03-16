/*jslint
    es6, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");

    module.exports = stampit({
        props: {
            credentials: null,
            resource: null,
            propName: "Name"
        },
        init(credentials) {
            this.credentials = credentials;
        },
        methods: {
            getId(name) {
                const tp = require("targetprocess-api")(this.credentials);
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

                return tp.retrieve(this.resource).where(condition).get()
                    .then(normalize);
            }
        }
    });
}());
