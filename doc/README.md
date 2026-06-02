# ble sdk：微信小程序插件版

- 插件名称：megable
- 链接地址：https://mp.weixin.qq.com/wxopen/pluginbasicprofile?action=intro&appid=wxf4fa9b179dfd7bca&token=&lang=zh_CN

## 功能简介

提供与智能指环蓝牙交互的功能

- 主要功能

  1. 血氧实时模式

     说明：实时输出，戒指自身不存储

     数据内容：血氧(SpO2)，心率(pr)，睡眠分期

  2. 血氧监测模式

     说明：实时输出，同时戒指自身存储。方便手机与戒指断开，待监测结束后，异步收取监测数据

  3. 脉诊模式

     说明：特定版本支持输出脉诊数据
  
  4. BP收取
  
     1. 设置BP校准 格式
  
        ```
        [
        	[sbp1,dbp1,hours1],
        	[sbp2,dbp2,hours2],
        	[sbp3,dbp4,hours3],
        	[sbp4,dbp4,hours4]
        ]
        hours是整点的时间，范围0-23
        ```
  
     2. BP功能需要版本支持
  
  5. HRV收取

## 快速开始

1. 微信小程序引入插件

2. 初始化 sdk，得到 ble client 实例；client 设置 callback，用于接收戒指事件通知

3. 使用 MegaBleScanner，进行扫描，得到目标 device

4. client 连接 device，等待连接成功

5. 绑定戒指(首次连或 token 不匹配，需要晃动戒指才能连上。收到 token 后，用 token 连即可跳过晃动)
   - 非绑定设备状态下: client.startWithoutToken('5837288dc59e0d00577c5f9a', mac)
   - 已绑定设备状态下: client.startWithToken('5837288dc59e0d00577c5f9a', token)
   - 注意：如果 token 不匹配，戒指之前的监测就会停止（数据还在，收取报告会上传）。
6. 【必须】在 callback 的 onSetUserInfo 回调中，设置用户身体信息 client.setUserInfo。这一步在之前设置 callback 时预先写好即可

    注意：如果没有设置用户信息，会当成新用户对待，每次连接戒指都会提示晃动，并且结束之前设置的监测。

7. 连接进入 idle（空闲）状态，用户可以开始操作，如：收缓存在戒指中的记录、开关监测

8. （可选）解析数据，可以输出报告统计信息，视业务需求实现。

<!-- 用户id格式：12个byte组成的十六进制字符串，总长24。若不关心userid，可填12个"00" -->

## 初始化

> 导入库

```
// import from plugin
var blePlugin = requirePlugin("megable")

const APPID = 'Your own id'
const APPKEY = 'Your own key'

const {
  initSdk, // for the ble client; connect, send message to the device,
  MegaBleScanner, // for scanning
  MegaBleStatus, // for onOperationStatus const
  MegaUtils, // 1.1.4 增加
} = blePlugin.ble;
```

> 扫描设备蓝牙

```
// scan 实例化MegaBleScanner获得（操作蓝牙扫秒的的一些方法，详见：下方API中的 class MegaBleScanner）
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


// 扫描时，请解析广播以获取真实的mac和sn，device来源于 new MegaBleScanner(res => {}) 中的res
MegaUtils.parseAdv(device.advertisData) // {mac, sn}
```

> 连接

```
var blePlugin = requirePlugin("megable")
const {
  initSdk, // for the ble client; connect, send message to the device,
  MegaBleScanner, // for scanning
  MegaBleStatus, // for onOperationStatus const
  MegaUtils, // 1.1.4 增加
} = blePlugin.ble;


// 首先要初始化SDK获取到client（客户端用来调用蓝牙插件的一些方法，详见：下方API中的 class MegaBleClient ）。
let client;
initSdk(APPID, APPKEY, wx).then(clnt => {
        // 将初始化获取到的clnt保存到上面定义的client变量里，下面要用到。
        client = clnt;
    }).catch(err => console.error(err))
})

// 设置回调函数集合给蓝牙插件，蓝牙插件对戒指进行操作产生结果后，会调用相应的客户端回调函数，将结果传给客户端。
client.setCallback(genMegaCallback());

// 回调函数，需要的回调函数及作用，详见下方API中的 mega ble callback
genMegaCallback(){
    return {
        // 例如下面onSyncMonitorDataComplete，蓝牙将戒指里的报告数据读取完后会调用，将报告数据放到bytes里返回。
        onSyncMonitorDataComplete:(bytes, dataStopType, dataType) => {}
        ......
    }
}

// 上面扫描操作后会得到一个devices列表，去其中一个device进行连接，使用初始化插件的到的client中的connect方法。
client.connect(device.name, device.deviceId, device.advertisData).then(res => {

    // get cached token, '5837288dc59e0d00577c5f9a' will always be ok to use.
    // 绑定戒指(首次连或token不匹配，需要晃动戒指才能连上。收到token后，用token连即可跳过晃动)
    if (token && token.indexOf(',') != -1) {
        client.startWithToken('5837288dc59e0d00577c5f9a', token).then(
            res => console.log(res)
        ).catch(err => console.error(err));
    } else {
    // no cached token, just use '0,0,0,0,0,0';
    // 没有token或不匹配时，蓝牙插件会自动调用设置好的genMegaCallback中的onKnockDevice回调方法，
    // 客户端可以在onKnockDevice中写用以提示用户晃动戒指的部分。
    client.startWithoutToken('5837288dc59e0d00577c5f9a', device.mac).then(
        res => console.log(res)
    ).catch(err => console.error(err));
}).catch(err => console.error(err))

```

> 上传数据

```
const onSyncMonitorDataComplete = (bytes, dataStopType, dataType) => {
		bytes:数据,
		dataStopType：结束类型, 
		dataType：报告类型
}
```

具体的上传请参考 demohttps://github.com/megahealth/WX_XCX_plugin_demo/blob/main/%E4%BD%BF%E7%94%A8%E6%96%87%E6%A1%A3.md

## API

- class MegaBleScanner:
  - initBleAdapter()
  - stopScan()
  - scan()
  
- class MegaBleClient:

  - connect(name, deviceId, advertisData)

    - 连接设备
  - startWithoutToken(userId, mac) // deprecated
  - startWithToken(userId, token)

    - 用户 id 格式：12 个 byte 组成的十六进制字符串，总长 24。若不关心 userid，可使用模板"5837288dc59e0d00577c5f9a"，或 12 个"00"
  - setUserInfo(age, gender, height, weight, stepLength)

    - 女(0), 男(1); 身高(cm); 体重(kg); 步长(cm)
    - 例：client.setUserInfo(25, 1, 170, 60, 0)
  - enableRealTimeNotify(enable)
    - 打开全局实时通道，接收实时数据（血氧、电量值，电量状态等），可重复调用
  - enableLive(enable)

    - 开启血氧实时模式
  - enableMonitor(enable）
    - 开启血氧监测模式
  - syncData()
    - 同步血氧监测记录，只有开启血氧监测才会产生；监测结束后，电量正常或充电时，才可收取
  - quickReport()
    - 快速收取血氧监测记录
  - syncBpAndHrvData()
    - syncBpAndHrvData(1) 收取BP
    - syncBpAndHrvData(2) 收取HRV
  - setPulseMode(enable, time)
    - 参数一 状态true、false
    - 参数二 脉诊回调间隔毫秒
  - setBPCalibration(BPCalibrationArr)
    - [[sbp1,dbp1, hour1], [sbp2,dbp2, hour2], [sbp3,dbp3, hour3], [sbp4,dbp4, hour4] ]
    - hour-x 范围0-23
  - enableRawdata()
    - 调试接口，一般用不到
  - disableRawdata()
  - disconnect()
    - 断开连接
  - closeBluetoothAdapter()
    - 释放蓝牙资源

- scanner callback

- onDeviceFound(devices) {}

- mega ble callback

  - onAdapterStateChange: (res) => {}

    - 蓝牙适配器状态变化，available 蓝牙是否可用，discovering 蓝牙是否正在搜索
    - res={ available: true, discovering: false }

  - onConnectionStateChange: (res) => {}

    - 连接状态变化。
    - connected：false=>true（设备连接成功） true=>(设备断开连接)
    - res={ connected：true，deviceId：'BC:E5:9F:48:89:20' }

  - onBatteryChanged: (value, status) => {}

    - 电量变化 value：电量。 status：电池状态
    - status 参考 STATUS_BATT 列表

  - status 参考 STATUS_BATT 列表

  - onTokenReceived: (token) => {}

    - token 是每次绑定唯一,被别的设备绑了，之前的 token 就失效了,只要不被别的手机绑定，token 就有效。
    
  - onKnockDevice: () => {}

    - 需要 ui 提示晃动戒指以绑定

  - onOperationStatus: (cmd, status) => {}

    - 操作错误提示码 见下面 STATUS 文档

  - onEnsureBindWhenTokenNotMatch: () => {} // deprecated

  - onError: (status) => {}

  - onCrashLogReceived: (a) => {}

  - onSyncingDataProgress: (progress) => {}

    - 数据同步进度

  - onSyncMonitorDataComplete: (bytes, dataStopType, dataType,deviceInfo) => {}

    - 1.1.9 版本添加 deviceInfo,监测数据同步成功
    - 睡眠、BP、HRV都会走这个回调

  - onSyncDailyDataComplete: (bytes) => {}

    - 日常数据同步成功

  - onSyncNoDataOfMonitor: () => {}

    - 睡眠、BP、HRV没有监测数据可供同步

  - onSyncNoDataOfDaily: () => {}

    - 没有日常数据可供同步

  - onV2BootupTimeReceived: time => {}

  - onBatteryChangedV2: (value, status, druation) => {}

  - onHeartBeatReceived: heartBeat => {}

  - onV2PeriodSettingReceived: v2PeriodSetting => {}

  - onV2PeriodEnsureResponsed: a => {}

  - onV2PeriodReadyWarning: a => {}

  - onLiveDataReceived: live => {}

  - onV2LiveSleep: v2LiveSleep => {}

    收到血氧监测模式 live 数据; status 参考 STATUS_LIVE 列表

  - onV2LiveSport: v2LiveSport => {}

  - onV2LiveSpoMonitor: v2LiveSpoMonitor => {}

    收到血氧实时模式 live 数据; status 参考 STATUS_LIVE 列表

  - onSetUserInfo: () => {}

    - 设置用户信息 【 必须预设一个用户信息，否者每次连接都会被认为是新用户 ，提示晃动戒指】

  - onSetUserInfo() { client.setUserInfo(25, 1, 170, 60, 0 ) } 年龄、性别、身高、体重、步长

  - onIdle: () => {}

  连接进入空闲

  - onDeviceInfoUpdated: deviceInfo => {},

  onidle 触发前的 onDeviceInfoUpdated，有 isRunning，代表处于监测模式

  - onRawdataReceiving: (count, bleCount, rawdataDuration) => {}

  - onRawdataComplete: info => {},
    onDfuProgress: progress => {}

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
  STATUS_REFUSED                  : 0xA4, // 充电。充电时不可有开启命令类操作。但可同步数据
  STATUS_44XX_ERR                 : 0xA5,
  STATUS_GSENSOR_ERR              : 0xA6,
  STATUS_BQ25120_IS_FAULT         : 0xA7,

  STATUS_DEVICE_HW_ERR            : 0xB0,
  STATUS_RECORDS_TIME_SHORT       : 0xC0,
  STATUS_RECORDS_NO_STOP          : 0xC1,
  STATUS_DEVICE_UNKNOWN_ERR       : 0xFF,

  // 实时值状态指示 （各模式通用）
  STATUS_LIVE_VALID       : 0, // 实时值有效
  STATUS_LIVE_PREPARING   : 1, // 值准备中
  STATUS_LIVE_INVALID     : 2, // 无效/离手

  // 电量状态指示
  STATUS_BATT_NORMAL      : 0, // 电量正常
  STATUS_BATT_CHARGING    : 1, // 充电中
  STATUS_BATT_FULL        : 2, // 充满
  STATUS_BATT_LOWPOWER    : 3, // 低电
  STATUS_BATT_ERROR       : 4, // 异常
  STATUS_BATT_SHUTDOWN    : 5, // 休眠

  // mode 戒指工作模式
  MODE_MONITOR            : 1, // 监测模式(血氧)
  MODE_SPORT              : 2, // 运动模式
  MODE_DAILY              : 3, // 空闲模式
  MODE_LIVE               : 4, // 实时模式(血氧)
  MODE_BP                 : 5, // bp模式
```

## 小程序demo

[微信小程序示例](https://github.com/megahealth/WX_XCX_plugin_demo)

