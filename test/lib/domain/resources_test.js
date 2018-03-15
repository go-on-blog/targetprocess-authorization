/*jslint
    es6, this
*/
"use strict";

const {after, before, describe, it} = require("mocha");

describe("resources", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const resources = require("../../../lib/domain/resources");
    const credentials = require("../../credentials");
    const stampit = require("@stamp/it");
    var projectName;
    var projectId;
    var bugName;
    var bugIds = [];

    chai.use(chaiAsPromised);

    this.timeout(5000);

    before(function () {
        const tp = require("targetprocess-api")(credentials);

        function addBug(projectId, name) {
            return tp.create("Bugs", {"Project": {"Id": projectId}, "Name": name}).then(function (item) {
                bugIds.push(item.Id);
                return item;
            });
        }

        projectName = Math.random().toString(36).replace(/[^a-z]+/g, "");
        bugName = Math.random().toString(36).replace(/[^a-z]+/g, "");
        return tp.create("Projects", {"Name": projectName}).then(function (item) {
            const when = require("when");

            projectId = item.Id;
            return when.all(addBug(projectId, bugName), addBug(projectId, bugName));
        });
    });

    describe("getId", function () {
        it("should return a fulfilled promise when the name includes a single quote", function () {
            const projects = stampit().props({resource: "Projects"});
            const factory = stampit(resources, projects);
            const sut = factory(credentials);
            const hasQuote = "isn't it";

            return expect(sut.getId(hasQuote)).to.be.fulfilled;
        });

        it("should return null when no resource of that name is found", function () {
            // Not finding the expected resource should not be considered as an
            // exceptional situation. For instance, a user may have deleted the
            // resource on purpose. So we don't reject the promise but return
            // a failure value (null).
            // See https://github.com/domenic/promises-unwrapping/blob/master/docs/writing-specifications-with-promises.md#rejections-should-be-used-for-exceptional-situations
            const projects = stampit().props({resource: "Projects"});
            const factory = stampit(resources, projects);
            const sut = factory(credentials);
            const doesNotExist = Math.random().toString(36).replace(/[^a-z]+/g, "");

            return expect(sut.getId(doesNotExist)).to.eventually.be.null;
        });

        it("should return a number when one single resource of that name is found", function () {
            const projects = stampit().props({resource: "Projects"});
            const factory = stampit(resources, projects);
            const sut = factory(credentials);

            return expect(sut.getId(projectName))
                .to.eventually.be.a("number")
                .and.to.equal(projectId);
        });

        it("should return an array of numbers when multiple resources of that name are found", function () {
            const bugs = stampit().props({resource: "Bugs"});
            const factory = stampit(resources, bugs);
            const sut = factory(credentials);

            return expect(sut.getId(bugName))
                .to.eventually.be.an("array")
                .and.to.have.lengthOf(2)
                .and.to.have.members(bugIds);
        });

    });

    after(function () {
        const tp = require("targetprocess-api")(credentials);
        const when = require("when");

        return when.all(
            tp.remove("Bugs", bugIds[0]),
            tp.remove("Bugs", bugIds[1]),
            tp.remove("Projects", projectId)
        );
    });
});
