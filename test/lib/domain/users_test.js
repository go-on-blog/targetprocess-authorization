/*jslint
    es6, this
*/
"use strict";

const {describe, it} = require("mocha");

describe("users", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/users");
    const credentials = require("../../credentials");

    chai.use(chaiAsPromised);

    describe("getId", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retrieve = require("targetprocess-api/retrieve")(Object.assign({request, resource: "Users"}, credentials));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retrieve}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should return the user id matching the specified last name", function () {
            const lastName = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Users/`,
                qs: {
                    token: credentials.token,
                    where: `LastName eq '${lastName}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getId(lastName))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });
    });
});
