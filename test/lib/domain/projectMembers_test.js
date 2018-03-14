/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("projectMembers", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const factory = require("../../../lib/domain/projectMembers");
    const {domain, token} = require("../../credentials");
    const sut = factory(domain, token);

    chai.use(chaiAsPromised);

    describe("show", function () {
        it("should return a ProjectMembers object matching given user and project", function () {
            const userId = 1;
            const projectId = 2;

            return expect(sut.show(userId, projectId))
                .to.eventually.be.a("string");
        });
    });
});
