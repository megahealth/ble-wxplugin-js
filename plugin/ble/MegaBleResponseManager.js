"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MegaBleConst = require("./MegaBleConst.js");

var _MegaBleBigDataManager = require("./MegaBleBigDataManager.js");

var _MegaBleBigDataManager2 = _interopRequireDefault(_MegaBleBigDataManager);

var _MegaUtils = require("./MegaUtils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STEP_BIND_OK = 1;
var STEP_READ_DEVICE_INFO = 2;
var STEP_SET_TIME = 3;
var STEP_SET_USERINFO = 4;
var STEP_IDLE = 5;

var PERIOD_HEART_BEAT = 15;
var PERIOD_READ_RSSI = 9;

var genStepList = function genStepList() {
  return [{ sn: STEP_BIND_OK }, { sn: STEP_READ_DEVICE_INFO }, { sn: STEP_SET_TIME }, { sn: STEP_SET_USERINFO }, { sn: STEP_IDLE }];
};

var MegaBleResponseManager = function () {
  function MegaBleResponseManager(api, callback) {
    _classCallCheck(this, MegaBleResponseManager);

    this.api = api;
    this.callback = callback;

    this.loopManager = null;
    this.bigDataManager = null;

    this.stepList = genStepList();
  }

  _createClass(MegaBleResponseManager, [{
    key: "handleIndicateResponse",
    value: function handleIndicateResponse(a) {
      console.log('onIndicate <- ' + (0, _MegaUtils.u8s2hex)(a));
      var cmd = a[0],
          status = a[2];
      this.callback.onOperationStatus(cmd, status);

      switch (cmd) {
        case _MegaBleConst.CMD.FAKEBIND:
          if (status === 0) {
            this._handleBind(a);
          }
          break;

        case _MegaBleConst.CMD.SETTIME:
          if (status === 0) {
            var t = a[3] << 24 | a[4] << 16 | a[5] << 8 | a[6];
            console.log('setTime respond time: ' + t);
          }
          this._next();
          break;

        case _MegaBleConst.CMD.SETUSERINFO:
          this._next();
          break;

        case _MegaBleConst.CMD.LIVECTRL:
        case _MegaBleConst.CMD.MONITOR:
        case _MegaBleConst.CMD.FINDME:
          this.callback.onOperationStatus(cmd, status);
          break;

        case _MegaBleConst.CMD.CRASHLOG:
          this.callback.onCrashLogReceived(a);
          break;

        case _MegaBleConst.CMD.V2_GET_MODE:
          if (status === 0) {
            var duration = a[3] == 1 || a[3] == 2 ? a[4] << 24 | a[5] << 16 | a[6] << 8 | a[7] : 0;
            this.callback.onV2ModeReceived({ mode: a[3], duration: duration });
          }
          break;

        case _MegaBleConst.CMD.SYNCDATA:
          this._handleSyncData(cmd, status, a);
          break;

        case _MegaBleConst.CMD.CTRL_MONITOR_DATA:
        case _MegaBleConst.CMD.CTRL_MONITOR_DATA:
          if (this.bigDataManager) this.bigDataManager.handleCtrlIndicate(a);
          break;

        case _MegaBleConst.CMD.V2_MODE_ECG_BP:
        case _MegaBleConst.CMD.V2_MODE_SPORT:
        case _MegaBleConst.CMD.V2_MODE_DAILY:
        case _MegaBleConst.CMD.V2_MODE_LIVE_SPO:
          this.callback.onOperationStatus(cmd, status);
          break;

        case _MegaBleConst.CMD.V2_GET_BOOTUP_TIME:
          if (status == 0) {
            var _t = a[3] << 24 | a[4] << 16 | a[5] << 8 | a[6];
            console.log("device bootup time: " + _t);
            this.callback.onV2BootupTimeReceived(_t);
          }
          break;

        case _MegaBleConst.CMD.NOTIBATT:
          if (status == 0) {
            if (a.length >= 7) this.callback.onBatteryChangedV2(a[3], a[4], a[5] << 16 | a[6] << 8 | a[7]);
          }
          break;

        case _MegaBleConst.CMD.HEARTBEAT:
          this.callback.onHeartBeatReceived({ version: a[3], battPercent: a[4], deviceStatus: a[5], mode: a[6], recordStatus: a[7], periodMonitorStatus: a[8] });
          break;

        case _MegaBleConst.CMD.V2_PERIOD_MONITOR_SET:
          this.callback.onOperationStatus(cmd, status);
          break;

        case _MegaBleConst.CMD.V2_GET_PERIOD_SETTING:
          this.callback.onOperationStatus(cmd, status);
          if (status == 0) {
            var maxTime = (0, _MegaUtils.byte4ToInt)([bytes[9], bytes[10], bytes[11], bytes[12]]);
            this.callback.onV2PeriodSettingReceived({ status: a[3], periodType: a[4], h: a[5], m: a[6], s: a[7], maxTime: maxTime });
          }
          break;

        case _MegaBleConst.CMD.V2_PERIOD_MONITOR_ENSURE:
          this.callback.onOperationStatus(cmd, status);
          if (status == 0) this.callback.onV2PeriodEnsureResponsed(a);
          break;

        case _MegaBleConst.CMD.V2_PERIOD_MONITOR_INDIC:
          this.callback.onV2PeriodReadyWarning(a);
          break;

        default:
          break;
      }
    }
  }, {
    key: "handleNotifyResponse",
    value: function handleNotifyResponse(a) {
      switch (a[0]) {
        case _MegaBleConst.CMD.LIVECTRL:
          // 2018-10-10 15:00:40 加入实时的log采集
          // 原因：观察到的现象是实时值偶尔会不过来。需要查出究竟是sdk没记，还是值没过来
          console.log("notify comes [live]: " + (0, _MegaUtils.u8s2hex)(a));
          this._dispatchV2Live(this.callback, a);
          break;
        case _MegaBleConst.CMD.NOTIBATT:
          this.callback.onBatteryChanged(a[3], a[4]);
          break;

        default:
          if (this.bigDataManager) this.bigDataManager.handleNotify(a);
          break;
      }
    }
  }, {
    key: "handleReadResponse",
    value: function handleReadResponse(a) {
      console.log('onRead: ' + (0, _MegaUtils.u8s2hex)(a));
      var deviceInfo = (0, _MegaUtils.parseRead)(a);
      console.log(deviceInfo);
      this.callback.onDeviceInfoUpdated(deviceInfo);

      this._next();
    }
  }, {
    key: "handleDisconnect",
    value: function handleDisconnect() {
      if (this.loopManager) {
        this.loopManager.clearLoop();
        this.loopManager = null;
      }
    }
  }, {
    key: "_next",
    value: function _next() {
      var _this = this;

      if (this.stepList.length === 0) return;
      var step = this.stepList.shift();

      switch (step.sn) {
        case STEP_BIND_OK:
          this.loopManager = new LoopManager({
            onSendHeartBeat: function onSendHeartBeat() {
              return _this.api.sendHeartBeat();
            }
          });
          this._next();
          break;
        case STEP_READ_DEVICE_INFO:
          this.api.readDeviceInfo();
          break;
        case STEP_SET_TIME:
          this.api.setTime();
          break;
        case STEP_SET_USERINFO:
          this.callback.onSetUserInfo();
          break;
        case STEP_IDLE:
          this.callback.onIdle();
          break;
        default:
          break;
      }
    }
  }, {
    key: "_handleSyncData",
    value: function _handleSyncData(cmd, status, a) {
      var _this2 = this;

      this.callback.onOperationStatus(cmd, status);
      if (status === 0) {
        // permit to transmit
        console.log("Trans permission [yes]...");
        this.bigDataManager = new _MegaBleBigDataManager2.default({
          writeReportPack: function writeReportPack(pack) {
            _this2.api.writeReportPack(pack);
          },
          onProgress: function onProgress(progress) {
            _this2.callback.onSyncingDataProgress(progress);
          },
          onMonitorDataComplete: function onMonitorDataComplete(bytes, dataStopType, dataType) {
            _this2.callback.onSyncMonitorDataComplete(bytes, dataStopType, dataType);
          },
          onDailyDataComplete: function onDailyDataComplete(bytes) {
            _this2.callback.onSyncDailyDataComplete(bytes);
          },
          syncMonitorData: function syncMonitorData() {
            return _this2.api.syncMonitorData();
          },
          syncDailyData: function syncDailyData() {
            return _this2.api.syncDailyData();
          }
        });
        this.bigDataManager.handleTransmitPermited(a);
      } else {
        this.bigDataManager = null;
        if (status === 2) {
          console.log("Trans permission [no], no data.");
          if (a[5] === 0 || a[5] === _MegaBleConst.CMD.CTRL_DAILY_DATA) {
            this.callback.onSyncNoDataOfDaily();
          } else if (a[5] == _MegaBleConst.CMD.CTRL_MONITOR_DATA) {
            this.callback.onSyncNoDataOfMonitor();
          }
        }
      }
    }
  }, {
    key: "_handleBind",
    value: function _handleBind(a) {
      switch (a[3]) {
        case 0:
          // receive token
          this.callback.onTokenReceived([a[4], a[5], a[6], a[7], a[8], a[9]].join(','));
          this._next();
          break;

        case 1:
          // already bound
          this._next();
          break;

        case 2:
          this.callback.onKnockDevice();
          break;

        case 3:
          // low power
          this.callback.onOperationStatus(cmd, _MegaBleConst.STATUS.STATUS_LOWPOWER);
          break;

        case 4:
          // userInfo not match
          this.callback.onEnsureBindWhenTokenNotMatch(); // 默认先确保能连
          break;

        default:
          this.callback.onError(_MegaBleConst.STATUS.ERROR_BIND);
          break;
      }
    }
  }, {
    key: "_dispatchV2Live",
    value: function _dispatchV2Live(megaBleCallback, a) {
      if (!megaBleCallback) return;
      switch (a[2]) {
        case 0:
          megaBleCallback.onLiveDataReceived({ spo: a[3], hr: a[4], status: a[5] }); // spo, hr, flag | a[3]  a[4] a[5]
          break;
        case 0x01:
          megaBleCallback.onV2LiveSleep({ status: a[3], spo: a[4], pr: a[5], duration: a[6] << 24 | a[7] << 16 | a[8] << 8 | a[9] });
          break;
        case 0x02:
          megaBleCallback.onV2LiveSport({ status: a[3], pr: a[4], duration: a[5] << 24 | a[6] << 16 | a[7] << 8 | a[8] });
          break;
        case 0x03:
          break;
        case 0x04:
          megaBleCallback.onV2LiveSpoMonitor({ status: a[3], spo: a[4], pr: a[5] });
          break;
        default:
          break;
      }
    }
  }]);

  return MegaBleResponseManager;
}();

/**
 * LoopManager 心跳，读场强，等循环管理器
 */


var LoopManager = function () {
  function LoopManager(loopCallback) {
    _classCallCheck(this, LoopManager);

    this.loopCallback = loopCallback;
    this.loopArr = [];
    this.startLoop();
  }

  _createClass(LoopManager, [{
    key: "startLoop",
    value: function startLoop() {
      var _this3 = this;

      if (this.loopArr.length != 0) return;
      var t1 = setInterval(function () {
        _this3.loopCallback.onSendHeartBeat();
      }, 15000);

      // let t2 = setInterval(() => {
      //   this.loopCallback.onReadRssi()
      // }, PERIOD_READ_RSSI);

      this.loopArr.push(t1);
    }
  }, {
    key: "clearLoop",
    value: function clearLoop() {
      this.loopArr.forEach(function (i) {
        return clearInterval(i);
      });
      this.loopArr.length = 0;
    }
  }]);

  return LoopManager;
}();

exports.default = MegaBleResponseManager;