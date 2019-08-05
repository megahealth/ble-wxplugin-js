class MegaBleScanner {

  constructor(onDeviceFound) {
    this.isScanning = false
    this.onDeviceFound = onDeviceFound
  }

  initBleAdapter() {
    return new Promise((resolve, reject) => {
      wx.openBluetoothAdapter({
        // 蓝牙正常，再初始化回调
        success: res => {
          this._registCallback()
          resolve(res)
        },
        // 蓝牙有可能被关闭了，可以监听蓝牙开关情况，以便重新开始扫描
        fail: err => reject(err),
      })
    })
  }

  _registCallback() {
    wx.onBluetoothDeviceFound(res => {
      res.devices = res.devices.filter(i => {
        if (i.name && (
          i.name.toLowerCase().indexOf('ring') != -1 ||
          i.name.toLowerCase().indexOf('sle') != -1
        )) return true
        return false
      })
      if (res.devices.length > 0) this.onDeviceFound(res)
    })
  }

  scan() {
    console.log('scan start...');

    return new Promise((resolve, reject) => {
      if (this.isScanning) {
        reject('isScanning')
        return
      }
      this.isScanning = true
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: true,
        success: res => resolve(res),
        fail: err => reject(err)
      })
    })
  }

  stopScan() {
    if (this.isScanning) {
      wx.stopBluetoothDevicesDiscovery()
      console.log('scan stop!')
    }
    this.isScanning = false
  }

}

export default MegaBleScanner