"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ble = exports.answer = undefined;
exports.sayHello = sayHello;

var _MegaBleClient = require("./ble/MegaBleClient.js");

var _MegaBleClient2 = _interopRequireDefault(_MegaBleClient);

var _MegaBleScanner = require("./ble/MegaBleScanner.js");

var _MegaBleScanner2 = _interopRequireDefault(_MegaBleScanner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sayHello() {
  console.log('Hello plugin!');
}

var answer = exports.answer = 42;

var ble = exports.ble = {
  MegaBleClient: _MegaBleClient2.default,
  MegaBleScanner: _MegaBleScanner2.default
};