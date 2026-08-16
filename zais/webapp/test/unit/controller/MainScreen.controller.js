/*global QUnit*/

sap.ui.define([
	"zais/scm/zais/controller/MainScreen.controller"
], function (Controller) {
	"use strict";

	QUnit.module("MainScreen Controller");

	QUnit.test("I should test the MainScreen controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
