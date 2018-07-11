/*jslint
    es6
*/
(function () {
    "use strict";

    function adapter(args) {
        args = args || {};

        const factory = require("../domain/projectMembers");
        const projectMembers = factory({
            domain: args.domain,
            token: args.token
        });

        return projectMembers.show(args.user, args.project);
    }

    module.exports = adapter;
}());
