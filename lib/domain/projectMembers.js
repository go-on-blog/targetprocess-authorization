/*jslint
    es6, node, this
*/
(function () {
    "use strict";

    const stampit = require("@stamp/it");
    const retriever = require("./retriever");
    const remover = require("./remover");
    const creator = require("./creator");
    const filter = require("./filter");

    module.exports = stampit(retriever, remover, creator, filter, {
        props: {
            resource: "ProjectMembers",
            users: null,
            projects: null,
            roles: null
        },
        init(config = {}) {
            if (!this.users) {
                this.users = require("./users")(config);
            }

            if (!this.projects) {
                this.projects = require("./projects")(config);
            }

            if (!this.roles) {
                this.roles = require("./roles")(config);
            }
        },
        methods: {
            /**
             * Convert any input value into Promise for an array of identifiers.
             *
             * @param {Object} handler - Object providing filter() and
             * getByName() methods.
             * @param {mixed} value - Value whose identifier is sought.
             * @return {Promise} - Array of identifiers (which are numbers).
             */
            toIds(handler, value) {
                const pluck = require("mout/array/pluck");

                if (!value || (typeof value === "boolean")) {
                    return Promise.resolve([]);
                }

                if (Number.isInteger(value)) {
                    return Promise.resolve([value]);
                }

                if (typeof value !== "string") {
                    value = value.toString();
                }

                if (value.startsWith("where=")) {
                    return handler.filter(value.substring(6)).then((arr) => pluck(arr, "Id"));
                }

                return handler.getByName(value).then(function (result) {
                    if (!result) {
                        throw new Error(`No entity of name "${value}" was found. Command aborted.`);
                    }

                    if (Array.isArray(result)) {
                        throw new Error(`Several ${handler.resource} (${result.join(",")}) match the name "${value}".`);
                    }

                    return [result];
                });
            },

            /**
             * Construct a "where" clause based on given users and projects
             * identifiers.
             *
             * @param {number[]} users - Users ids whose assignments are sought.
             * @param {number[]} projects - Projects ids whose assignments are
             * sought.
             * @return {string} - "where" clause
             */
            getWhereClause(users, projects) {
                var clause = "";

                if (users.length === 0 && projects.length === 0) {
                    return clause;
                }

                if (users.length === 1) {
                    clause = clause.concat(`(User.Id eq ${users[0]})`);
                } else if (users.length > 1) {
                    clause = clause.concat(`(User.Id in (${users.join(',')}))`);
                }

                if (projects.length === 1) {
                    if (clause.length > 0) {
                        clause = clause.concat("and");
                    }
                    clause = clause.concat(`(Project.Id eq ${projects[0]})`);
                } else if (projects.length > 1) {
                    if (clause.length > 0) {
                        clause = clause.concat("and");
                    }
                    clause = clause.concat(`(Project.Id in (${projects.join(',')}))`);
                }

                return clause;
            },

            /**
             * Return items filtered according to given users and projects.
             *
             * @param {number[]} users - Users ids whose assignments are sought.
             * @param {number[]} projects - Projects ids whose assignments are
             * sought.
             * @return {Promise} - Array of three elements: the two given in input
             * and the project member assignments, as an array of objects.
             */
            getItems([users, projects]) {
                const clause = this.getWhereClause(users, projects);

                // This limitation may be removed if the "in" operator supports
                // a large number of values.
                if (clause.length === 0) {
                    return Promise.reject(new Error("No project or user fulfills given conditions. Command aborted."));
                }

                return this.filter(clause)
                    .then((i) => [users, projects, i]);
            },

            /**
             * Return existing relations between the given user and project,
             * with its specific role on the project.
             *
             * @param {Number|String} user - User id, last name or condition.
             * When the user is undefined, all users are considered.
             * @param {Number|String} project - Project id, name or condition.
             * When the project is undefined, all projects are considered.
             * @return {Promise} - Array of three elements:
             * 1. users ids matching the corresponding input parameter, as an
             * array of numbers
             * 2. projects ids matching the corresponding input parameter, as an
             * array of numbers
             * 3. project member assignments, as an array of objects.
             */
            show(user, project) {
                const getItems = this.getItems.bind(this);

                return Promise.all([
                    this.toIds(this.users, user),
                    this.toIds(this.projects, project)
                ]).then(getItems);
            },

            remove([users, projects, items]) {
                const pluck = require("mout/array/pluck");
                const batch = pluck(items, "Id");

                return this.remover.batchRemove(batch)
                    .then((r) => [users, projects, items, r]);
            },

            /**
             * Removes existing assignments between the given user and project.
             *
             * @param {Number|String} user - User id, last name or condition.
             * When the user is undefined, all users are considered.
             * @param {Number|String} project - Project id, name or condition.
             * When the project is undefined, all projects are considered.
             * @return {Promise} - Array of four elements:
             * 1. users ids matching the corresponding input parameter, as an
             * array of numbers
             * 2. projects ids matching the corresponding input parameter, as an
             * array of numbers
             * 3. project member assignments, as an array of objects.
             * 4. removal results, as an object having two properties: Deleted
             * and NotDeleted.
             */
            unassign(user, project) {
                const remove = this.remove.bind(this);

                return this.show(user, project)
                    .then(remove);
            },

            noneIsAll(handler, arr) {
                const pluck = require("mout/array/pluck");

                return (arr.length === 0
                    ? handler.getActive().then((arr) => pluck(arr, "Id"))
                    : Promise.resolve(arr));
            },

            makeItem(user, project, role) {
                const item = {
                    User: {Id: user},
                    Project: {Id: project}
                };

                if (role) {
                    item.Role = {Id: role};
                }

                return item;
            },

            makeBatch([users, products, roles]) {
                if (roles.length > 1) {
                    throw new Error(`Ambiguous request: ${roles.length} roles are matching. Command aborted.`);
                }

                const makeItem = this.makeItem;
                const role = roles.length === 0
                    ? undefined
                    : roles[0];

                return users.reduce(function (accumulator, u) {
                    const items = products.map((p) => makeItem(u, p, role));
                    Array.prototype.push.apply(accumulator, items);
                    return accumulator;
                }, []);
            },

            create(role, [users, projects]) {
                const makeBatch = this.makeBatch.bind(this);
                const batchCreate = this.creator.batchCreate.bind(this.creator);

                return Promise.all([
                    this.noneIsAll(this.users, users),
                    this.noneIsAll(this.projects, projects),
                    this.toIds(this.roles, role)
                ])
                    .then(makeBatch)
                    .then(batchCreate);
            },

            /**
             * Assign the given user to the given project with the specified
             * role.
             *
             * @param {Number|String} user - User id, last name or condition.
             * When the user is undefined, all users are considered.
             * @param {Number|String} project - Project id, name or condition.
             * When the project is undefined, all projects are considered.
             * @param {Number|string} role - Role id or name. When the role is
             * undefined, default role applies.
             * @return {Promise} - Array of objects representing new assignments.
             */
            assign(user, project, role) {
                const create = this.create.bind(this, role);

                return this.unassign(user, project)
                    .then(create);
            }
        }
    });
}());
