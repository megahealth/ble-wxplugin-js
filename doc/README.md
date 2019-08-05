# 兆观ble插件

- 初始化
```
const APPID = ''
const APPKEY = ''
MegaBleClient.init(APPID, APPKEY)
```

- class MegaBleScanner:
    - initBleAdapter()
    - stopScan()
    - scan()
- class MegaBleClient:
    - connect(name, deviceId, advertisData)
    - startWithoutToken(userId, mac) 
    - startWithToken(userId, token) 
    - setUserInfo(age, gender, height, weight, stepLength) 
    - toggleLive(enable) 
    - enableV2ModeLiveSpo(ensure) 
    - enableV2ModeDaily(ensure) 
    - enableV2ModeSpoMonitor(ensure) 
    - syncData() 
    - enableRawdata() 
    - disableRawdata()
    - clear()
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