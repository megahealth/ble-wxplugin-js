import { BLE_CFG } from "./MegaBleConst";
import { u8s2hex } from "./MegaUtils";
import {
  makeBindMasterCmd,
  makeSyncMonitorDataCmd,
  makeSyncDailyDataCmd,
  makeHeartBeatCmd,
  makeSetTimeCmd,
  makeUserInfoCmd,
  makeLiveCmd,
  makeV2EnableModeLiveSpo,
  makeV2EnableModeDaily,
  makeV2EnableModeSpoMonitor,
  makeBindMacCmd,
  makeBindTokenCmd,
  makeMonitorCmd,
} from "./MegaBleCmdMaker";

class MegaBleCmdApiManager {

  constructor(deviceId) {
    this.deviceId = deviceId
  }

  enablePipes() {
    return new Promise((resolve, reject) => {
      this._enablePipe(BLE_CFG.CH_INDICATE, true)
        .then(res1 => {
          this._enablePipe(BLE_CFG.CH_NOTIFY, true)
            .then(res2 => resolve([res1, res2]))
            .catch(err => reject(err))
        })
        .catch(err => reject(err))
    })
  }

  _enablePipe(characteristicId, state) {
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        deviceId: this.deviceId,
        serviceId: BLE_CFG.SVC_ROOT,
        characteristicId,
        state,
        success: res => resolve(res),
        fail: err => reject(err),
      })
    })
  }

  // 5837288dc59e0d00577c5f9a
  bindWithoutToken(userId, mac) {
    const a = makeBindMacCmd(userId, mac)
    console.log('[cmd] bindWithoutToken -> ' + u8s2hex(a))
    return this._write(a)
  }

  bindWithToken(userId, token) {
    const a = makeBindTokenCmd(userId, token)
    console.log('[cmd] bindWithToken -> ' + u8s2hex(a))
    return this._write(a)
  }

  bindWithMasterToken() {
    const a = makeBindMasterCmd()
    console.log('[cmd] bindWithMasterToken -> ' + u8s2hex(a))
    return this._write(a)
  }

  setTime() {
    const a = makeSetTimeCmd()
    console.log("[cmd] setTime -> " + u8s2hex(a))
    return this._write(a)
  }

  setUserInfo(age, gender, height, weight, stepLength) {
    const a = makeUserInfoCmd(age, gender, height, weight, stepLength)
    console.log("[cmd] setUserInfo -> " + u8s2hex(a))
    return this._write(a)
  }

  sendHeartBeat() {
    const a = makeHeartBeatCmd()
    console.log('[cmd] sendHeartBeat -> ' + u8s2hex(a))
    return this._write(a)
  }

  /**
   * 旧版开关监控
   * @param {*} enable 
   */
  enableMonitorV1(enable) {
    const a = makeMonitorCmd(enable)
    console.log('[cmd] enableMonitorV1 -> ' + u8s2hex(a))
    return this._write(a)
  }

  /**
   * 开关全局实时通道
   * @param {*} enable 
   */
  toggleLiveData(enable) {
    const a = makeLiveCmd(enable)
    console.log('[cmd] toggleLiveData -> ' + u8s2hex(a))
    return this._write(a)
  }

  /**
   * 开关实时血氧仪模式
   * @param {*} ensure 
   * @param {*} seconds 
   */
  enableV2ModeLiveSpo(ensure, seconds) {
    const a = makeV2EnableModeLiveSpo(ensure, seconds)
    console.log('[cmd] enableV2ModeLiveSpo -> ' + u8s2hex(a))
    return this._write(a);
  }

  /**
   * 1. 开关日常模式；开启此模式意味着关闭其他模式
   * 2. 默认模式
   * @param {*} ensure 
   * @param {*} seconds 
   */
  enableV2ModeDaily(ensure, seconds) {
    const a = makeV2EnableModeDaily(ensure, seconds)
    console.log('[cmd] enableV2ModeDaily -> ' + u8s2hex(a))
    return this._write(a)
  }

  /**
   * 开关监控
   * @param {*} ensure 
   * @param {*} seconds 
   */
  enableV2ModeSpoMonitor(ensure, seconds) {
    const a = makeV2EnableModeSpoMonitor(ensure, seconds);
    console.log('[cmd] enableV2ModeSpoMonitor -> ' + u8s2hex(a))
    return this._write(a)
  }


  /**
   * 收监控数据
   */
  syncMonitorData() {
    const a = makeSyncMonitorDataCmd()
    console.log('[cmd] syncMonitorData -> ' + u8s2hex(a))
    return this._write(a)
  }

  syncDailyData() {
    const a = makeSyncDailyDataCmd()
    console.log('[cmd] syncDailyData -> ' + u8s2hex(a))
    return this._write(a)
  }

  writeReportPack(a) {
    console.log('[cmd] writeReportPack -> ' + u8s2hex(a))
    return this._write(a)
  }

  readDeviceInfo() {
    return new Promise((resolve, reject) => {
      wx.readBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId: BLE_CFG.SVC_ROOT,
        characteristicId: BLE_CFG.CH_READ,
        success: res => resolve(res),
        fial: err => reject(err),
      })
    })
  }

  enableRawdata(state) {
    return new Promise((resolve, reject) => {
      wx.notifyBLECharacteristicValueChange({
        deviceId: this.deviceId,
        serviceId: BLE_CFG.SCV_LOG,
        characteristicId: BLE_CFG.CH_LOG_NOTIFY,
        state,
        success: res => resolve(res),
        fail: err => reject(err),
      })
    })
  }

  startDfu() {
    wx.notifyBLECharacteristicValueChange({
      deviceId: this.deviceId,
      serviceId: BLE_CFG.SVC_DFU,
      characteristicId: BLE_CFG.CH_DFU_CTRL,
      state: true,
      success: () => {
        setTimeout(() => {
          wx.writeBLECharacteristicValue({
            deviceId: this.deviceId,
            serviceId: BLE_CFG.SVC_DFU,
            characteristicId: BLE_CFG.CH_DFU_CTRL,
            value: new Uint8Array([1, 4]).buffer,
            success: res => console.log(res),
            fail: err => console.error(err),
          })
        }, 1000);
      },
      fail: err => console.error(err),
    })
  }

  _write(bytes) {
    return new Promise((resolve, reject) => {
      wx.writeBLECharacteristicValue({
        deviceId: this.deviceId,
        serviceId: BLE_CFG.SVC_ROOT,
        characteristicId: BLE_CFG.CH_WRITE,
        value: bytes.buffer,
        success: res => resolve(res),
        fail: err => reject(err),
      })
    })
  }

}

export default MegaBleCmdApiManager
