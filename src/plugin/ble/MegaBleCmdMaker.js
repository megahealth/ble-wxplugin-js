import { getRandomString, getMD5Bytes, userIdToBytes, encryptMac, encryptToken } from "./MegaUtils";
import { CMD } from "./MegaBleConst";


const STATUS_CLIENT = 0 // android

export const makeBindMacCmd= (userId, mac) => {
  const a = _initPack(CMD.FAKEBIND)
  const userIdBytes = userIdToBytes(userId) // 3 + 12 bytes
  a.set(userIdBytes, 3)
  a.set(encryptMac(mac), 15)
  return a
}

export const makeBindTokenCmd= (userId, token) => {
  const a = _initPack(CMD.FAKEBIND)
  const userIdBytes = userIdToBytes(userId) // 3 + 12 bytes
  a.set(userIdBytes, 3)
  a.set(encryptToken(token), 15)
  return a
}

export const makeBindMasterCmd = () => {
  const a = _initPack(CMD.FAKEBIND)
  const s = getRandomString(12) // 生成12个字符
  const arr5 = getMD5Bytes(s).slice(-5) // 根据字符串生成hash，去前5个字节
  a.set(s.split('').map(i => i.charCodeAt()), 3) // 填充12个字符
  a.set(arr5, 15)
  return a
}

export const makeSetTimeCmd = () => {
  const t = Math.floor(Date.now() / 1000)
  const a = _initPack(CMD.SETTIME)
  a[3] = ((t & 0xff000000) >> 24)
  a[4] = ((t & 0x00ff0000) >> 16)
  a[5] = ((t & 0x0000ff00) >> 8)
  a[6] = (t & 0x000000ff)
  return a
}

export const makeUserInfoCmd = (age, gender, height, weight, stepLength) => {
  const a = _initPack(CMD.SETUSERINFO)
  a[3] = age              // age 25
  a[4] = gender           // gender 0/1
  a[5] = height           // height 170
  a[6] = weight           // weight 60
  a[7] = stepLength       // step length 0
  return a
}

export const makeMonitorCmd = enable => {
  const a = _initPack(CMD.MONITOR)
  a[1] = enable ? CMD.CTRL_MONITOR_ON : CMD.CTRL_MONITOR_OFF
  a[3] = enable ? CMD.CTRL_MONITOR_ON : CMD.CTRL_MONITOR_OFF
  return a
}

export const makeLiveCmd = (enable) => {
  const a = _initPack(CMD.LIVECTRL)
  a[1] = enable ? CMD.CTRL_LIVE_START : CMD.CTRL_LIVE_STOP
  a[3] = enable ? CMD.CTRL_LIVE_START : CMD.CTRL_LIVE_STOP
  return a
}

export const makeV2EnableModeLiveSpo = (ensure, t) => {
  const a = _initPack(CMD.V2_MODE_LIVE_SPO)
  a[3] = (ensure ? 'S'.charCodeAt() : 0)
  a[4] = (t & 0xff000000) >> 24
  a[5] = (t & 0x00ff0000) >> 16
  a[6] = (t & 0x0000ff00) >> 8
  a[7] = t & 0x000000ff
  return a;
}

export const makeV2EnableModeDaily = (ensure, t) => {
  const a = _initPack(CMD.V2_MODE_DAILY);
  a[3] = ensure ? 'S'.charCodeAt() : 0
  a[4] = (t & 0xff000000) >> 24
  a[5] = (t & 0x00ff0000) >> 16
  a[6] = (t & 0x0000ff00) >> 8
  a[7] = t & 0x000000ff
  return a
}

export const makeV2EnableModeSpoMonitor = (ensure, t) => {
  const a = _initPack(CMD.V2_MODE_SPO_MONITOR);
  a[1] = CMD.V2_MODE_SPO_MONITOR; // 兼容陶瓷戒指
  a[3] = (ensure ? 'S'.charCodeAt() : 0);
  a[4] = (t & 0xff000000) >> 24
  a[5] = (t & 0x00ff0000) >> 16
  a[6] = (t & 0x0000ff00) >> 8
  a[7] = t & 0x000000ff
  return a
}

export const makeSyncMonitorDataCmd = () => {
  const a = _initPack(CMD.SYNCDATA)
  a[3] = CMD.CTRL_MONITOR_DATA
  return a
}


export const makeSyncDailyDataCmd = () => {
  const a = _initPack(CMD.SYNCDATA)
  a[3] = CMD.CTRL_DAILY_DATA;
  return a;
}

export const makeHeartBeatCmd = () => {
  const a = _initPack(CMD.HEARTBEAT)
  a[3] = 1
  return a
}


const _initPack = (cmd) => {
  const a = new Uint8Array(20)
  a[0] = cmd
  a[1] = 0
  a[2] = STATUS_CLIENT
  return a
}

const _initPackWithCtrl = (cmd, ctrl) => {
  const a = new Uint8Array(20)
  a[0] = cmd
  a[1] = 0
  a[2] = STATUS_CLIENT
  a[3] = ctrl
  return a
}
