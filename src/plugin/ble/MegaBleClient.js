import MegaBleCmdApiManager from "./MegaBleCmdApiManager";
import MegaBleResponseManager from "./MegaBleResponseManager";
import MegaBleRawdataManager from "./MegaBleRawdataManager";
import { BLE_CFG, Config } from "./MegaBleConst";
import { discoverServicesAndChs } from "./MegaUtils";
import apiLean from "./MegaLean";

class MegaBleClient {

  api = null
  responseManager = null
  rawdataManager = null

  ctx = null

  constructor(ctx) {
    this.ctx = ctx;
    console.log(this.ctx)
  }

  setCallback(cb) {
    this.callback = cb;
  }

  _initCallbacks() {
    wx.onBluetoothAdapterStateChange(res => {
      this.callback.onAdapterStateChange(res)
    })

    wx.onBLEConnectionStateChange(res => {
      if (res.deviceId === this.deviceId) {
        if (!res.connected && this.responseManager) {
          this.clear()
        }

        this.callback.onConnectionStateChange(res)
      }
    })

    wx.onBLECharacteristicValueChange(characteristic => {
      if (!this.responseManager) return
      if (characteristic.deviceId === this.deviceId) {
        const a = new Uint8Array(characteristic.value)
        switch (characteristic.characteristicId) {
          case BLE_CFG.CH_INDICATE:
            this.responseManager.handleIndicateResponse(a)
            break;

          case BLE_CFG.CH_NOTIFY:
            this.responseManager.handleNotifyResponse(a)
            break;

          case BLE_CFG.CH_READ:
            this.responseManager.handleReadResponse(a)
            break;

          case BLE_CFG.CH_LOG_NOTIFY:
            if (a[0] === 0x5b && this.rawdataManager) {
              this.rawdataManager.queue(Array.from(a))
              this.callback.onRawdataReceiving(this.rawdataManager.getCount(), this.rawdataManager.getBleCount(), this.rawdataManager.getDuration())
            }
            break;

          default:
            break;
        }
      }
    })
  }

  connect(name, deviceId, advertisData) {
    this.name = name
    this.deviceId = deviceId

    const adv = Array.from(new Uint8Array(advertisData))
    
    if (this.deviceId.length > 17) {
      this.realMac = adv.slice(2, 8).reverse().map(i => ('00' + i.toString(16)).slice(-2)).join(':').toUpperCase()
    } else {
      this.realMac = this.deviceId
    }

    // console.log('will connect, realmac: ' + this.realMac)
    this._initCallbacks()

    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId: this.deviceId,
        success: () => {
          // connected ok; init services and characters
          discoverServicesAndChs(this.deviceId)
            .then(() => {
              // 各服务初始化完成
              // init sdk
              this.api = new MegaBleCmdApiManager(this.deviceId)
              this.responseManager = new MegaBleResponseManager(this.api, this.callback)
              this.isConnected = true
              this.callback.onDeviceInfoUpdated({name: this.name, mac: this.realMac})

              this.api.enablePipes()
                .then(res => {
                  resolve(res)
                })
                .catch(err => {
                  reject(err)
                })
            })
            .catch(err => reject(err))
        },
        fail: err => reject(err)
      })
    })
  }

  /**
   * normal api
   */
  startWithoutToken(userId, mac) {
    return this.api.bindWithoutToken(userId, mac)
  }
  startWithToken(userId, token) {
    return this.api.bindWithToken(userId, token)
  }
  startWithMasterToken() {
    return this.api.bindWithMasterToken()
  }

  setUserInfo(age, gender, height, weight, stepLength) {
    this.api.setUserInfo(age, gender, height, weight, stepLength);
  }

  enableMonitorV1(enable) {
    this.api.enableMonitorV1(enable)
  }

  enableRealTimeNotify(enable) {
    this.api.toggleLiveData(enable)
  }

  enableLive(enable) {
    enable ? this.api.enableV2ModeLiveSpo(true, 0) : this.api.enableV2ModeDaily(true, 0) // means stop
  }

  enableMonitor(enable) {
    enable ? this.api.enableV2ModeSpoMonitor(true, 0) : this.api.enableV2ModeDaily(true, 0)
  }

  syncData() {
    this.api.syncMonitorData()
  }

  enableRawdata() {
    if (this.rawdataManager) return
    this.rawdataManager = new MegaBleRawdataManager(this.ctx)
    this.api.enableRawdata(true)
  }

  disableRawdata() {
    if (this.rawdataManager) {
      // console.log(`包数统计: app: ${this.rawdataManager.getCount()}, ble: ${this.rawdataManager.getBleCount()}`)
      this.api.enableRawdata(false)
      this.callback.onRawdataComplete({ filePath: this.rawdataManager.filePath })
      this.rawdataManager.clear()
      this.rawdataManager = null
    }
  }

  clear() {
    if (this.responseManager) {
      this.responseManager.handleDisconnect()
      this.responseManager = null
    }

    if (this.rawdataManager) {
      this.rawdataManager.clear()
      this.rawdataManager = null
    }
    this.deviceId = null
    this.isConnected = false
  }

  disconnect() {
    this.clear()

    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        resolve()
        return
      }
      wx.closeBLEConnection({
        deviceId: this.deviceId,
        success: res => resolve(res),
        fail: err => reject(err),
      })
    })
  }

  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
  }

  enableDebug(enable) {
    Config.debugable = enable
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

}

const initSdk = (appId, appKey, ctx) => {
  return new Promise((resolve, reject) => {
    apiLean.get('/classes/SDKClient', 
      {where: {appKey, appId}, limit: 1, keys: 'valid'}, 
      res => {
        if (res.data.results 
          && res.data.results.length > 0
          && res.data.results[0]['valid']) {

            Config.AppId = appId;
            Config.AppKey = appKey;
            resolve(new MegaBleClient(ctx));
        } else {
          reject('init sdk auth failed');
        }
      }, () => {
        reject('init sdk error');
      });
  })
}

export default initSdk;
