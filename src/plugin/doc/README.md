# 兆观ble sdk：微信小程序插件版
- 插件名称：megable
- 链接地址：https://mp.weixin.qq.com/wxopen/pluginbasicprofile?action=intro&appid=wxf4fa9b179dfd7bca&token=&lang=zh_CN

## 功能简介
提供与兆观公司智能指环蓝牙交互的功能

- 主要功能
  1. 血氧实时模式

        说明：实时输出，戒指自身不存储

        数据内容：血氧(SpO2)，心率(pr)，睡眠分期

  2. 血氧监测模式

        说明：实时输出，同时戒指自身存储。方便手机与戒指断开，待监测结束后，异步收取监测数据
    
- 推荐的App端工作流程
  - [工作流程图](https://file-mhn.megahealth.cn/62630b5d10f14ecce727/App%E4%B8%8E%E6%88%92%E6%8C%87%E4%BA%A4%E4%BA%92%E6%B5%81%E7%A8%8B%E5%9B%BE.pdf)
    
    这是完整功能的流程，请结合实际业务需求调整。例如：只用到血氧实时模式，就实时接收数据即可，不用考虑异步收取监测数据的问题。


## 快速开始
1. 微信小程序引入插件
2. 初始化sdk，得到ble client实例；client设置callback，用于接收戒指事件通知
3. 使用MegaBleScanner，进行扫描，得到目标device
4. client连接device，等待连接成功
5. 绑定
    - 非绑定设备状态下: client.startWithToken('5837288dc59e0d00577c5f9a', '0,0,0,0,0,0')
    - 已绑定设备状态下: client.startWithToken('5837288dc59e0d00577c5f9a', token)
6. 在callback的onSetUserInfo回调中，设置用户身体信息client.setUserInfo。这一步在之前设置callback时预先写好即可
7. 连接进入idle（空闲）状态，用户可以开始操作，如：收缓存在戒指中的记录、开关监测
8. （可选）解析数据，可以输出类似《兆观健康Pro》中的报告统计信息，视业务需求实现。


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
} = blePlugin.ble;
```

> 扫描设备蓝牙

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

> 连接

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
    - startWithoutToken(userId, mac) // deprecated
    - startWithToken(userId, token) 

        用户id格式：12个byte组成的十六进制字符串，总长24。若不关心userid，可使用模板"5837288dc59e0d00577c5f9a"，或12个"00" 
    - setUserInfo(age, gender, height, weight, stepLength)
        
        女(0), 男(1); 身高(cm); 体重(kg); 步长(cm)

        例：client.setUserInfo(25, 1, 170, 60, 0)
    - enableRealTimeNotify(enable)
        
        打开全局实时通道，接收实时数据（血氧、电量值，电量状态等），可重复调用
    - enableLive(enable)

        开启血氧实时模式
    - enableMonitor(enable)

        开启血氧监测模式
    - syncData() 

        同步血氧监测记录，只有开启血氧监测才会产生；监测结束后，电量正常或充电时，才可收取
    - enableRawdata()

        调试接口，一般用不到
    - disableRawdata()
    - disconnect() 

        断开连接
    - closeBluetoothAdapter()

        释放蓝牙资源

- scanner callback
    - onDeviceFound(devices) {}

- mega ble callback
    - onAdapterStateChange: (res) => {}
    - onConnectionStateChange: (res) => {}
    - onBatteryChanged: (value, status) => {}

        status参考STATUS_BATT列表

    - onTokenReceived: (token) => {}
    - onK/n0o'oockDevice: () => {}
        m
        需要ui提示晃动戒指以绑定
    - onOperationStatus: (cmd, status) => {}

        见下面STATUS文档
    - onEnsureBindWhenTokenNotMatch: () => {} // deprecated
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

        收到血氧实时模式live数据; status参考STATUS_LIVE列表
    - onV2LiveSport: v2LiveSport => {}
    - onV2LiveSpoMonitor: v2LiveSpoMonitor => {}

        收到血氧监测模式live数据; status参考STATUS_LIVE列表
    - onSetUserInfo: () => {}
    - onIdle: () => {}

        连接进入空闲
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
```

## demo的运行方法
demo使用了taro框架，具体可参考taro官方文档

1. 安装taro
    
    yarn global add @tarojs/cli@1.3.12
2. 运行

    npm run build:weapp -- --watch
3. build

    taro build --type weapp

4. 微信开发工具导入dist文件夹，预览
