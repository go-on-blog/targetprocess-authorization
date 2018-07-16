/*jslint
    es6
*/
"use strict";

const {after, before, describe, it} = require("mocha");

describe("projectMembers", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/projectMembers");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "ProjectMembers"}, credentials);

    chai.use(chaiAsPromised);

    describe("getId", function () {
        function getStub(args, value) {
            const getByName = sinon.stub();

            getByName.withArgs(args).resolves(value);

            return {
                resource: "Users",
                getByName
            };
        }

        before(function () {
            sinon.stub(console, 'warn');
        });

        it("should eventually return undefined when no argument is given", function () {
            const sut = factory(config);
            return expect(sut.getId(null, undefined)).to.eventually.be.undefined;
        });

        it("should eventually return its argument when it is a number", function () {
            const sut = factory(config);
            const id = 1;

            return expect(sut.getId(null, id)).to.eventually.equal(id);
        });

        it("should return a rejected promise when the given name matches several users", function () {
            const sut = factory(config);
            const veryCommonLastName = "Smith";
            const stub = getStub(veryCommonLastName, [1, 2]);

            return expect(sut.getId(stub, veryCommonLastName))
                .to.be.rejected;
        });

        it("should eventually return an identifier matching the given name", function () {
            const sut = factory(config);
            const name = "x";
            const stub = getStub(name, 42);

            return expect(sut.getId(stub, name))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });

        it("should eventually output a warning when either user or project is not found by its name", function () {
            const sut = factory(config);
            const name = "x";
            const stub = getStub(name, null);

            return sut.getId(stub, name, true)
                .then(() => expect(console.warn.calledOnce).to.be.true);
        });

        after(function () {
            console.warn.restore();
        });
    });

    describe("toIds", function () {
        function getHandlerWithFakeFunction(args, value, prop) {
            const stub = sinon.stub();
            const handler = {resource: "Users"};

            stub.rejects();
            stub.withArgs(args).resolves(value);
            handler[prop] = stub;

            return handler;
        }

        it("should eventually return undefined when criteria is omitted", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, undefined)).to.eventually.be.undefined;
        });

        it("should eventually return undefined when criteria is null", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, null)).to.eventually.be.undefined;
        });

        it("should eventually return undefined when criteria is a boolean (false)", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, false)).to.eventually.be.undefined;
        });

        it("should eventually return undefined when criteria is a boolean (true)", function () {
            const sut = factory(config);
            return expect(sut.toIds(null, true)).to.eventually.be.undefined;
        });

        it("should eventually return a one-item array when criteria is a number", function () {
            const sut = factory(config);
            const id = 1;

            return expect(sut.toIds(null, id)).to.eventually.be.an("array").and.to.deep.equal([id]);
        });

        it("should convert criteria to string when it is neither undefined, null, boolean nor integer", function () {
            const sut = factory(config);
            const name = "ABC";
            const handler = getHandlerWithFakeFunction(name, 42, "getByName");

            return expect(sut.toIds(handler, [name]))
                .to.eventually.be.an("array")
                .and.to.deep.equal([42]);
        });

        it("should eventually invoke the filter function when criteria is a string starting with 'where='", function () {
            const sut = factory(config);
            const condition = "(FirstName eq 'Adam')";
            const expected = 42;
            const handler = getHandlerWithFakeFunction(condition, expected, "filter");

            return expect(sut.toIds(handler, `where=${condition}`))
                .to.eventually.equal(expected);
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

    describe("getItems", function () {
        function getSUT(users, projects, args, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever, users, projects}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp(config);
        }

        it("should eventually return an array with a single item matching given user name and project id", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})and(Project.Id eq 2)`,
                    take: 1000
                },
                json: true
            };
            const expected = {
                Items: [
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 2,
                            Name: "Treadstone"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    }
                ]
            };
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects, args, expected);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, name).resolves(id);
            getId.withArgs(projects, 2).resolves(2);

            return expect(sut.getItems(name, 2))
                .to.eventually.be.an("array")
                .and.to.deep.equal(expected.Items);
        });

        it("should eventually return an array with several items matching the given user name", function () {
            const name = "Bourne";
            const id = 1;
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/ProjectMembers/`,
                qs: {
                    token: credentials.token,
                    where: `(User.Id eq ${id})`,
                    take: 1000
                },
                json: true
            };
            const expected = {
                Items: [
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 2,
                            Name: "Treadstone"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    },
                    {
                        User: {
                            Id: id,
                            FirstName: "Jason",
                            LastName: name
                        },
                        Project: {
                            Id: 3,
                            Name: "Blackbriar"
                        },
                        Role: {
                            Name: "Developer"
                        }
                    }
                ]
            };
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects, args, expected);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, name).resolves(id);

            return expect(sut.getItems(name))
                .to.eventually.be.an("array")
                .and.to.deep.equal(expected.Items);
        });

        it("should return a rejected promise when both project and user names are not valid", function () {
            const badUserName = "x";
            const badProjectName = "y";
            const users = {};
            const projects = {};
            const sut = getSUT(users, projects);
            const getId = sinon.stub(sut, "getId");
            getId.withArgs(users, badUserName).resolves(null);
            getId.withArgs(projects, badProjectName).resolves(null);

            return expect(sut.getItems(badUserName, badProjectName))
                .to.be.rejectedWith(Error);
        });
    });

    describe("show", function () {
        it("should eventually return a string matching given user and project", function () {
            const userName = "Bourne";
            const projectName = "Treadstone";
            const items = [
                {
                    User: {
                        Id: 1,
                        FirstName: "Jason",
                        LastName: userName
                    },
                    Project: {
                        Id: 2,
                        Name: projectName
                    },
                    Role: {
                        Name: "Developer"
                    }
                }
            ];
            const sut = factory(config);
            const getItems = sinon.stub(sut, "getItems");
            getItems.withArgs(userName, projectName).resolves(items);

            return expect(sut.show(userName, projectName))
                .to.eventually.be.an("array")
                .and.to.deep.equal(items);
        });
    });

    describe("unassign", function () {
        it("should eventually return a single object when a single user/project couple is given", function () {
            const userName = "Bourne";
            const projectName = "Treadstone";
            const batchRemove = sinon.stub();
            const remover = {batchRemove};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {remover}});
            const sut = stamp(config);
            const getItems = sinon.stub(sut, "getItems");
            const response = {ResourceType: "ProjectMember", Id: 42};

            getItems.withArgs(userName, projectName).resolves([
                {
                    Id: 42,
                    User: {Id: 1, FirstName: "Jason", LastName: userName},
                    Project: {Id: 2, Name: projectName},
                    Role: {Id: 3, Name: "Developer"}
                }
            ]);

            batchRemove.withArgs([42]).resolves(response);

            return expect(sut.unassign(userName, projectName))
                .to.eventually.equal(response);
        });

        it("should eventually return a compound object when a user/project set is given", function () {
            const userName = "Bourne";
            const batchRemove = sinon.stub();
            const remover = {batchRemove};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {remover}});
            const sut = stamp(config);
            const getItems = sinon.stub(sut, "getItems");
            const response = {
                Deleted: {Items: []},
                NotDelete: {Items: []}
            };

            getItems.withArgs(userName).resolves([
                {
                    Id: 42,
                    User: {Id: 10},
                    Project: {Id: 20},
                    Role: {Id: 30}
                },
                {
                    Id: 43,
                    User: {Id: 10},
                    Project: {Id: 21},
                    Role: {Id: 30}
                }
            ]);

            batchRemove.withArgs([42, 43]).resolves(response);

            return expect(sut.unassign(userName))
                .to.eventually.deep.equal(response);
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

    describe("create", function () {
        it("should eventually assign the given user to the given project", function () {
            const create = sinon.stub();
            const creator = {create};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {creator}});
            const sut = stamp(config);
            const response = {ResourceType: "ProjectMember", Id: 456};

            create.withArgs({
                User: {Id: 1},
                Project: {Id: 2},
                Role: {Id: 3}
            }).resolves(response);

            return expect(sut.create(1, 2, 3))
                .to.eventually.equal(response);
        });

        it("shold eventually assign the project to all users when no user is specified", function () {
            const user = undefined;
            const project = 2;
            const role = 3;
            const batchCreate = sinon.stub();
            const creator = {batchCreate};
            const getActive = sinon.stub();
            const users = {getActive};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {creator, users}});
            const sut = stamp(config);
            const batch = [
                {User: {Id: 10}, Project: {Id: project}, Role: {Id: role}},
                {User: {Id: 11}, Project: {Id: project}, Role: {Id: role}},
                {User: {Id: 12}, Project: {Id: project}, Role: {Id: role}}
            ];

            getActive.resolves([{Id: 10}, {Id: 11}, {Id: 12}]);
            batchCreate.resolves([{Id: 10}, {Id: 11}, {Id: 12}]);

            sut.create(user, project, role);
            return expect(batchCreate.calledWith(batch));
        });

        it("shold eventually assign a user to all projects when no project is specified", function () {
            const user = 1;
            const project = undefined;
            const role = 3;
            const batchCreate = sinon.stub();
            const creator = {batchCreate};
            const getActive = sinon.stub();
            const projects = {getActive};
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {creator, projects}});
            const sut = stamp(config);
            const batch = [
                {User: {Id: user}, Project: {Id: 10}, Role: {Id: role}},
                {User: {Id: user}, Project: {Id: 11}, Role: {Id: role}},
                {User: {Id: user}, Project: {Id: 12}, Role: {Id: role}}
            ];

            getActive.resolves([{Id: 10}, {Id: 11}, {Id: 12}]);
            batchCreate.resolves([{Id: 10}, {Id: 11}, {Id: 12}]);

            sut.create(user, project, role);
            return expect(batchCreate.calledWith(batch));
        });
    });

    describe("assign", function () {
        it("should return a rejected promise when both project and user name are not valid", function () {
            const sut = factory(config);
            const getId = sinon.stub(sut, "getId");

            getId.resolves(undefined);

            return expect(sut.assign(undefined, "Project", "Role")).to.be.rejected;
        });

        it("should eventually remove prior assignments and create new ones", function () {
            const sut = factory(config);
            const unassign = sinon.stub(sut, "unassign");
            const create = sinon.stub(sut, "create");

            unassign.withArgs(1, 2).resolves({});
            create.resolves({});

            sut.assign(1, 2, 3);
            return expect(unassign.calledWith(1, 2) && create.calledWith(1, 2, 3));
        });
    });
});
