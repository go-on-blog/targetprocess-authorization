/*jslint
    es6, this
*/
"use strict";

const {describe, it} = require("mocha");

describe("projects", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/projects");
    const credentials = require("../../credentials");

    chai.use(chaiAsPromised);

    describe("getId", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retrieve = require("targetprocess-api/retrieve")(Object.assign({request, resource: "Projects"}, credentials));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retrieve}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should return the project id matching the specified name", function () {
            const name = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Projects/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${name}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getId(name))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });
    });
});
