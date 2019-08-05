"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MegaRequest = require("./MegaRequest.js");

var _MegaRequest2 = _interopRequireDefault(_MegaRequest);

var _MegaPako = require("./MegaPako.js");

var _MegaPako2 = _interopRequireDefault(_MegaPako);

var _MegaBleConst = require("./MegaBleConst.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import MegaBleClient from './MegaBleClient';

var UPLOAD_INTERVAL = 10; // s

var MegaBleRawdataManager = function () {
  function MegaBleRawdataManager() {
    _classCallCheck(this, MegaBleRawdataManager);

    this.cnt = 0;
    this.totalList = [];
    this.isFirstPayload = true;
    this.firstPayload = null;
    this.currentPayload = null;
    this.startTime = Date.now();
    this.isProcessing = false;
    this.taskTimeout = null;
    this.requestTask = null;
  }

  _createClass(MegaBleRawdataManager, [{
    key: "queue",
    value: function queue(a) {
      if (this.isFirstPayload) {
        this.isFirstPayload = false;
        this.firstPayload = a;
      }
      this.totalList.push(a);
      this.cnt++;
      this.currentPayload = a;

      if (!this.isProcessing) {
        this.processTask();
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.taskTimeout) clearTimeout(this.taskTimeout);
      if (this.requestTask) this.requestTask.abort();
    }
  }, {
    key: "getCount",
    value: function getCount() {
      return this.cnt;
    }
  }, {
    key: "getDuration",
    value: function getDuration() {
      return Math.floor((Date.now() - this.startTime) / 1000);
    }
  }, {
    key: "getBleCount",
    value: function getBleCount() {
      if (!this.firstPayload || !this.currentPayload) return -1;
      if (this.firstPayload.length < 20) return -1;

      var start = this.firstPayload[16] << 24 | this.firstPayload[17] << 16 | this.firstPayload[18] << 8 | this.firstPayload[19];

      var end = this.currentPayload[16] << 24 | this.currentPayload[17] << 16 | this.currentPayload[18] << 8 | this.currentPayload[19];

      return end - start;
    }

    /**
     * 执行上传rawdata等耗时的操作
     */

  }, {
    key: "processTask",
    value: function processTask() {
      if (this.isProcessing) return;
      var size = this.totalList.length;
      if (size <= 1) return;
      console.log('processTask...' + ~~(Date.now() / 1000));

      this.isProcessing = true;
      this.requestTask = _MegaRequest2.default.post('/rawdata', {
        rawdata: size === 2 ? 'start' : _MegaPako2.default.deflate(this.totalList.slice(0, size).reduce(function (a, b) {
          return a.concat(b);
        }), { to: 'string' }),
        appId: _MegaBleConst.Config.AppId,
        appKey: _MegaBleConst.Config.AppKey,
        timestamp: ~~(Date.now() / 1000)
      }, null, function (err) {
        return console.error(err);
      }, this._doAfterRequest(size === 2 ? 0 : size));
    }
  }, {
    key: "_completeTask",
    value: function _completeTask() {
      this.isProcessing = false;
      this.processTask();
    }
  }, {
    key: "_doAfterRequest",
    value: function _doAfterRequest(size) {
      var _this = this;

      this.totalList.splice(0, size);
      this.taskTimeout = setTimeout(function () {
        _this._completeTask();
      }, 10000);
    }
  }]);

  return MegaBleRawdataManager;
}();

exports.default = MegaBleRawdataManager;