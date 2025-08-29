// pages/scan/scan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanner:null,
    scanList:[]
  },
  scan(){
    this.scanner.scan()
    setTimeout(() => {
        if (this.scanner && this.scanner.isScanning) this.scanner.stopScan()
    }, 10000)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const blePlugin = requirePlugin("megable")
    const {MegaBleScanner,MegaUtils} = blePlugin.ble
    this.scanner=new MegaBleScanner(res => {
      const info = MegaUtils.parseAdv(res.devices[0].advertisData)
      if(info&&info.sn&&!info.sn.includes("NaN")&&!info.sn.includes("undefined")){
        const device={
          sn:info.sn,
          mac:info.mac,
          deviceId:res.devices[0].deviceId,
          name:res.devices[0].name,
          RSSI:res.devices[0].RSSI,
          advertisData:res.devices[0].advertisData
        }
        const list = this.updateOrAddToArray(this.data.scanList,device,'deviceId')
        const sortedItems = list.sort((a, b) => b.RSSI - a.RSSI)
        this.setData({
          scanList: sortedItems
        })
      }
    })
    this.scanner.initBleAdapter().then(() => {})
  },
  connect(a){
    if (this.scanner && this.scanner.isScanning) this.scanner.stopScan()
    wx.setStorageSync('device',  a.currentTarget.dataset.device)
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },
  updateOrAddToArray(array, newData,name) {
    const index = array.findIndex(item => item[name] === newData[name]);
    // 如果数据已存在，则更新它
    if (index !== -1) {
        array[index] = newData;
    } else {
        // 否则将数据添加到数组中
        array.push(newData);
    }
    return array;
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
    const value = wx.getStorageSync('device')
    if(value){
      wx.redirectTo({
        url: '/pages/index/index'
      })
    }
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