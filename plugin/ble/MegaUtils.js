"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.discoverServicesAndChs = exports.getDfuMac = exports.encryptToken = exports.encryptMac = exports.parseRead = exports.byte4ToInt = exports.intToByte4 = exports.crc16XModem = exports.u8s2hex = exports.userIdToBytes = exports.getMD5Bytes = exports.getRandomString = undefined;

var _MegaMD = require("./MegaMD5.js");

var _MegaMD2 = _interopRequireDefault(_MegaMD);

var _MegaAes = require("./MegaAes.js");

var _MegaAes2 = _interopRequireDefault(_MegaAes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var byteToBits = function byteToBits(octet) {
  var bits = [];
  for (var i = 7; i >= 0; i--) {
    var bit = octet & 1 << i ? 1 : 0;
    bits.push(bit);
  }
  return bits;
};

var getRandomString = exports.getRandomString = function getRandomString(size) {
  var s = 'zxcvbnmlkjhgfdsaqwertyuiopQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
  var str = '';
  for (var i = 0; i < size; i++) {
    str += s.charAt(Math.floor(Math.random() * 62));
  }
  return str;
};

var getMD5Bytes = exports.getMD5Bytes = function getMD5Bytes(s) {
  var hash = (0, _MegaMD2.default)(s);
  var arr = [];
  for (var i = 0; i < hash.length;) {
    arr.push(parseInt(hash.slice(i, i + 2), 16));
    i += 2;
  }
  return arr;
};

var userIdToBytes = exports.userIdToBytes = function userIdToBytes(userId) {
  var a = [];
  for (var i = 0; i < 12; i++) {
    a.push(parseInt(userId.slice(i * 2, i * 2 + 2), 16));
  }
  return a;
};

var u8s2hex = exports.u8s2hex = function u8s2hex(u8s) {
  var hexArr = Array.prototype.map.call(u8s, function (bit) {
    return ('00' + bit.toString(16)).slice(-2);
  });
  return hexArr.join(' ');
};

// a: array
var crc16XModem = exports.crc16XModem = function crc16XModem(a) {
  var crc = 0x00; // crc需要可变
  var polynomial = 0x1021;
  a.forEach(function (b) {
    for (var i = 0; i < 8; i++) {
      var bit = (b >> 7 - i & 1) == 1;
      var c15 = (crc >> 15 & 1) == 1;
      crc <<= 1;
      if (c15 ^ bit) crc ^= polynomial;
    }
  });
  crc &= 0xffff;
  return crc;
};

var intToByte4 = exports.intToByte4 = function intToByte4(a) {
  return [a & 0x000000ff, (a & 0x0000ff00) >> 8, (a & 0x00ff0000) >> 16, (a & 0xff000000) >> 24];
};

var byte4ToInt = exports.byte4ToInt = function byte4ToInt(a) {
  return a[3] << 24 | a[2] << 16 | a[1] << 8 | a[0];
};

var parseRead = exports.parseRead = function parseRead(a) {
  var RING_SN_TYPE = { 0: "P11A", 1: "P11B", 2: "P11C", 3: "P11D", 7: "P11T", 4: "E11D" };
  var hw1 = (a[0] & 0xf0) >> 4;
  var hw2 = a[0] & 0x0f;
  var fw1 = (a[1] & 0xf0) >> 4;
  var fw2 = a[1] & 0x0f;
  var fw3 = a[2] << 8 | a[3];
  var bl1 = (a[4] & 0xf0) >> 4;
  var bl2 = a[4] & 0x0f;

  var sn = '0000';
  if (a[5] !== 0) {
    var tName = RING_SN_TYPE[a[10] & 0x07] || "0000";
    if (tName != 'P11T') tName += a[10] >> 3 & 0x0f;
    sn = tName + ((a[5] * 100 + a[6]) * 1000000 + (a[7] << 16 | a[8] << 8 | a[9]));
  }

  var GSENSOR_4404_FLAG = byteToBits(a[11]).reverse(); // xyz
  var x = GSENSOR_4404_FLAG[0];
  var y = GSENSOR_4404_FLAG[1];
  var z = GSENSOR_4404_FLAG[2];
  var t = GSENSOR_4404_FLAG[3];
  var deviceCheck = "I2C[" + (x != 0 ? "y" : "n") + "] " + "GS[" + (y != 0 ? "y" : "n") + "] " + "4404[" + (z != 0 ? "y" : "n") + "] " + "BQ[" + (t != 0 ? "y" : "n") + "] ";
  var runFlag = a[12] === 0 ? "off" : a[12] === 1 ? "on" : "pause";
  var isRunning = a[12] != 0;

  var hwVer = hw1 + "." + hw2;
  var fwVer = fw1 + "." + fw2 + "." + fw3;
  var blVer = bl1 + "." + bl2;
  var otherInfo = "HW: v" + hwVer + " BL: v" + blVer + " hwCheck: " + deviceCheck + " run: " + runFlag;

  return { otherInfo: otherInfo, hwVer: hwVer, fwVer: fwVer, blVer: blVer, sn: sn, isRunning: isRunning };
};

var macToBytes = function macToBytes(mac) {
  return mac.split(':').map(function (i) {
    return +('0x' + i);
  });
};
var tokenToBytes = function tokenToBytes(token) {
  return token.split(',').map(function (i) {
    return +i;
  });
};

var _encrypt = function _encrypt(a) {
  var preparedKey = [a[0], a[1], a[2], a[3], a[4], a[5], 'M'.charCodeAt(), 'e'.charCodeAt(), 'g'.charCodeAt(), 'a'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt()];
  var preparedContent = [a[0], a[1], a[2], a[3], a[4], a[5], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var aesEcb = new _MegaAes2.default.ModeOfOperation.ecb(preparedKey);
  var encryptedBytes = aesEcb.encrypt(preparedContent);
  return Array.from(encryptedBytes).slice(-5); // aes mac完，取后x位
};

var encryptMac = exports.encryptMac = function encryptMac(mac) {
  return _encrypt(macToBytes(mac));
};
var encryptToken = exports.encryptToken = function encryptToken(token) {
  return _encrypt(tokenToBytes(token));
};

var getDfuMac = exports.getDfuMac = function getDfuMac(mac) {
  return mac.slice(0, -2) + ('0x00' + (+("0x" + mac.slice(-2)) + 1).toString(16)).slice(-2).toUpperCase().slice(-2);
};

var discoverServicesAndChs = exports.discoverServicesAndChs = function discoverServicesAndChs(deviceId) {
  return new Promise(function (resolve, reject) {
    wx.getBLEDeviceServices({
      deviceId: deviceId,
      success: function success(res) {
        var arr = [];
        for (var i = 0; i < res.services.length; i++) {
          var service = res.services[i];
          console.log(service);
          if (service.isPrimary) {
            arr.push(discoverChs(deviceId, service.uuid));
          }
        }
        Promise.all(arr).then(function (res1) {
          return resolve(res1);
        }).catch(function (err) {
          return reject(err);
        });
      },
      fail: function fail(err) {
        return reject(err);
      }
    });
  });
};

var discoverChs = function discoverChs(deviceId, serviceId) {
  return new Promise(function (resolve, reject) {
    wx.getBLEDeviceCharacteristics({
      deviceId: deviceId, serviceId: serviceId,
      success: function success(res) {
        return resolve(res);
      },
      fail: function fail(err) {
        return reject(err);
      }
    });
  });
};