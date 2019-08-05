"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MegaUtils = require("./MegaUtils.js");

var _MegaBleConst = require("./MegaBleConst.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CRC_LEN = 2;
var PAYLOAD_LEN = 19;

var MegaBleBigDataManager = function () {
  function MegaBleBigDataManager(iDataCallback) {
    _classCallCheck(this, MegaBleBigDataManager);

    this.totalBytes = [];
    this.subSnMap = {};
    this.totalLen = 0;
    this.subLen = 0;
    this.mReportPack = [];
    this.mReportPackMissPack = [];
    this.ver = [];
    this.stopType = 0;
    this.dataType = 0;

    this.iDataCallback = iDataCallback;
  }

  _createClass(MegaBleBigDataManager, [{
    key: "handleTransmitPermited",
    value: function handleTransmitPermited(a) {
      this.ver = [a[3], a[6], 0, 0];
      this.stopType = a[4];
      this.dataType = a[6];
    }
  }, {
    key: "handleCtrlIndicate",
    value: function handleCtrlIndicate(a) {
      if (a[2] == 0) {
        // 一大包开始了
        this.totalLen = a[3] << 24 | a[4] << 16 | a[5] << 8 | a[6];
        this.subLen = a[7] << 8 | a[8];
        console.log("Total length: " + this.totalLen + ", sub length: " + this.subLen);
        this.subSnMap = {};
        this.mReportPackMissPack = new Uint8Array(16);
      } else if (a[2] == 1) {
        // 一包传完了，开始检查，有无漏包
        var refNum = Math.ceil((this.subLen + CRC_LEN) / PAYLOAD_LEN);
        var missedNum = refNum - Object.keys(this.subSnMap).length;
        this.mReportPack = new Uint8Array(20);
        this.mReportPack[0] = a[0];
        this.mReportPack[1] = a[1];

        missedNum === 0 ? this.handleNoMiss(a) : this.handleMiss(missedNum);
      }
    }
  }, {
    key: "handleNotify",
    value: function handleNotify(a) {
      if (!this.mReportPackMissPack) {
        console.log('Big data receive warning: Notify comes ahead of indicate, app_report_pack_misspart has not been initiated');
        return;
      }
      var sn = a[0];
      if (!this.subSnMap.hasOwnProperty(sn)) {
        this.subSnMap[sn] = a.subarray(1);
        this.mReportPackMissPack[Math.floor(sn / 8)] |= 1 << sn % 8;
      }
    }
  }, {
    key: "handleNoMiss",
    value: function handleNoMiss(a) {
      var _this = this;

      var length = Object.keys(this.subSnMap).length;
      var rawSub = [];
      for (var i = 0; i < length; i++) {
        rawSub = rawSub.concat(Array.from(this.subSnMap[i]));
      }
      rawSub.splice(this.subLen + 2);
      var crcBytes = rawSub.splice(-2); // rawSub now has no crc bytes
      var bleCrc = crcBytes[1] | crcBytes[0] << 8;
      var myCrc = (0, _MegaUtils.crc16XModem)(rawSub);

      console.log("blecrc: " + bleCrc + ", mycrc: " + myCrc);
      if (myCrc === bleCrc) {
        // crc一致
        this.mReportPack[2] = 1; // 1 ：续传；0：丢包重传、crc错误重传
        this.iDataCallback.writeReportPack(this.mReportPack);

        // 将已收到的搜集起来
        this.totalBytes = this.totalBytes.concat(rawSub);
        if (this.totalLen <= 0) return;
        var progress = Math.floor(this.totalBytes.length * 100 / this.totalLen);
        this.iDataCallback.onProgress(progress);
        console.log("receiving data, progress " + progress);

        if (this.totalLen > 0 && this.totalLen == this.totalBytes.length) {
          // transmit complete
          var finalBytes = this.ver.concat(this.totalBytes);
          if (a[0] == _MegaBleConst.CMD.CTRL_MONITOR_DATA) {
            this.iDataCallback.onMonitorDataComplete(finalBytes, this.stopType, this.dataType); // 继续请求看ble有没有 运动/日常 数据了。
            setTimeout(function () {
              return _this.iDataCallback.syncMonitorData();
            }, 1200);
          } else if (a[0] == _MegaBleConst.CMD.CTRL_DAILY_DATA) {
            var timestampBytes = (0, _MegaUtils.intToByte4)(Math.floor(Date.now() / 1000));
            var dailyBytes = timestampBytes.concat(finalBytes);
            this.iDataCallback.onDailyDataComplete(dailyBytes);
            setTimeout(function () {
              return _this.iDataCallback.syncDailyData();
            }, 1200);
          }
        }
      } else {
        // crc不一致
        console.error('crc wrong!');
        this.mReportPack[2] = 0;
        this.mReportPack[3] = 0xff;
        this.iDataCallback.writeReportPack(this.mReportPack);
      }
    }
  }, {
    key: "handleMiss",
    value: function handleMiss(miss) {
      this.mReportPack[2] = 0; //1 ：续传；0：丢包重传、crc错误重传
      this.mReportPack[3] = miss;
      this.mReportPack.set(this.mReportPackMissPack, 4);
      this.iDataCallback.writeReportPack(this.mReportPack);
    }
  }]);

  return MegaBleBigDataManager;
}();

exports.default = MegaBleBigDataManager;