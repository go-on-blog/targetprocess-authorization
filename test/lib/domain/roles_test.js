/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("roles", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/roles");
    const credentials = require("../../credentials");

    chai.use(chaiAsPromised);

    describe("getByName", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request, resource: "Roles"}, credentials));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should eventually return the role id matching the specified name", function () {
            const name = "Developer";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/Roles/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${name}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getByName(name))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });
    });
});
