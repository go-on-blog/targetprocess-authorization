/*jslint
    es6
*/
(function () {
    "use strict";

    function projectMembers(domain, token) {
        const resource = "ProjectMembers";

        function format(arr) {
            return arr.reduce(function (accumulator, item) {
                return accumulator.concat(`${item.User.FirstName} ${item.User.LastName} is assigned to ${item.Project.Name} with the ${item.Role.Name} role.\n`);
            }, "");
        }

        function show(user, project) {
            const tp = require("targetprocess-api")({domain, token});
            const condition = project
                ? `(User.Id eq ${user})and(Project.Id eq ${project})`
                : `(User.Id eq ${user})`;

            return tp.retrieve(resource).where(condition).get().then(format);
        }

        return {
            show
        };
    }

    module.exports = projectMembers;
}());
