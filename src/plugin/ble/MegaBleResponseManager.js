import { CMD, STATUS } from "./MegaBleConst";
import MegaBleBigDataManager from "./MegaBleBigDataManager";
import { byte4ToInt, u8s2hex, parseRead } from "./MegaUtils";


const STEP_BIND_OK = 1;
const STEP_READ_DEVICE_INFO = 2;
const STEP_SET_TIME = 3;
const STEP_SET_USERINFO = 4;
const STEP_IDLE = 5;

const PERIOD_HEART_BEAT = 15;
const PERIOD_READ_RSSI = 9;

const genStepList = () => [
  { sn: STEP_BIND_OK },
  { sn: STEP_READ_DEVICE_INFO },
  { sn: STEP_SET_TIME },
  { sn: STEP_SET_USERINFO },
  { sn: STEP_IDLE },
]

class MegaBleResponseManager {

  constructor(api, callback) {
    this.api = api
    this.callback = callback

    this.loopManager = null
    this.bigDataManager = null

    this.stepList = genStepList()
  }

  handleIndicateResponse(a) {
    console.log('onIndicate <- ' + u8s2hex(a))
    const cmd = a[0], status = a[2]
    this.callback.onOperationStatus(cmd, status)

    switch (cmd) {
      case CMD.FAKEBIND:
        if (status === 0) {
          this._handleBind(a)
        }
        break;

      case CMD.SETTIME:
        if (status === 0) {
          let t = (a[3] << 24) | (a[4] << 16) | (a[5] << 8) | a[6]
          console.log('setTime respond time: ' + t)
        }
        this._next()
        break;

      case CMD.SETUSERINFO:
        this._next()
        break;

      case CMD.LIVECTRL:
      case CMD.MONITOR:
      case CMD.FINDME:
        this.callback.onOperationStatus(cmd, status);
        break;

      case CMD.CRASHLOG:
        this.callback.onCrashLogReceived(a)
        break

      case CMD.V2_GET_MODE:
        if (status === 0) {
          const duration = (a[3] == 1 || a[3] == 2) ? ((a[4] << 24) | (a[5] << 16) | (a[6] << 8) | a[7]) : 0
          this.callback.onV2ModeReceived({ mode: a[3], duration })
        }
        break;

      case CMD.SYNCDATA:
        this._handleSyncData(cmd, status, a)
        break

      case CMD.CTRL_MONITOR_DATA:
      case CMD.CTRL_MONITOR_DATA:
        if (this.bigDataManager) this.bigDataManager.handleCtrlIndicate(a)
        break;

      case CMD.V2_MODE_ECG_BP:
      case CMD.V2_MODE_SPORT:
      case CMD.V2_MODE_DAILY:
      case CMD.V2_MODE_LIVE_SPO:
        this.callback.onOperationStatus(cmd, status);
        break;

      case CMD.V2_GET_BOOTUP_TIME:
        if (status == 0) {
          const t = (a[3] << 24) | (a[4] << 16) | (a[5] << 8) | a[6];
          console.log("device bootup time: " + t)
          this.callback.onV2BootupTimeReceived(t);
        }
        break;

      case CMD.NOTIBATT:
        if (status == 0) {
          if (a.length >= 7 )
          
          this.callback.onBatteryChangedV2(a[3], a[4], (a[5] << 16) | (a[6] << 8) | a[7]);
        }
        break;


      case CMD.HEARTBEAT:
        this.callback.onHeartBeatReceived({ version: a[3], battPercent: a[4], deviceStatus: a[5], mode: a[6], recordStatus: a[7], periodMonitorStatus: a[8] });
        break;

      case CMD.V2_PERIOD_MONITOR_SET:
        this.callback.onOperationStatus(cmd, status);
        break;

      case CMD.V2_GET_PERIOD_SETTING:
        this.callback.onOperationStatus(cmd, status);
        if (status == 0) {
          const maxTime = byte4ToInt([bytes[9], bytes[10], bytes[11], bytes[12]])
          this.callback.onV2PeriodSettingReceived({ status: a[3], periodType: a[4], h: a[5], m: a[6], s: a[7], maxTime: maxTime });
        }
        break;

      case CMD.V2_PERIOD_MONITOR_ENSURE:
        this.callback.onOperationStatus(cmd, status);
        if (status == 0) this.callback.onV2PeriodEnsureResponsed(a);
        break;

      case CMD.V2_PERIOD_MONITOR_INDIC:
        this.callback.onV2PeriodReadyWarning(a);
        break;

      default:
        break;
    }
  }

  handleNotifyResponse(a) {
    switch (a[0]) {
      case CMD.LIVECTRL:
        // 2018-10-10 15:00:40 加入实时的log采集
        // 原因：观察到的现象是实时值偶尔会不过来。需要查出究竟是sdk没记，还是值没过来
        console.log("notify comes [live]: " + u8s2hex(a));
        this._dispatchV2Live(this.callback, a);
        break;
      case CMD.NOTIBATT:
        this.callback.onBatteryChanged(a[3], a[4])
        break;

      default:
        if (this.bigDataManager) this.bigDataManager.handleNotify(a)
        break;
    }
  }

  handleReadResponse(a) {
    console.log('onRead: ' + u8s2hex(a))
    const deviceInfo = parseRead(a)
    console.log(deviceInfo)
    this.callback.onDeviceInfoUpdated(deviceInfo)
    
    this._next()
  }

  handleDisconnect() {
    if (this.loopManager) {
      this.loopManager.clearLoop()
      this.loopManager = null
    }
  }

  _next() {
    if (this.stepList.length === 0) return
    const step = this.stepList.shift()

    switch (step.sn) {
      case STEP_BIND_OK:
        this.loopManager = new LoopManager({
          onSendHeartBeat: () => this.api.sendHeartBeat()
        })
        this._next()
        break;
      case STEP_READ_DEVICE_INFO:
        this.api.readDeviceInfo()
        break;
      case STEP_SET_TIME:
        this.api.setTime()
        break;
      case STEP_SET_USERINFO:
        this.callback.onSetUserInfo()
        break;
      case STEP_IDLE:
        this.callback.onIdle()
        break;
      default:
        break;
    }
  }

  _handleSyncData(cmd, status, a) {
    this.callback.onOperationStatus(cmd, status);
    if (status === 0) { // permit to transmit
      console.log("Trans permission [yes]...")
      this.bigDataManager = new MegaBleBigDataManager({
        writeReportPack: pack => { this.api.writeReportPack(pack) },
        onProgress: progress => { this.callback.onSyncingDataProgress(progress) },
        onMonitorDataComplete: (bytes, dataStopType, dataType) => { this.callback.onSyncMonitorDataComplete(bytes, dataStopType, dataType) },
        onDailyDataComplete: bytes => { this.callback.onSyncDailyDataComplete(bytes) },
        syncMonitorData: () => this.api.syncMonitorData(),
        syncDailyData: () => this.api.syncDailyData(),
      })
      this.bigDataManager.handleTransmitPermited(a)
    } else {
      this.bigDataManager = null
      if (status === 2) {
        console.log("Trans permission [no], no data.");
        if (a[5] === 0 || a[5] === CMD.CTRL_DAILY_DATA) {
          this.callback.onSyncNoDataOfDaily()
        } else if (a[5] == CMD.CTRL_MONITOR_DATA) {
          this.callback.onSyncNoDataOfMonitor()
        }
      }
    }
  }

  _handleBind(a) {
    switch (a[3]) {
      case 0: // receive token
        this.callback.onTokenReceived([a[4], a[5], a[6], a[7], a[8], a[9]].join(','))
        this._next()
        break;

      case 1: // already bound
        this._next()
        break;

      case 2:
        this.callback.onKnockDevice()
        break;

      case 3: // low power
        this.callback.onOperationStatus(cmd, STATUS.STATUS_LOWPOWER);
        break;

      case 4: // userInfo not match
        this.callback.onEnsureBindWhenTokenNotMatch(); // 默认先确保能连
        break;

      default:
        this.callback.onError(STATUS.ERROR_BIND);
        break;
    }
  }

  _dispatchV2Live(megaBleCallback, a) {
    if (!megaBleCallback) return
    switch (a[2]) {
      case 0:
        megaBleCallback.onLiveDataReceived({ spo: a[3], hr: a[4], status: a[5] }); // spo, hr, flag | a[3]  a[4] a[5]
        break;
      case 0x01:
        megaBleCallback.onV2LiveSleep({ status: a[3], spo: a[4], pr: a[5], duration: (a[6] << 24) | (a[7] << 16) | (a[8] << 8) | a[9] });
        break;
      case 0x02:
        megaBleCallback.onV2LiveSport({ status: a[3], pr: a[4], duration: (a[5] << 24) | (a[6] << 16) | (a[7] << 8) | a[8] });
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
}


/**
 * LoopManager 心跳，读场强，等循环管理器
 */
class LoopManager {

  constructor(loopCallback) {
    this.loopCallback = loopCallback
    this.loopArr = []
    this.startLoop()
  }

  startLoop() {
    if (this.loopArr.length != 0) return
    let t1 = setInterval(() => {
      this.loopCallback.onSendHeartBeat()
    }, PERIOD_HEART_BEAT * 1000);

    // let t2 = setInterval(() => {
    //   this.loopCallback.onReadRssi()
    // }, PERIOD_READ_RSSI);

    this.loopArr.push(t1)
  }

  clearLoop() {
    this.loopArr.forEach(i => clearInterval(i))
    this.loopArr.length = 0
  }

}

export default MegaBleResponseManager