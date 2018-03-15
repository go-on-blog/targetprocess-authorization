/*jslint
    es6, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");

    const resources = stampit({
        props: {
            credentials: null,
            resource: null
        },
        init(credentials) {
            this.credentials = credentials;
        },
        methods: {
            getId(name) {
                const tp = require("targetprocess-api")(this.credentials);
                const escapedName = name.replace(/'/g, "\\'");
                const condition = `Name eq '${escapedName}'`;

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

    module.exports = resources;
}());
