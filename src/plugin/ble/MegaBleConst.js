export const BLE_CFG = {
  SVC_ROOT: '0000FAB1-0000-1000-8000-00805F9B34FB',
  CH_WRITE: '0000FAB2-0000-1000-8000-00805F9B34FB',
  CH_WRITE_N: '0000FAB3-0000-1000-8000-00805F9B34FB',
  CH_INDICATE: '0000FAB4-0000-1000-8000-00805F9B34FB',
  CH_NOTIFY: '0000FAB5-0000-1000-8000-00805F9B34FB',
  CH_READ: '0000FAB6-0000-1000-8000-00805F9B34FB',

  SCV_LOG: '0000FAF1-0000-1000-8000-00805F9B34FB',
  CH_LOG_NOTIFY: '0000FAF3-0000-1000-8000-00805F9B34FB',

  SVC_DFU: '00001530-1212-EFDE-1523-785FEABCD123',
  CH_DFU_CTRL: '00001531-1212-EFDE-1523-785FEABCD123',
  CH_DFU_PACK: '00001532-1212-EFDE-1523-785FEABCD123',
  CH_DFU_READ: '00001534-1212-EFDE-1523-785FEABCD123',
}

export const CMD = {
  SHUTDOWN                    : 0xb2, // 停摆
  FAKEBIND                    : 0xb0,
  RESET                       : 0xe2,
  LIVECTRL                    : 0xed,
  RAWDATA                     : 0xf0,
  CRASHLOG                    : 0xf3, // app get crash log
  SETTIME                     : 0xe0,
  SETUSERINFO                 : 0xe3, //  30, 0, 170, 60, 0
  FINDME                      : 0xb1,
  MONITOR                     : 0xd0,
  SYNCDATA                    : 0xeb,
  NOTIBATT                    : 0xd2,
  NOTISTEP                    : 0xe9,
  HEARTBEAT                   : 0xd3, // APP_KEEPALIVE_CMD

  V2_MODE_SPO_MONITOR         : 0xd0, // 模式: 血氧监护
  V2_MODE_ECG_BP              : 0xd4, // 模式: 血压
  V2_MODE_SPORT               : 0xd5, // 模式: 运动
  V2_MODE_DAILY               : 0xd6, // 模式: 日常
  V2_MODE_LIVE_SPO            : 0xd7, // 模式: 实时血氧仪
  V2_GET_MODE                 : 0xf6, // get current v2 mode
  V2_GET_BOOTUP_TIME          : 0xf7, // v2 get 设备启动时间
  V2_APP_NOTIFY_DFU_CMD		    : 0xD8,
  V2_GET_PERIOD_SETTING		    : 0xF8,
  V2_PERIOD_MONITOR_SET       : 0xD9,
  V2_PERIOD_MONITOR_ENSURE    : 0xCE, // 确认以定时方式开始监测
  V2_PERIOD_MONITOR_INDIC     : 0xCF, // 定时监测确认开启的提醒 通过indicate上报

  CTRL_LIVE_START      : 0,
  CTRL_LIVE_STOP       : 1,
  CTRL_RAWDATA_ON      : 0,
  CTRL_RAWDATA_OFF     : 1,
  CTRL_MONITOR_OFF     : 0,
  CTRL_MONITOR_ON      : 1,
  CTRL_MONITOR_PAUSE   : 2,
  CTRL_SCREEN_OFF      : 1,
  CTRL_SCREEN_ON       : 0,
  CTRL_MONITOR_DATA    : 0xef,
  CTRL_DAILY_DATA      : 0xf1,
  CTRL_AFE_SPO2        : 1,
  CTRL_AFE_EHR         : 2,
  CTRL_NORMAL_ON       : 1,
  CTRL_NORMAL_OFF      : 0,
}


export const STATUS = {
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
}

export const Config = {
  AppId: '',
  AppKey: '',
  debugable: false,
}
