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

        function getUserId(user) {
            const when = require("when");
            const users = require("./users");

            if (Number.isInteger(user)) {
                return when(user);
            }

            return users.getId(user).then(function (result) {
                if (Array.isArray(result)) {
                    throw new Error(`Several users (${result.join(",")}) match the name "${user}".`);
                }

                return result;
            });
        }

        function show(user, project) {
            return getUserId(user).then(function (userId) {
                const tp = require("targetprocess-api")({domain, token});
                const condition = project
                    ? `(User.Id eq ${userId})and(Project.Id eq ${project})`
                    : `(User.Id eq ${userId})`;

                return tp.retrieve(resource).where(condition).get().then(format);
            });
        }

        return {
            show
        };
    }

    module.exports = projectMembers;
}());
