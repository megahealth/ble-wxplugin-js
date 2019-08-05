'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MegaBleScanner = function () {
  function MegaBleScanner(onDeviceFound) {
    _classCallCheck(this, MegaBleScanner);

    this.isScanning = false;
    this.onDeviceFound = onDeviceFound;
  }

  _createClass(MegaBleScanner, [{
    key: 'initBleAdapter',
    value: function initBleAdapter() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        wx.openBluetoothAdapter({
          // 蓝牙正常，再初始化回调
          success: function success(res) {
            _this._registCallback();
            resolve(res);
          },
          // 蓝牙有可能被关闭了，可以监听蓝牙开关情况，以便重新开始扫描
          fail: function fail(err) {
            return reject(err);
          }
        });
      });
    }
  }, {
    key: '_registCallback',
    value: function _registCallback() {
      var _this2 = this;

      wx.onBluetoothDeviceFound(function (res) {
        res.devices = res.devices.filter(function (i) {
          if (i.name && (i.name.toLowerCase().indexOf('ring') != -1 || i.name.toLowerCase().indexOf('sle') != -1)) return true;
          return false;
        });
        if (res.devices.length > 0) _this2.onDeviceFound(res);
      });
    }
  }, {
    key: 'scan',
    value: function scan() {
      var _this3 = this;

      console.log('scan start...');

      return new Promise(function (resolve, reject) {
        if (_this3.isScanning) {
          reject('isScanning');
          return;
        }
        _this3.isScanning = true;
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: true,
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
    key: 'stopScan',
    value: function stopScan() {
      if (this.isScanning) {
        wx.stopBluetoothDevicesDiscovery();
        console.log('scan stop!');
      }
      this.isScanning = false;
    }
  }]);

  return MegaBleScanner;
}();

exports.default = MegaBleScanner;