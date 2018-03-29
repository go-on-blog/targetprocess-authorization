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

        return projectMembers.assign(args.user, args.project, args.role);
    }

    module.exports = adapter;
}());
