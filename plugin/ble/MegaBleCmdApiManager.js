"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MegaBleConst = require("./MegaBleConst.js");

var _MegaUtils = require("./MegaUtils.js");

var _MegaBleCmdMaker = require("./MegaBleCmdMaker.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MegaBleCmdApiManager = function () {
  function MegaBleCmdApiManager(deviceId) {
    _classCallCheck(this, MegaBleCmdApiManager);

    this.deviceId = deviceId;
  }

  _createClass(MegaBleCmdApiManager, [{
    key: "enablePipes",
    value: function enablePipes() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._enablePipe(_MegaBleConst.BLE_CFG.CH_INDICATE, true).then(function (res1) {
          _this._enablePipe(_MegaBleConst.BLE_CFG.CH_NOTIFY, true).then(function (res2) {
            return resolve([res1, res2]);
          }).catch(function (err) {
            return reject(err);
          });
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }, {
    key: "_enablePipe",
    value: function _enablePipe(characteristicId, state) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        wx.notifyBLECharacteristicValueChange({
          deviceId: _this2.deviceId,
          serviceId: _MegaBleConst.BLE_CFG.SVC_ROOT,
          characteristicId: characteristicId,
          state: state,
          success: function success(res) {
            return resolve(res);
          },
          fail: function fail(err) {
            return reject(err);
          }
        });
      });
    }

    // 5837288dc59e0d00577c5f9a

  }, {
    key: "bindWithoutToken",
    value: function bindWithoutToken(userId, mac) {
      var a = (0, _MegaBleCmdMaker.makeBindMacCmd)(userId, mac);
      console.log('[cmd] bindWithoutToken -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "bindWithToken",
    value: function bindWithToken(userId, token) {
      var a = (0, _MegaBleCmdMaker.makeBindTokenCmd)(userId, token);
      console.log('[cmd] bindWithToken -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "bindWithMasterToken",
    value: function bindWithMasterToken() {
      var a = (0, _MegaBleCmdMaker.makeBindMasterCmd)();
      console.log('[cmd] bindWithMasterToken -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "setTime",
    value: function setTime() {
      var a = (0, _MegaBleCmdMaker.makeSetTimeCmd)();
      console.log("[cmd] setTime -> " + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "setUserInfo",
    value: function setUserInfo(age, gender, height, weight, stepLength) {
      var a = (0, _MegaBleCmdMaker.makeUserInfoCmd)(age, gender, height, weight, stepLength);
      console.log("[cmd] setUserInfo -> " + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "sendHeartBeat",
    value: function sendHeartBeat() {
      var a = (0, _MegaBleCmdMaker.makeHeartBeatCmd)();
      console.log('[cmd] sendHeartBeat -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 旧版开关监控
     * @param {*} enable 
     */

  }, {
    key: "enableMonitorV1",
    value: function enableMonitorV1(enable) {
      var a = (0, _MegaBleCmdMaker.makeMonitorCmd)(enable);
      console.log('[cmd] enableMonitorV1 -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 开关全局实时通道
     * @param {*} enable 
     */

  }, {
    key: "toggleLiveData",
    value: function toggleLiveData(enable) {
      var a = (0, _MegaBleCmdMaker.makeLiveCmd)(enable);
      console.log('[cmd] toggleLiveData -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 开关实时血氧仪模式
     * @param {*} ensure 
     * @param {*} seconds 
     */

  }, {
    key: "enableV2ModeLiveSpo",
    value: function enableV2ModeLiveSpo(ensure, seconds) {
      var a = (0, _MegaBleCmdMaker.makeV2EnableModeLiveSpo)(ensure, seconds);
      console.log('[cmd] enableV2ModeLiveSpo -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 1. 开关日常模式；开启此模式意味着关闭其他模式
     * 2. 默认模式
     * @param {*} ensure 
     * @param {*} seconds 
     */

  }, {
    key: "enableV2ModeDaily",
    value: function enableV2ModeDaily(ensure, seconds) {
      var a = (0, _MegaBleCmdMaker.makeV2EnableModeDaily)(ensure, seconds);
      console.log('[cmd] enableV2ModeDaily -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 开关监控
     * @param {*} ensure 
     * @param {*} seconds 
     */

  }, {
    key: "enableV2ModeSpoMonitor",
    value: function enableV2ModeSpoMonitor(ensure, seconds) {
      var a = (0, _MegaBleCmdMaker.makeV2EnableModeSpoMonitor)(ensure, seconds);
      console.log('[cmd] enableV2ModeSpoMonitor -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }

    /**
     * 收监控数据
     */

  }, {
    key: "syncMonitorData",
    value: function syncMonitorData() {
      var a = (0, _MegaBleCmdMaker.makeSyncMonitorDataCmd)();
      console.log('[cmd] syncMonitorData -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "syncDailyData",
    value: function syncDailyData() {
      var a = (0, _MegaBleCmdMaker.makeSyncDailyDataCmd)();
      console.log('[cmd] syncDailyData -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "writeReportPack",
    value: function writeReportPack(a) {
      console.log('[cmd] writeReportPack -> ' + (0, _MegaUtils.u8s2hex)(a));
      return this._write(a);
    }
  }, {
    key: "readDeviceInfo",
    value: function readDeviceInfo() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        wx.readBLECharacteristicValue({
          deviceId: _this3.deviceId,
          serviceId: _MegaBleConst.BLE_CFG.SVC_ROOT,
          characteristicId: _MegaBleConst.BLE_CFG.CH_READ,
          success: function success(res) {
            return resolve(res);
          },
          fial: function fial(err) {
            return reject(err);
          }
        });
      });
    }
  }, {
    key: "enableRawdata",
    value: function enableRawdata(state) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        wx.notifyBLECharacteristicValueChange({
          deviceId: _this4.deviceId,
          serviceId: _MegaBleConst.BLE_CFG.SCV_LOG,
          characteristicId: _MegaBleConst.BLE_CFG.CH_LOG_NOTIFY,
          state: state,
          success: function success(res) {
            return resolve(res);
          },
          fail: function fail(err) {
            return reject(err);
          }
        });
      });
    }
  }, {
    key: "startDfu",
    value: function startDfu() {
      var _this5 = this;

      wx.notifyBLECharacteristicValueChange({
        deviceId: this.deviceId,
        serviceId: _MegaBleConst.BLE_CFG.SVC_DFU,
        characteristicId: _MegaBleConst.BLE_CFG.CH_DFU_CTRL,
        state: true,
        success: function success() {
          setTimeout(function () {
            wx.writeBLECharacteristicValue({
              deviceId: _this5.deviceId,
              serviceId: _MegaBleConst.BLE_CFG.SVC_DFU,
              characteristicId: _MegaBleConst.BLE_CFG.CH_DFU_CTRL,
              value: new Uint8Array([1, 4]).buffer,
              success: function success(res) {
                return console.log(res);
              },
              fail: function fail(err) {
                return console.error(err);
              }
            });
          }, 1000);
        },
        fail: function fail(err) {
          return console.error(err);
        }
      });
    }
  }, {
    key: "_write",
    value: function _write(bytes) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        wx.writeBLECharacteristicValue({
          deviceId: _this6.deviceId,
          serviceId: _MegaBleConst.BLE_CFG.SVC_ROOT,
          characteristicId: _MegaBleConst.BLE_CFG.CH_WRITE,
          value: bytes.buffer,
          success: function success(res) {
            return resolve(res);
          },
          fail: function fail(err) {
            return reject(err);
          }
        });
      });
    }
  }]);

  return MegaBleCmdApiManager;
}();

exports.default = MegaBleCmdApiManager;