import { constants } from "../store-ble"
// import MegaBleScanner from "../../ble/MegaBleScanner"
// import MegaBleClient from '../../ble/MegaBleClient'
import Taro from '@tarojs/taro'

// require plugin
const myPluginInterface = Taro.requirePlugin('myPlugin')

const {
  initSdk,
  MegaBleScanner,
  MegaBleStatus,
} = myPluginInterface.ble;

const APPID = 'ZURNaXgbXw'
const APPKEY = '&e)CPKK?z;|p0V3'

// MegaBleClient.init(APPID, APPKEY);

let scanner = null
let client = null

const populateDevicesfound = data => ({
  type: constants.ACTION_DEVICES_FOUND,
  data
})
const updateToken = data => ({
  type: constants.ACTION_UPDATE_TOKEN,
  data
})


export const updateDeviceInfo = data => ({
  type: constants.ACTION_DEVICE_INFO,
  data,
})

export const uploadSptData = data => ({
  type: constants.ACTION_UPLOAD_SPT_DATA,
  data,
})


export const scan = () => {
  return (dispatch) => {
    if (!scanner) {
      console.log('new a scanner.')
      dispatch(clearScannedDevices())

      scanner = new MegaBleScanner(res => {
        dispatch(populateDevicesfound(res))
      })
      scanner.initBleAdapter()
        .then(() => {
          scanner.scan()
          setTimeout(() => {
            if (scanner && scanner.isScanning) scanner.stopScan()
          }, 10000)
        })
        .catch(err => console.error(err))

    } else {
      if (!scanner.isScanning) {
        dispatch(clearScannedDevices())

        scanner.scan()
        setTimeout(() => {
          if (scanner && scanner.isScanning) scanner.stopScan()
        }, 10000)
      }
    }
  }
}

// init client

export const initClient = (clnt) => {
  if (!client) client = clnt;
}

// connect
export const connect = (device) => {
  return (dispatch) => {
    // if (!client) {
      // MegaBleClient.init()
      // client = new MegaBleClient(genMegaCallback(dispatch))
    // }

    if (!client) return;
    if (!client.callback) client.setCallback(genMegaCallback(dispatch));

    const token = Taro.getStorageSync('token');

    client.connect(device.name, device.deviceId, device.advertisData)
      .then(res => {
        // 1. 开始start
        // this.bleClient.startWithoutToken('5837288dc59e0d00577c5f9a', this.bleClient.realMac)
        // this.bleClient.startWithToken('5837288dc59e0d00577c5f9a', '206,212,54,3,114,248')
        if (token && token.indexOf(',') != -1) {
          client.startWithToken('5f5df94193b89920287c90b4', token)
            .then(res => console.log('token',res))
            .catch(err => console.error(err));
        } else {
          // client.startWithMasterToken()
          client.startWithToken('5f5df94193b89920287c90b4', '0,0,0,0,0,0')
            .then(res => console.log('token',res))
            .catch(err => console.error(err));
        }
      })
      .catch(err => console.error(err))
  }
}

// clear or destory

const clearScannedDevices = () => ({
  type: constants.ACTION_CLEAR
})

export const destroyScanner = () => {
  if (scanner) {
    if (scanner.isScanning) scanner.stopScan()
    scanner = null
  }
  return {
    type: constants.ACTION_CLEAR,
  }
}

export const clearAll = () => {
  if (client) {
    client.disconnect()
  }
}

export const start = () => {
  client.enableMonitorV1(true)
}
export const stop = () => {
  client.enableMonitorV1(false)
}
// 收取数据
export const getData = () => {
  client.syncData()
}

// ring func
// 开启或关闭实时模式通道
export const enableRealTime = (enable) => {
  client.enableRealTimeNotify(enable);
}
// 开启实时模式
export const liveOn = () => {
  client.enableLive(true);
}
export const liveOff = () => {
  client.enableLive(false);
}
// 开启监测模式
export const monitorOn = () => {
  client.enableMonitor(true);
}
export const monitorOff = () => {
  client.enableMonitor(false);
}
export const enableRaw = () => {
  client.enableRawdata();
}
export const disableRaw = () => {
  client.disableRawdata();
}

// user
export const loginSuccess = data => {
  return dispatch => {
    Taro.setStorage({key:'user', data})
    if (data.sptToken) {
      Taro.setStorage({key:'token', data: data.sptToken})
    }

    dispatch({
      type: constants.ACTION_LOGIN_SUCCESS,
      data
    })
  }
}

export const logout = () => {
  return dispatch => {
    Taro.removeStorage({ key: 'user' })
    Taro.removeStorage({ key: 'token' })
    dispatch({ type: constants.ACTION_LOGOUT, })
  }
}


/**
 * big callback
 * @param {*} dispatch 
 */
const genMegaCallback = (dispatch) => {
  return {
    // mega ble callback
    onAdapterStateChange: (res) => {
      console.log('ble adapter state change: ', res)
      // 蓝牙重新可用了，看看该采取什么操作
      if (res.available) {
        console.log('ble available')
      }
    },
    onConnectionStateChange: (res) => {
      console.log('connection change: ', res)
      if (!res.connected) {
        dispatch(updateDeviceInfo(null))
      }
    },
    onBatteryChanged: (value, status) => {
      console.log('onBatteryChanged: ', value, status)
    },
    onTokenReceived: (token) => {
      console.log('onTokenReceived: ', token)
      Taro.setStorage({key: 'token', data: token})
      dispatch(updateToken(token))
    },
    onKnockDevice: () => {
      console.log('onKnockDevice')
      Taro.showLoading({title: 'shake target device', mask: true})
    },
    onOperationStatus: (cmd, status) => {
      if (status !== 0) {
        console.error('onOperationStatus: ' + cmd.toString(16) + ' - ' + status.toString(16));
      }
    },
    onEnsureBindWhenTokenNotMatch: () => { },
    onError: (status) => {
      console.log('onError: ', status)
    },
    onCrashLogReceived: (a) => {

    },
    onSyncingDataProgress: (progress) => {
      console.log('onSyncingDataProgress... ' + progress);
      Taro.showLoading({title: progress + '%'})
    },
    onSyncMonitorDataComplete: (bytes, dataStopType, dataType) => {
      console.log('onSyncMonitorDataComplete: ', bytes, dataStopType, dataType);
      const boundary = `----MegaRing${new Date().getTime()}`;
      const DeviceInfo ={
        "mac": "BC:E5:9F:48:89:20",
        "sn": "C11E22005002537",
        "swVer": "3.0.10657"
      }
      const formData = createFormData({ binData: bytes, institutionId:'5d5ce86aba39c800671c5a89', remoteDevice:JSON.stringify(DeviceInfo)}, boundary)
      var options = {
        method: 'POST',
        url: 'https://server-mhn.megahealth.cn/upload//uploadBinData',
        header: {
          'Accept': 'application/json',
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        data:formData
      };
      Taro.request(options).then(res=>{
        console.log('report',res);
      }).catch(err=>{
        console.log(err);
      })

      dispatch(uploadSptData(bytes))
    },
    onSyncDailyDataComplete: (bytes) => {
      console.log('onSyncDailyDataComplete: ', bytes)
    },
    onSyncNoDataOfMonitor: () => {
      console.log('onSyncNoDataOfMonitor')
      Taro.hideLoading()
    },
    onSyncNoDataOfDaily: () => {
      console.log('onSyncNoDataOfDaily')
    },
    onV2BootupTimeReceived: time => { },
    onBatteryChangedV2: (value, status, druation) => {
      console.log('onBatteryChangedV2:', value, status, druation)
    },
    onHeartBeatReceived: heartBeat => { console.log('onHeartBeatReceived: ', heartBeat) },
    onV2PeriodSettingReceived: v2PeriodSetting => { },
    onV2PeriodEnsureResponsed: a => { },
    onV2PeriodReadyWarning: a => { },

    onLiveDataReceived: live => {
      console.log('onLiveDataReceived: ', live)
    },
    onV2LiveSleep: v2LiveSleep => {
      console.log('onV2LiveSleep: ', v2LiveSleep)
    },
    onV2LiveSport: v2LiveSport => {
      console.log('onV2LiveSport: ', v2LiveSport)
    },
    onV2LiveSpoMonitor: v2LiveSpoMonitor => {
      console.log('onV2LiveSpoMonitor: ', v2LiveSpoMonitor)
    },
    onSetUserInfo: () => {
      // age, gender, height, weight, step size
      client.setUserInfo(25, 1, 170, 60, 0)
    },
    onIdle: () => {
      console.log('idle')

      Taro.hideLoading()
      Taro.navigateBack()
    },
    onDeviceInfoUpdated: deviceInfo => {
      dispatch(updateDeviceInfo(deviceInfo))
    },
    onRawdataReceiving: (count, bleCount, rawdataDuration) => {
      console.log('onRawdataReceiving',count, bleCount, rawdataDuration);
    },
    onRawdataComplete: info => {
      console.log(info);
    },
    onDfuProgress: progress => {
      console.log('onDfuProgress',progress);
    }
  }
}

const createFormData = (params = {}, boundary = '') => {
  let result = '';
  for (let i in params) {
    result += `\r\n--${boundary}`;
    result += `\r\nContent-Disposition: form-data; name="${i}"`;
    result += '\r\n';
    result += `\r\n${params[i]}`
  }
  // 如果obj不为空，则最后一行加上boundary
  if (result) {
    result += `\r\n--${boundary}`
  }
  return result
}