"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _MegaBleCmdApiManager = require("./MegaBleCmdApiManager.js");

var _MegaBleCmdApiManager2 = _interopRequireDefault(_MegaBleCmdApiManager);

var _MegaBleResponseManager = require("./MegaBleResponseManager.js");

var _MegaBleResponseManager2 = _interopRequireDefault(_MegaBleResponseManager);

var _MegaBleRawdataManager = require("./MegaBleRawdataManager.js");

var _MegaBleRawdataManager2 = _interopRequireDefault(_MegaBleRawdataManager);

var _MegaBleConst = require("./MegaBleConst.js");

var _MegaUtils = require("./MegaUtils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import MegaDfu from "./MegaDfu";

var MegaBleClient = function () {
  function MegaBleClient(callback) {
    _classCallCheck(this, MegaBleClient);

    this.api = null;
    this.responseManager = null;
    this.rawdataManager = null;

    this.name = null;
    this.deviceId = null;
    this.isConnected = false;

    this.callback = callback;
  }
  // static _APPID
  // static _APPKEY

  // static init (appId, appKey) {
  //   this._APPID = appId
  //   this._APPKEY = appKey
  // }

  _createClass(MegaBleClient, [{
    key: "_initCallbacks",
    value: function _initCallbacks() {
      var _this = this;

      wx.onBluetoothAdapterStateChange(function (res) {
        _this.callback.onAdapterStateChange(res);
      });

      wx.onBLEConnectionStateChange(function (res) {
        if (res.deviceId === _this.deviceId) {
          if (!res.connected && _this.responseManager) {
            _this.clear();
          }

          _this.callback.onConnectionStateChange(res);
        }
      });

      wx.onBLECharacteristicValueChange(function (characteristic) {
        if (!_this.responseManager) return;
        if (characteristic.deviceId === _this.deviceId) {
          var a = new Uint8Array(characteristic.value);
          switch (characteristic.characteristicId) {
            case _MegaBleConst.BLE_CFG.CH_INDICATE:
              _this.responseManager.handleIndicateResponse(a);
              break;

            case _MegaBleConst.BLE_CFG.CH_NOTIFY:
              _this.responseManager.handleNotifyResponse(a);
              break;

            case _MegaBleConst.BLE_CFG.CH_READ:
              _this.responseManager.handleReadResponse(a);
              break;

            case _MegaBleConst.BLE_CFG.CH_LOG_NOTIFY:
              if (a[0] === 0x5b && _this.rawdataManager) {
                _this.rawdataManager.queue(Array.from(a));
                _this.callback.onRawdataCount(_this.rawdataManager.getCount(), _this.rawdataManager.getBleCount(), _this.rawdataManager.getDuration());
              }
              break;

            default:
              break;
          }
        }
      });
    }
  }, {
    key: "connect",
    value: function connect(name, deviceId, advertisData) {
      var _this2 = this;

      this.name = name;
      this.deviceId = deviceId;

      var adv = Array.from(new Uint8Array(advertisData));

      if (this.deviceId.length > 17) {
        this.realMac = adv.slice(2, 8).reverse().map(function (i) {
          return ('00' + i.toString(16)).slice(-2);
        }).join(':').toUpperCase();
      } else {
        this.realMac = this.deviceId;
      }

      console.log('will connect, realmac: ' + this.realMac);
      this._initCallbacks();

      return new Promise(function (resolve, reject) {
        wx.createBLEConnection({
          deviceId: _this2.deviceId,
          success: function success() {
            // connected ok; init services and characters
            (0, _MegaUtils.discoverServicesAndChs)(_this2.deviceId).then(function () {
              // 各服务初始化完成
              // init sdk
              _this2.api = new _MegaBleCmdApiManager2.default(_this2.deviceId);
              _this2.responseManager = new _MegaBleResponseManager2.default(_this2.api, _this2.callback);
              _this2.isConnected = true;
              _this2.callback.onDeviceInfoUpdated({ name: _this2.name, mac: _this2.realMac });

              _this2.api.enablePipes().then(function (res) {
                resolve(res);
              }).catch(function (err) {
                reject(err);
              });
            }).catch(function (err) {
              return reject(err);
            });
          },
          fail: function fail(err) {
            return reject(err);
          }
        });
      });
    }

    /**
     * normal api
     */

  }, {
    key: "startWithoutToken",
    value: function startWithoutToken(userId, mac) {
      return this.api.bindWithoutToken(userId, mac);
    }
  }, {
    key: "startWithToken",
    value: function startWithToken(userId, token) {
      return this.api.bindWithToken(userId, token);
    }
  }, {
    key: "startWithMasterToken",
    value: function startWithMasterToken() {
      return this.api.bindWithMasterToken();
    }
  }, {
    key: "setUserInfo",
    value: function setUserInfo(age, gender, height, weight, stepLength) {
      this.api.setUserInfo(age, gender, height, weight, stepLength);
    }
  }, {
    key: "enableMonitorV1",
    value: function enableMonitorV1(enable) {
      this.api.enableMonitorV1(enable);
    }
  }, {
    key: "toggleLive",
    value: function toggleLive(enable) {
      this.api.toggleLiveData(enable);
    }
  }, {
    key: "enableV2ModeLiveSpo",
    value: function enableV2ModeLiveSpo(ensure) {
      this.api.enableV2ModeLiveSpo(ensure, 0);
    }
  }, {
    key: "enableV2ModeDaily",
    value: function enableV2ModeDaily(ensure) {
      this.api.enableV2ModeDaily(ensure, 0);
    }
  }, {
    key: "enableV2ModeSpoMonitor",
    value: function enableV2ModeSpoMonitor(ensure) {
      this.api.enableV2ModeSpoMonitor(ensure, 0);
    }
  }, {
    key: "syncData",
    value: function syncData() {
      this.api.syncMonitorData();
    }
  }, {
    key: "enableRawdata",
    value: function enableRawdata() {
      if (this.rawdataManager) return;
      this.rawdataManager = new _MegaBleRawdataManager2.default();
      this.api.enableRawdata(true);
    }
  }, {
    key: "disableRawdata",
    value: function disableRawdata() {
      if (this.rawdataManager) {
        console.log("\u5305\u6570\u7EDF\u8BA1: app: " + this.rawdataManager.getCount() + ", ble: " + this.rawdataManager.getBleCount());
        this.rawdataManager.clear();
        this.rawdataManager = null;
        this.api.enableRawdata(false);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.responseManager) {
        this.responseManager.handleDisconnect();
        this.responseManager = null;
      }

      if (this.rawdataManager) {
        this.rawdataManager.clear();
        this.rawdataManager = null;
      }
      this.deviceId = null;
      this.isConnected = false;
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var _this3 = this;

      this.clear();

      return new Promise(function (resolve, reject) {
        if (!_this3.isConnected) {
          resolve();
          return;
        }
        wx.closeBLEConnection({
          deviceId: _this3.deviceId,
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
    key: "closeBluetoothAdapter",
    value: function closeBluetoothAdapter() {
      wx.closeBluetoothAdapter();
    }

    // start dfu
    // async startDfu(filePath) {
    //   const dfuManager = await this.initDfu(filePath)

    //   if (!this.name) return
    //   if (this.name.toLowerCase().indexOf('targ') != -1) {
    //     dfuManager.start()
    //     return
    //   }

    //   const dfuMac = getDfuMac(this.realMac)
    //   console.log('realmac dfuMac: ', this.realMac, dfuMac)

    //   this.api.startDfu() // will disconnect
    //   let timeout;
    //   const scanCallback = (res) => {
    //     res.devices = res.devices.filter(i => {
    //       if (i.name && i.name.toLowerCase().indexOf('dfu') != -1) {
    //         console.log('dfu scaning... ', i)

    //         const adv = Array.from(new Uint8Array(i.advertisData))
    //         const scannedMac = adv.slice(2, 8).reverse().map(i => ('00' + i.toString(16)).slice(-2)).join(':').toUpperCase()
    //         console.log('dfu scanned device: ', scannedMac)
    //         if (scannedMac === dfuMac) {
    //           clearTimeout(timeout)
    //           console.log('dfu find dfu device: ', scannedMac)
    //           wx.stopBluetoothDevicesDiscovery({
    //             success: () => {},
    //             fail: err => console.error(err),
    //             complete: () => {
    //               console.log('dfuConnect -> ' + dfuMac)
    //               this._dfuConnect(i.deviceId, dfuManager)
    //             }
    //           })
    //         }
    //       }
    //     })
    //   }
    //   wx.onBluetoothDeviceFound(scanCallback)

    //   wx.startBluetoothDevicesDiscovery({
    //     allowDuplicatesKey: false,
    //     success: res => {},
    //     fail: err => {},
    //   })
    //   timeout = setTimeout(() => {
    //     wx.stopBluetoothDevicesDiscovery()
    //     console.log('dfuConnect(after 10s), no dfu mac matched. execute backup dfu strategy.')
    //     // executeBackUpDfuStrategy
    //   }, 10000);
    // }

    // _dfuConnect(deviceId, dfuManager) {
    //   wx.createBLEConnection({
    //     deviceId,
    //     success: () => {
    //       discoverServicesAndChs(deviceId)
    //         .then(res => {
    //           console.log(res)
    //           dfuManager.setDeviceId(deviceId)
    //           dfuManager.start()
    //         })
    //         .catch(err => console.error(err))
    //     },
    //     fail: err => console.error(err)
    //   })
    // }

    // initDfu(filePath) {
    //   return new Promise((resolve, reject) => {
    //     const fileManager = wx.getFileSystemManager()
    //     const unzippedPath = wx.env.USER_DATA_PATH + '/dfu'
    //     fileManager.unzip({
    //         zipFilePath: filePath,
    //         targetPath: unzippedPath,
    //         success: (res1) => {
    //           console.log(res1)

    //           const list =  fileManager.readdirSync(unzippedPath)
    //           console.log(list)
    //           if (list.indexOf('manifest.json') != -1) {
    //             const manifestStr = fileManager.readFileSync(unzippedPath + '/manifest.json', 'utf-8')
    //             console.log(manifestStr)
    //             const dfuManager = new MegaDfu(unzippedPath, JSON.parse(manifestStr), this.realMac)
    //             dfuManager.on(progress => this.callback.onDfuProgress(progress))
    //             resolve(dfuManager)
    //           } else {
    //             reject('wrong dfu zip file')
    //           }
    //         },
    //         fail: err => reject(err)
    //       })
    //   })
    // }

    // init appid appkey

  }], [{
    key: "init",
    value: function init(appId, appKey) {
      _MegaBleConst.Config.AppId = appId, _MegaBleConst.Config.AppKey = appKey;
    }
  }]);

  return MegaBleClient;
}();

exports.default = MegaBleClient;