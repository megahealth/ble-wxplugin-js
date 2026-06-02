const  {parseAdv, openBluetoothAdapter} =require("./MegaUtils") ;

class MegaBleScanner {

  constructor(onDeviceFound) {
    this.isScanning = false
    this.onDeviceFound = onDeviceFound
  }

  initBleAdapter() {
    return openBluetoothAdapter().then(res => {
      this._registCallback()
      return res
    })
  }

  _registCallback() {
    wx.onBluetoothDeviceFound(res => {
      res.devices = res.devices.filter(i => {
        return !!(i.name && (
          i.name.toLowerCase().indexOf('ring') !== -1 ||
          i.name.toLowerCase().indexOf('mr') !== -1 ||
          i.name.toLowerCase().indexOf('sle') !== -1
        ));
      })
      if (res.devices[0]){
          const parse = parseAdv(res.devices[0].advertisData);
          if(parse){
            res.devices[0].sn=parse.sn
            res.devices[0].mac=parse.mac
            this.onDeviceFound(res)
          }
        }
    })
  }

  scan() {
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
    }
    this.isScanning = false
  }

}

module.exports= MegaBleScanner
