// pages/index/index.js
const {config} = require('../../config');
Page({
  data: {
    client: null,
    APPID: config.APPID,//联系开发者
    APPKEY: config.APPKEY,
    device: null,
    otherInfo: null,
    heartBeat: null,
    mode:0,
    LiveSpoMonitor:null,
    LiveSleep:null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const blePlugin = requirePlugin("megable")
    const {
      initSdk
    } = blePlugin
    wx.showLoading({
      title: 'loading',
    })
    const client = await initSdk(this.data.APPID, this.data.APPKEY, wx)
    client.setCallback(this.genMegaCallback());
    this.data.client = client
    this.connect()
  },
  genMegaCallback(dispatch) {
    return {
      onAdapterStateChange: (res) => {
        console.log("ble adapter state change: ", res);
      },
      onConnectionStateChange: (res) => {
        console.log("connection change: ", res);
        if(res.connected===false){
          wx.clearStorage()
          wx.redirectTo({
            url: '/pages/scan/scan'
          })
        }
      },
      //电量变化
      onBatteryChanged: (value, status) => {
        const beat = {
          battPercent: value,
          deviceStatus: status
        }
        this.setData({
          heartBeat: beat
        })
        console.log("onBatteryChanged: ", value, status);
      },
      onTokenReceived: (token) => {
        console.log("onTokenReceived: ", token);
        wx.setStorageSync('token', token)
        wx.hideLoading()
      },
      //摇晃
      onKnockDevice: () => {
        console.log("onKnockDevice");
        wx.showLoading({
          title: 'onKnockDevice',
        })
      },
      //status
      onOperationStatus: (cmd, status) => {
        if (status !== 0) {
          console.log(
            "onOperationStatus: " + cmd.toString(16) + " - " + status.toString(16)
          );
        }
      },
      onEnsureBindWhenTokenNotMatch: () => {},
      onError: (status) => {
        console.log("onError: ", status);
      },
      onCrashLogReceived: () => {},
      //进度
      onSyncingDataProgress: (progress) => {
        console.log("onSyncingDataProgress... " + progress);
        wx.showLoading({
          title: progress,
        })
      },
      //收取睡眠
      onSyncMonitorDataComplete: (bytes, dataStopType, dataType, deviceInfo) => {
        console.log('onSyncMonitorDataComplete',bytes);
        wx.hideLoading()
        // const DeviceInfo = {
        //   mac: deviceInfo.mac,
        //   sn: deviceInfo.sn,
        //   swVer: deviceInfo.swVer,
        // };
        // const reportType = {
        //   dataType: dataType,
        //   dataStopType: dataStopType,
        // };
        // const institutionId = "5d5ce86aba39c800671c5a89";
        // // 组织formdata需要
        // const boundary = `----MegaRing${new Date().getTime()}`;
        //构建formdata
        // function createFormData(params = {}, boundary = "") {
        //   let result = "";
        //   for (let i in params) {
        //     result += `\r\n--${boundary}`;
        //     result += `\r\nContent-Disposition: form-data; name="${i}"`;
        //     result += "\r\n";
        //     result += `\r\n${params[i]}`;
        //   }
        //   // 如果obj不为空，则最后一行加上boundary
        //   if (result) {
        //     result += `\r\n--${boundary}`;
        //   }
        //   return result;
        // }
        // const formData = createFormData({
        //     binData: bytes,
        //     institutionId: institutionId,
        //     remoteDevice: JSON.stringify(DeviceInfo),
        //     reportType: JSON.stringify(reportType),
        //   },
        //   boundary
        // );
        // console.log('formData',formData);
        // request的options
        // const options = {
        //   method: "POST",
        //   url: "https://server-mhn.megahealth.cn/upload//uploadBinData",
        //   header: {
        //     'content-type': 'application/json',
        //     'X-LC-Id': 'f82OcAshk5Q1J993fGLJ4bbs-gzGzoHsz',
        //     'X-LC-Key': 'O9COJzi78yYXCWVWMkLqlpp8',
        //     "Content-Type": `multipart/form-data; boundary=${boundary}`,
        //   },
        //   data: formData,
        //   success (res) {
        //     // console.log("report", res);
        //     console.log("url:",'https://raw.megahealth.cn/parse/parsemhn?objId=' + res.data.reportId);
        //     //拿到res中的报告id调用后处理接口得到json数据： url = 'https://raw.megahealth.cn/parse/parsemhn?objId=' + reportId;
        //   },
        //   fail(err){
        //     console.log(err);
        //   }
        // };
        // wx.request(options)
      },
      //脉诊原始数据
      ontPulse:(bytes)=>{
        console.log("onRawdataPulseParsed",bytes);
      },
      //日常
      onSyncDailyDataComplete: (bytes) => {
        console.log("onSyncDailyDataComplete: ", bytes);
      },
      //无数据
      onSyncNoDataOfMonitor: () => {
        // wx.hideLoading()
        wx.showToast({
          title: 'no Data',
        })
        console.log("onSyncNoDataOfMonitor");
      },
      //无日常
      onSyncNoDataOfDaily: () => {
        wx.hideLoading()
        console.log("onSyncNoDataOfDaily");
      },
      onV2BootupTimeReceived: () => {},
      onBatteryChangedV2: (value, status, druation) => {
        console.log("onBatteryChangedV2: ", value, status, druation);
      },
      //心跳包
      onHeartBeatReceived: (heartBeat) => {
        const beat = {
          battPercent: heartBeat.battPercent,
          deviceStatus: heartBeat.deviceStatus
        }
        this.setData({
          heartBeat: beat
        })
        this.setData({
          mode: heartBeat.mode
        })
        console.log("onHeartBeatReceived: ", heartBeat);
      },
      onV2PeriodSettingReceived: () => {},
      onV2PeriodEnsureResponsed: () => {},
      onV2PeriodReadyWarning: () => {},
      onLiveDataReceived: (live) => {
        console.log("onLiveDataReceived: ", live);
      },
      //实时sleep
      onV2LiveSleep: (v2LiveSleep) => {
        console.log("onV2LiveSleep: ", v2LiveSleep);
        if(this.data.mode!==1){
          this.setData({mode:1})
        }
        this.setData({LiveSleep:v2LiveSleep})
      },
      //实时运动
      onV2LiveSport: (v2LiveSport) => {
        console.log("onV2LiveSport: ", v2LiveSport);
      },
      //实时血氧
      onV2LiveSpoMonitor: (v2LiveSpoMonitor) => {
        console.log(
          "onV2LiveSpoMonitor: ",
          v2LiveSpoMonitor
        );
        this.setData({LiveSpoMonitor:v2LiveSpoMonitor})
      },
      //设置个人信息（）
      onSetUserInfo: () => {
        // age, gender, height, weight, step size
        this.data.client.setUserInfo(25, 1, 170, 60, 0);
      },
      //进入idle
      onIdle: () => {
        wx.hideLoading()
        console.log("idle");
      },
      //更新设备信息
      onDeviceInfoUpdated: (deviceInfo) => {
        if (deviceInfo.otherInfo) {
          // deviceInfo
          this.setData({
            otherInfo: deviceInfo
          })
        }
        console.log('deviceInfo', deviceInfo);
      },
      onRawdataReceiving: (c) => {},
      onRawdataComplete: (info) => {
        console.log(info);
      },
      onDfuProgress: (progress) => {},
    }
  },
  connect() {
    const device = wx.getStorageSync('device')
    this.setData({
      device: device
    })
    this.data.client.connect(device.name, device.deviceId, device.advertisData).then(async () => {
      const token = wx.getStorageSync('token')
      if (token && token.indexOf(',') != -1) {
        await this.data.client.startWithToken('5837288dc59e0d00577c5f9a', token)
      } else {
        await this.data.client.startWithToken('5837288dc59e0d00577c5f9a', '0,0,0,0,0,0')
      }
    })
  },
  // 构建formdata方法

  realTime(event){
    // if(![0,1,2].includes(this.data.heartBeat.deviceStatus)){
    //   wx.showToast({
    //     title: '电量处于非正常状态，请充电后和佩戴好之后，再次进行操作',
    //   })
    //   return 
    // }

    if(event.currentTarget.dataset.enable==='true'){
      this.data.client.enableRealTimeNotify(true)
    }
    if(event.currentTarget.dataset.enable==='false'){
      this.data.client.enableRealTimeNotify(false)
    }
  },
  onLiveSpoMonitor(event){
    // console.log(this.data.heartBeat.deviceStatus===0);
    // if(this.data.heartBeat.deviceStatus!==0){
    //   wx.showToast({
    //     title: '电量处于非正常状态，请充电后和佩戴好之后，再次进行操作',
    //   })
    //   return 
    // }
    if(event.currentTarget.dataset.enable==='true'){
      this.setData({LiveSleep:null})
      this.data.client.enableLive(true)
      return
    }
    if(event.currentTarget.dataset.enable==='false'){
      this.data.client.enableLive(false)
      this.setData({LiveSpoMonitor:null})
      return
    }
  },
  onLiveSleep(event){
    // console.log(this.data.heartBeat.deviceStatus);
    // if(this.data.heartBeat.deviceStatus!==0){
    //   wx.showToast({
    //     title: '电量处于非正常状态，请充电后和佩戴好之后，再次进行操作',
    //   })
    //   return 
    // }

    if(event.currentTarget.dataset.enable==='true'){
      this.setData({LiveSpoMonitor:null})
      this.data.client.enableMonitor(true)
      return 
    }
    if(event.currentTarget.dataset.enable==='false'){
      this.data.client.enableMonitor(false)
      this.setData({LiveSleep:null})
      return
    }
  },
  openPulse(event){
    if(event.currentTarget.dataset.enable==='true'){
      this.data.client.setPulseMode(true,1000)
    }
    if(event.currentTarget.dataset.enable==='false'){
      this.data.client.setPulseMode(false)
    }
    console.log(`output->event.currentTarget.dataset`,event.currentTarget.dataset)
  },
  getData(){
    // if(![0,1,2].includes(this.data.heartBeat.deviceStatus)){
    //   wx.showToast({
    //     title: '电量处于非正常状态，请充电后和佩戴好之后，再次进行操作',
    //   })
    //   return 
    // }
    if(this.data.LiveSleep){
      wx.showToast({
        title: '请关闭监测',
      })
    }else{
      this.data.client.syncData()
    }
  },
  quickReport(){
      this.data.client.quickReport()
  },
  getBP(){
      this.data.client.syncBpAndHrvData(1)
  },
  getHRV(){
      this.data.client.syncBpAndHrvData(2)
  },
  discover(){
    this.data.client.disconnect()
    wx.clearStorage()
    wx.redirectTo({
      url: '/pages/scan/scan'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 卸载
    if(this.data.client)this.data.client.disconnect()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})