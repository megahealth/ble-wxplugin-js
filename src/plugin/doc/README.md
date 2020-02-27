# 小程序ble插件

## 初始化
> import

```
// import from plugin
var blePlugin = requirePlugin("megable")

const APPID = ''
const APPKEY = ''

const {
  initSdk, // for the ble client; connect, send message to the device, 
  MegaBleScanner, // for scanning
  MegaBleStatus, // for onOperationStatus const
} = blePlugin.ble;
```

> scan

```
// scan
let scanner;

if (!scanner) {
    scanner = new MegaBleScanner(res => {
        // some devices have been found, you can show them in the view;
        // the device which had been found can been connected later;
    })

    // a bleAdapter must be inited;
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
        scanner.scan()
        setTimeout(() => {
            if (scanner && scanner.isScanning) scanner.stopScan()
        }, 10000)
    }
}

```

> connect

```
// connect; need to initSdk first
// can do this in app's initing
initSdk(APPID, APPKEY)
    .then(client => {
        // get the ble client to handle ble business
        // need to set the big callback
        client.setCallback(genMegaCallback());

        // connect to the device scanned before
        client.connect(device.name, device.deviceId, device.advertisData)
        .then(res => {
            // get cached token, '5837288dc59e0d00577c5f9a' will always be ok to use.
            // const token = cached.token;
            if (token && token.indexOf(',') != -1) {
            client.startWithToken('5837288dc59e0d00577c5f9a', token)
                .then(res => console.log(res))
                .catch(err => console.error(err));
            } else {
            // no cached token, just use '0,0,0,0,0,0'; 
            // then wait the big callback to notify shaking the device, onKnockDevice
            client.startWithToken('5837288dc59e0d00577c5f9a', '0,0,0,0,0,0')
                .then(res => console.log(res))
                .catch(err => console.error(err));
            }
        })
        .catch(err => console.error(err))
        
    })
    .catch(err => console.error(err))

```

## API
- class MegaBleScanner:
    - initBleAdapter()
    - stopScan()
    - scan()
- class MegaBleClient:
    - connect(name, deviceId, advertisData)
    - startWithoutToken(userId, mac) 
    - startWithToken(userId, token) 
    - setUserInfo(age, gender, height, weight, stepLength)
    - enableRealTimeNotify(enable)
    - enableLive(enable)
    - enableMonitor(enable)
    - syncData() 
    - enableRawdata() 
    - disableRawdata()
    - disconnect() 
    - closeBluetoothAdapter()

- scanner callback
    - onDeviceFound(res) {}

- mega ble callback
    - onAdapterStateChange: (res) => {}
    - onConnectionStateChange: (res) => {}
    - onBatteryChanged: (value, status) => {}
    - onTokenReceived: (token) => {}
    - onKnockDevice: () => {}
    - onOperationStatus: (cmd, status) => {}
    - onEnsureBindWhenTokenNotMatch: () => {} 
    - onError: (status) => {}
    - onCrashLogReceived: (a) => {}
    - onSyncingDataProgress: (progress) => {}
    - onSyncMonitorDataComplete: (bytes, dataStopType, dataType) => {}
    - onSyncDailyDataComplete: (bytes) => {}
    - onSyncNoDataOfMonitor: () => {}
    - onSyncNoDataOfDaily: () => {}
    - onV2BootupTimeReceived: time => {}
    - onBatteryChangedV2: (value, status, druation) => {}
    - onHeartBeatReceived: heartBeat => {} 
    - onV2PeriodSettingReceived: v2PeriodSetting => {}
    - onV2PeriodEnsureResponsed: a => {}
    - onV2PeriodReadyWarning: a => {}
    - onLiveDataReceived: live => {}
    - onV2LiveSleep: v2LiveSleep => {}
    - onV2LiveSport: v2LiveSport => {}
    - onV2LiveSpoMonitor: v2LiveSpoMonitor => {}
    - onSetUserInfo: () => {}
    - onIdle: () => {}
    - onRawdataCount: (count, bleCount, rawdataDuration) => {}

- export const STATUS

```
  ERROR_BIND                      : 40000,
  STATUS_OK                       : 0x00,
  STATUS_NO_DATA                  : 0x02, // 无数据可同步
  STATUS_SLEEPID_ERR              : 0x20,
  STATUS_CMD_PARAM_CANNOT_RESOLVE : 0x21,
  STATUS_MONITOR_IS_WORKING       : 0x22,
  STATUS_RECORDS_CTRL_ERR         : 0x23, // 监测没关，监测已开启，重复操作, 记录数据操作出错
  STATUS_AFE44XX_IS_MONITORING    : 0x24, // AFE44XX已经开启，无法再开启
  STATUS_AFE44XX_IS_SPORTING      : 0x25,
  STATUS_UNKNOWN_CMD              : 0x9F,
  STATUS_RTC_ERR                  : 0xA0,
  STATUS_LOWPOWER                 : 0xA1,
  STATUS_SPO2_HR_ERR              : 0xA2,
  STATUS_FLASH_ERR                : 0xA3,
  STATUS_REFUSED                  : 0xA4, // 可能在充电，充电时不可有开启命令类操作。但可同步数据
  STATUS_44XX_ERR                 : 0xA5,
  STATUS_GSENSOR_ERR              : 0xA6,
  STATUS_BQ25120_IS_FAULT         : 0xA7,

  STATUS_DEVICE_HW_ERR            : 0xB0,
  STATUS_RECORDS_TIME_SHORT       : 0xC0,
  STATUS_RECORDS_NO_STOP          : 0xC1,
  STATUS_DEVICE_UNKNOWN_ERR       : 0xFF,
```

