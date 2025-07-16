import MegaBleCmdApiManager from "./MegaBleCmdApiManager";
import MegaBleResponseManager from "./MegaBleResponseManager";
import { BLE_CFG, Config, DeviceInfo } from "./MegaBleConst";
import { discoverServicesAndChs } from "./MegaUtils";
import apiLean from "./service-lean";

class MegaBleClient {

  api = null
  responseManager = null
  rawdataManager = null

  ctx = null

  constructor(ctx) {
    this.ctx = ctx;
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
          this.responseManager.clearRawData()
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
          case BLE_CFG.RAW_UUID:
            this.responseManager.handleRawDataResponse(a)
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
    DeviceInfo.mac = deviceId;
    this._initCallbacks()

    return new Promise((resolve, reject) => {
      wx.createBLEConnection({
        deviceId: this.deviceId,
        success: () => {
          // connected ok; init services and characters
          discoverServicesAndChs(this.deviceId)
            .then((res) => {
              if(res.length>0){
                for (let i = 0; i < res.length; i++) {
                  const item = res[i];
                  let indicate,notify,read,write,raw_uuid,raw_sid
                  for (let j = 0; j < item.characteristics.length; j++) {
                    const element = item.characteristics[j];
                    if(element.properties.indicate) indicate = element.uuid;
                    if(element.properties.notify) notify = element.uuid;
                    if(element.properties.read) read = element.uuid;
                    if(element.properties.write&&element.properties.writeDefault) write = element.uuid;
                    if (
                      !element.properties.indicate&&
                      element.properties.notify
                    ) {
                      raw_uuid = element.uuid;
                      raw_sid = item.serviceId;
                    }
                    // if(notify)console.log( item.serviceId,element)
                  }
                  if(indicate&&notify&&read&&write) {
                    BLE_CFG.SVC_ROOT = item.serviceId
                    BLE_CFG.CH_INDICATE = indicate
                    BLE_CFG.CH_READ = read
                    BLE_CFG.CH_WRITE = write
                    BLE_CFG.CH_NOTIFY = notify
                    BLE_CFG.SCV_LOG = item.serviceId
                    BLE_CFG.CH_LOG_NOTIFY = notify
                  }
                  if (raw_uuid && raw_sid) {
                    BLE_CFG.RAW_SID = raw_sid;
                    BLE_CFG.RAW_UUID = raw_uuid;
                  }

                }
                // console.log(1111)
              }

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
    // console.log('实时')
    enable ? this.api.enableV2ModeLiveSpo(true, 0) : this.api.enableV2ModeDaily(true, 0) // means stop
  }

  enableMonitor(enable) {
    // console.log('日常')
    enable ? this.api.enableV2ModeSpoMonitor(true, 0) : this.api.enableV2ModeDaily(true, 0)
  }

  syncData() {
    this.api.syncMonitorData()
  }
  /***
   * 快速收取报告
   */
  quickReport() {
    // this.api.syncMonitorData()
    this.enableRawdata(true)
    this.responseManager.type='sleep'
    setTimeout(()=>{
      //开启快收
      this.api.quickGetReportData()
    },10)
  }

  //开启脉诊模式
  setPulseMode(enable,time){
    if(enable){
      //开启脉诊
      if(time){
        this.responseManager.setRawDataPulseTime(time)
      }
      this.api.sendPulseMode()
      setTimeout(()=>{
        //开启rawData
        this.enableRawdata(true)
      },10)
    }else{
      // 关闭脉诊
      this.enableLive(true)
      setTimeout(()=>{
        //清除间隔
        this.enableRawdata(false)
      })
    }
  }


  //打开Rawdata
  enableRawdata(enable){
    if(enable){
      if(Config.debugable)console.log(enable?"开启RAWDATA":"关闭RAWDATA")
      this.responseManager.startRawData()
    }else {
      this.responseManager.clearRawData()
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
    //关闭循环
    const that=this
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        resolve()
        this.responseManager.clear()
        return
      }
      wx.closeBLEConnection({
        deviceId: that.deviceId,
        success: res => {
          that.clear()
          resolve(res)
        },
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
