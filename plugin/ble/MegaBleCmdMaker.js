"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeHeartBeatCmd = exports.makeSyncDailyDataCmd = exports.makeSyncMonitorDataCmd = exports.makeV2EnableModeSpoMonitor = exports.makeV2EnableModeDaily = exports.makeV2EnableModeLiveSpo = exports.makeLiveCmd = exports.makeMonitorCmd = exports.makeUserInfoCmd = exports.makeSetTimeCmd = exports.makeBindMasterCmd = exports.makeBindTokenCmd = exports.makeBindMacCmd = undefined;

var _MegaUtils = require("./MegaUtils.js");

var _MegaBleConst = require("./MegaBleConst.js");

var STATUS_CLIENT = 0; // android

var makeBindMacCmd = exports.makeBindMacCmd = function makeBindMacCmd(userId, mac) {
  var a = _initPack(_MegaBleConst.CMD.FAKEBIND);
  var userIdBytes = (0, _MegaUtils.userIdToBytes)(userId); // 3 + 12 bytes
  a.set(userIdBytes, 3);
  a.set((0, _MegaUtils.encryptMac)(mac), 15);
  return a;
};

var makeBindTokenCmd = exports.makeBindTokenCmd = function makeBindTokenCmd(userId, token) {
  var a = _initPack(_MegaBleConst.CMD.FAKEBIND);
  var userIdBytes = (0, _MegaUtils.userIdToBytes)(userId); // 3 + 12 bytes
  a.set(userIdBytes, 3);
  a.set((0, _MegaUtils.encryptToken)(token), 15);
  return a;
};

var makeBindMasterCmd = exports.makeBindMasterCmd = function makeBindMasterCmd() {
  var a = _initPack(_MegaBleConst.CMD.FAKEBIND);
  var s = (0, _MegaUtils.getRandomString)(12); // 生成12个字符
  var arr5 = (0, _MegaUtils.getMD5Bytes)(s).slice(-5); // 根据字符串生成hash，去前5个字节
  a.set(s.split('').map(function (i) {
    return i.charCodeAt();
  }), 3); // 填充12个字符
  a.set(arr5, 15);
  return a;
};

var makeSetTimeCmd = exports.makeSetTimeCmd = function makeSetTimeCmd() {
  var t = Math.floor(Date.now() / 1000);
  var a = _initPack(_MegaBleConst.CMD.SETTIME);
  a[3] = (t & 0xff000000) >> 24;
  a[4] = (t & 0x00ff0000) >> 16;
  a[5] = (t & 0x0000ff00) >> 8;
  a[6] = t & 0x000000ff;
  return a;
};

var makeUserInfoCmd = exports.makeUserInfoCmd = function makeUserInfoCmd(age, gender, height, weight, stepLength) {
  var a = _initPack(_MegaBleConst.CMD.SETUSERINFO);
  a[3] = age; // age 25
  a[4] = gender; // gender 0/1
  a[5] = height; // height 170
  a[6] = weight; // weight 60
  a[7] = stepLength; // step length 0
  return a;
};

var makeMonitorCmd = exports.makeMonitorCmd = function makeMonitorCmd(enable) {
  var a = _initPack(_MegaBleConst.CMD.MONITOR);
  a[1] = enable ? _MegaBleConst.CMD.CTRL_MONITOR_ON : _MegaBleConst.CMD.CTRL_MONITOR_OFF;
  a[3] = enable ? _MegaBleConst.CMD.CTRL_MONITOR_ON : _MegaBleConst.CMD.CTRL_MONITOR_OFF;
  return a;
};

var makeLiveCmd = exports.makeLiveCmd = function makeLiveCmd(enable) {
  var a = _initPack(_MegaBleConst.CMD.LIVECTRL);
  a[1] = enable ? _MegaBleConst.CMD.CTRL_LIVE_START : _MegaBleConst.CMD.CTRL_LIVE_STOP;
  a[3] = enable ? _MegaBleConst.CMD.CTRL_LIVE_START : _MegaBleConst.CMD.CTRL_LIVE_STOP;
  return a;
};

var makeV2EnableModeLiveSpo = exports.makeV2EnableModeLiveSpo = function makeV2EnableModeLiveSpo(ensure, t) {
  var a = _initPack(_MegaBleConst.CMD.V2_MODE_LIVE_SPO);
  a[3] = ensure ? 'S'.charCodeAt() : 0;
  a[4] = (t & 0xff000000) >> 24;
  a[5] = (t & 0x00ff0000) >> 16;
  a[6] = (t & 0x0000ff00) >> 8;
  a[7] = t & 0x000000ff;
  return a;
};

var makeV2EnableModeDaily = exports.makeV2EnableModeDaily = function makeV2EnableModeDaily(ensure, t) {
  var a = _initPack(_MegaBleConst.CMD.V2_MODE_DAILY);
  a[3] = ensure ? 'S'.charCodeAt() : 0;
  a[4] = (t & 0xff000000) >> 24;
  a[5] = (t & 0x00ff0000) >> 16;
  a[6] = (t & 0x0000ff00) >> 8;
  a[7] = t & 0x000000ff;
  return a;
};

var makeV2EnableModeSpoMonitor = exports.makeV2EnableModeSpoMonitor = function makeV2EnableModeSpoMonitor(ensure, t) {
  var a = _initPack(_MegaBleConst.CMD.V2_MODE_SPO_MONITOR);
  a[1] = _MegaBleConst.CMD.V2_MODE_SPO_MONITOR; // 兼容陶瓷戒指
  a[3] = ensure ? 'S'.charCodeAt() : 0;
  a[4] = (t & 0xff000000) >> 24;
  a[5] = (t & 0x00ff0000) >> 16;
  a[6] = (t & 0x0000ff00) >> 8;
  a[7] = t & 0x000000ff;
  return a;
};

var makeSyncMonitorDataCmd = exports.makeSyncMonitorDataCmd = function makeSyncMonitorDataCmd() {
  var a = _initPack(_MegaBleConst.CMD.SYNCDATA);
  a[3] = _MegaBleConst.CMD.CTRL_MONITOR_DATA;
  return a;
};

var makeSyncDailyDataCmd = exports.makeSyncDailyDataCmd = function makeSyncDailyDataCmd() {
  var a = _initPack(_MegaBleConst.CMD.SYNCDATA);
  a[3] = _MegaBleConst.CMD.CTRL_DAILY_DATA;
  return a;
};

var makeHeartBeatCmd = exports.makeHeartBeatCmd = function makeHeartBeatCmd() {
  var a = _initPack(_MegaBleConst.CMD.HEARTBEAT);
  a[3] = 1;
  return a;
};

var _initPack = function _initPack(cmd) {
  var a = new Uint8Array(20);
  a[0] = cmd;
  a[1] = 0;
  a[2] = STATUS_CLIENT;
  return a;
};

var _initPackWithCtrl = function _initPackWithCtrl(cmd, ctrl) {
  var a = new Uint8Array(20);
  a[0] = cmd;
  a[1] = 0;
  a[2] = STATUS_CLIENT;
  a[3] = ctrl;
  return a;
};