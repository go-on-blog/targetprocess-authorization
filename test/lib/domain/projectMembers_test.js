/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("projectMembers", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/projectMembers");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "ProjectMembers"}, credentials);

    chai.use(chaiAsPromised);

    describe("toIds", function () {
        function getHandlerWithFakeFunction(args, value, prop) {
            const stub = sinon.stub();
            const handler = {resource: "Users"};

            stub.rejects();
            stub.withArgs(args).resolves(value);
            handler[prop] = stub;

            return handler;
        }

        it("should eventually return an empty array when value is omitted", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, undefined))
                .to.eventually.be.an("array")
                .that.is.empty;
        });

        it("should eventually return an empty array when value is null", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, null))
                .to.eventually.be.an("array")
                .that.is.empty;
        });

        it("should eventually return an empty array when value is a boolean (false)", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, false))
                .to.eventually.be.an("array")
                .that.is.empty;
        });

        it("should eventually return an empty array when value is a boolean (true)", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, true))
                .to.eventually.be.an("array")
                .that.is.empty;
        });

        it("should eventually return a one-item array when value is a number", function () {
            const sut = factory(config);
            const id = 1;

            return expect(sut.toIds(null, id)).to.eventually.be.an("array").and.to.deep.equal([id]);
        });

        it("should convert value to string when it is neither undefined, null, boolean nor integer", function () {
            const sut = factory(config);
            const name = "ABC";
            const handler = getHandlerWithFakeFunction(name, 42, "getByName");

            return expect(sut.toIds(handler, [name]))
                .to.eventually.be.an("array")
                .and.to.deep.equal([42]);
        });

        it("should eventually invoke the filter function when value is a string starting with 'where='", function () {
            const sut = factory(config);
            const condition = "(FirstName eq 'Adam')";
            const expected = 42;
            const handler = getHandlerWithFakeFunction(condition, [{Id: expected}], "filter");

            return expect(sut.toIds(handler, `where=${condition}`))
                .to.eventually.deep.equal([expected]);
        });

        it("should eventually be rejected when no item of the given name is found", function () {
            const sut = factory(config);
            const name = "x";
            const handler = getHandlerWithFakeFunction(name, null, "getByName");

            return expect(sut.toIds(handler, name))
                .to.be.rejected;
        });

        it("should eventually be rejected when the given name matches several items", function () {
            const sut = factory(config);
            const veryCommonLastName = "Smith";
            const handler = getHandlerWithFakeFunction(veryCommonLastName, [1, 2], "getByName");

            return expect(sut.toIds(handler, veryCommonLastName))
                .to.be.rejected;
        });

        it("should eventually return an array whose unique item is matching the given name", function () {
            const sut = factory(config);
            const name = "x";
            const expected = 42;
            const handler = getHandlerWithFakeFunction(name, expected, "getByName");

            return expect(sut.toIds(handler, name))
                .to.eventually.be.an("array")
                .and.to.deep.equal([expected]);
        });
    });

    describe("getWhereClause", function () {
        it("should return an empty string when both projects and users are empty", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([], []))
                .to.be.a("string")
                .that.is.empty;
        });

        it("should use the 'eq' operator on users when only one user id is given", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([1], []))
                .to.equal("(User.Id eq 1)");
        });

        it("should use the 'in' operator on users when several user ids are given", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([1, 2], []))
                .to.equal("(User.Id in (1,2))");
        });

        it("should use the 'eq' operator on projects when only one project id is given", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([], [1]))
                .to.equal("(Project.Id eq 1)");
        });

        it("should use the 'in' operator on projects when several project ids are given", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([], [1, 2]))
                .to.equal("(Project.Id in (1,2))");
        });

        it("should use the 'and' operator when both user and project are given", function () {
            const sut = factory(config);

            return expect(sut.getWhereClause([1], [2]))
                .to.equal("(User.Id eq 1)and(Project.Id eq 2)");
        });
    });

    describe("getItems", function () {
        it("should eventually reject the promise when both users and projects are empty", function () {
            const sut = factory(config);

            return expect(sut.getItems([[], []]))
                .to.eventually.be.rejected;
        });

        it("should eventually return a 3-elements array whose first two are those given in input", function () {
            const users = [1];
            const projects = [2];
            const items = [];
            const sut = factory(config);
            const filter = sinon.stub(sut, "filter");

            filter.resolves(items);
            return expect(sut.getItems([users, projects]))
                .to.eventually.be.an("array")
                .and.to.deep.equal([users, projects, items]);
        });
    });

    describe("show", function () {
        it("should eventually return an array of users ids, projects ids and existing assignments", function () {
            const items = [
                {
                    User: {Id: 1},
                    Project: {Id: 2},
                    Role: {Id: 3}
                }
            ];
            const expected = [[1], [2], items];
            const sut = factory(config);
            const getItems = sinon.stub(sut, "getItems");
            getItems.withArgs([[1], [2]]).resolves(expected);

            return expect(sut.show(1, 2))
                .to.eventually.be.an("array")
                .and.to.deep.equal(expected);
        });
    });

    describe("remove", function () {
        it("should eventually return a 4-elements array whose first three are those given in input", function () {
            const users = [1];
            const projects = [2];
            const items = [{}];
            const result = {Deleted: [], NotDeleted: []};
            const sut = factory(config);
            const batchRemove = sinon.stub(sut.remover, "batchRemove");

            batchRemove.resolves(result);
            return expect(sut.remove([users, projects, items]))
                .to.eventually.be.an("array")
                .and.to.deep.equal([users, projects, items, result]);
        });
    });

    describe("noneIsAll", function () {
        it("should eventually return the input array when it is not empty", function () {
            const sut = factory(config);
            const arr = [1, 2, 3];

            return expect(sut.noneIsAll(null, arr))
                .to.eventually.equal(arr);
        });

        it("should eventually return a new array when the input array is empty", function () {
            const sut = factory(config);
            const arr = [];
            const handler = {
                getActive: () => Promise.resolve([1, 2, 3])
            };

            return expect(sut.noneIsAll(handler, arr))
                .to.eventually.be.an("array")
                .and.to.not.equal(arr);
        });
    });

    describe("makeItem", function () {
        it("should return an object with User, Project and Role properties set according to arguments", function () {
            const sut = factory(config);
            const expected = {
                User: {Id: 1},
                Project: {Id: 2},
                Role: {Id: 3}
            };

            return expect(sut.makeItem(1, 2, 3)).to.deep.equal(expected);
        });

        it("should return an object without Role property when the role is undefined", function () {
            const sut = factory(config);
            return expect(sut.makeItem(1, 2)).to.not.have.own.property("Role");
        });
    });

    describe("makeBatch", function () {
        it("should throw an Error when multiple roles are given", function () {
            const sut = factory(config);
            const makeBatchWithMultipleRoles = function () {
                sut.makeBatch([null, null, [1, 2]]);
            };

            return expect(makeBatchWithMultipleRoles).to.throw(Error);
        });

        it("should make a batch whose length is the product of the number of users by the number of projects", function () {
            const sut = factory(config);
            const users = [1, 2, 3];
            const projects = [4, 5];
            const roles = [];

            return expect(sut.makeBatch([users, projects, roles]))
                .to.be.an("array")
                .and.to.have.lengthOf(users.length * projects.length);
        });
    });

    describe("assign", function () {
        it("should eventually remove prior assignments and create new ones", function () {
            const sut = factory(config);
            const unassign = sinon.stub(sut, "unassign");
            const create = sinon.stub(sut, "create");

            unassign.withArgs(1, 2).resolves([[1], [2], [], {}]);
            create.resolves({});

            sut.assign(1, 2, 3);
            return expect(unassign.calledWith(1, 2) && create.calledWith(3, [[1], [2]]));
        });
    });
});
