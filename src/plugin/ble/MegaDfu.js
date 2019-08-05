// import { BLE_CFG } from "./MegaBleConst";
// import { u8s2hex, getDfuMac } from "./MegaUtils";

// // /**
// //  * 
// //  * @param {ArrayBuffer} arr 
// //  * @param {number} offset 
// //  */
// // const cutArrayBuffer = (a, offset) => {
// //   if (offset <= 0) return [a]
// //   let res = []
// //   let t = Math.floor(a.byteLength / offset)
// //   for (let i = 0; i < t; i++) {
// //     res.push(a.slice(offset * (i), offset * (i + 1)))
// //   }
// //   let ret = a.byteLength % offset
// //   if (ret !== 0) res.push(a.slice(ret * -1))
// //   return res
// // }

// const DFU_TYPE = {
//   bootloader: 2,
//   application: 4,
// }
// const INTERVAL = 12;
// const ONE_PACK_LEN = 20;

// class MegaDfu {
//   sentLength
//   payload
//   initPack

//   updateType = null
//   fileManager = null
//   deviceId = null
//   onProgress = null

//   cnt = 0

//   constructor(dfuDir, indexObj, deviceId) {
//     this.dfuDir = dfuDir
//     this.deviceId = getDfuMac(deviceId)

//     this.fileManager = wx.getFileSystemManager()
//     this.getDfuType(indexObj)
//   }

//   initCallback() {
//     wx.onBLECharacteristicValueChange(characteristic => {
//       if (characteristic.deviceId === this.deviceId) {
//         const a = new Uint8Array(characteristic.value)
//         switch (characteristic.characteristicId) {
//           case BLE_CFG.CH_DFU_CTRL:
//             this.handleCtrlResponse(a)
//             break;

//           case BLE_CFG.CH_DFU_READ:
//             console.log('dfu read: ', u8s2hex(a))
//             break;

//           default:
//             break;
//         }
//       }
//     })
//   }

//   setDeviceId(deviceId) {
//     this.deviceId = deviceId
//   }

//   getDfuType(indexObj) {
//     let binFile, datFile
//     if (indexObj.manifest.hasOwnProperty('application')) {
//       this.updateType = 'application'
//       binFile = indexObj.manifest.application.bin_file
//       datFile = indexObj.manifest.application.dat_file
//     } else if (indexObj.manifest.hasOwnProperty('bootloader')) {
//       this.updateType = 'bootloader'
//       binFile = indexObj.manifest.bootloader.bin_file
//       datFile = indexObj.manifest.bootloader.dat_file
//     }

//     this.initPackages(binFile, datFile)
//   }

//   initPackages(binFile, datFile) {
//     // 读bin_file文件，获取:文件总长度，和每20字节分包的结果
//     const binBuffer = this.fileManager.readFileSync(this.dfuDir + '/' + binFile)
//     console.log('DFU binFile length: ' + binBuffer.byteLength)
//     this.sentLength = binBuffer.byteLength
//     this.payload = binBuffer
//     this.initPack = this.fileManager.readFileSync(this.dfuDir + '/' + datFile)
//   }

//   async start() {
//     this.initCallback()
//     await this.runDfu()
//   }

//   async runDfu() {
//     console.log('Dfu process started >>>')
//     try {
//       await this._read()
//       await this._enablePipe()
//     } catch (err) {
//       console.error(err)
//     }

//     await new Promise(resolve => setTimeout(resolve, 500))
//     await this._writeCtrl(new Uint8Array([0x01, DFU_TYPE[this.updateType]]))
//     let data = null
//     if (this.updateType.startsWith('a')) {
//       data = new Uint32Array([0x00000000, 0x00000000, this.sentLength])
//     } else if (this.updateType.startsWith('b')) {
//       data = new Uint32Array([0x00000000, this.sentLength, 0x00000000])
//     }

//     await this._writePack(data)
//   }

//   async handleCtrlResponse(a) {
//     console.log('Dfu notify receive: ' + a.toString())
//     switch (a.toString()) {
//       case [0x10, 0x01, 0x01].toString():
//         console.log('Dfu enter 1st noti judge.')
//         await this._writeCtrl([0x02, 0x00])
//         console.log('Dfu write Initialize Parameters ok, ' + u8s2hex([2, 0]))
//         await this._writePack(this.initPack)
//         console.log('Dfu send header package ok, ' + u8s2hex(new Uint8Array(this.initPack)))
//         await this._writeCtrl([0x02, 0x01])
//         console.log('Dfu send cmd ok, ' + u8s2hex([2, 1]))
//         break;
//       case [0x10, 0x02, 0x01].toString():
//         // 0c 代表一次发12包
//         await this._writeCtrl([0x08, INTERVAL, 0x00])
//         console.log('Dfu send cmd ok, ' + u8s2hex([0x08, INTERVAL, 0x00]))
//         await this._writeCtrl([0x03])
//         console.log('Dfu send ok [3]. start sendPayload >>>')
//         // ble, 终于要给你丫送数据了，接着吧
//         await this.sendPayload()
//         break;
//       case [0x10, 0x03, 0x01].toString():
//         await this._writeCtrl([0x04])
//         console.log('Dfu sent cmd ok, [4]')
//         break;
//       case [0x10, 0x04, 0x01].toString():
//         try {
//           await new Promise(resolve => setTimeout(resolve, 500))
//           await this._writeCtrl([0x05])
//         } catch (err) {
//           console.error(err)
//         }
//         console.log('Dfu sent cmd ok, [5], DFU complete!')
//         break;

//       default:
//         if (a[0] === 0x11) {
//           let alreadyReceiveLength = a[1] | (a[2] << 8) | (a[3] << 16) | (a[4] << 24)
//           // console.log('ble report already receive:' + alreadyReceiveLength + '/' + this.sentLength)
//           this.onProgress(Math.ceil(alreadyReceiveLength * 100 / this.sentLength))
//           await new Promise(resolve => setTimeout(resolve, 20))
//           await this.sendPayload()
//         }
//         break;
//     }
//   }

//   async sendPayload() {
//     let subLen = ONE_PACK_LEN
//     for (let i = 0; i < INTERVAL; i++) {
//       if (this.cnt >= this.sentLength) return
//       if (this.cnt + ONE_PACK_LEN > this.sentLength) {
//         subLen = this.sentLength - this.cnt
//       }

//       try {
//         await this._writePack(this.payload.slice(this.cnt, this.cnt + subLen))
//         this.cnt += ONE_PACK_LEN
//       } catch (error) {
//         console.error('1st write error:', error)
//         await new Promise(resolve => setTimeout(resolve, 200))
//         try {
//           await this._writePack(this.payload.slice(this.cnt, this.cnt + subLen))
//           this.cnt += ONE_PACK_LEN
//         } catch (error) {
//           console.error('2nd write error:', error)
//         }
//       }
//     }
//   }

//   on(fn) {
//     this.onProgress = fn
//   }

//   // -----------------------------------

//   _read() {
//     return new Promise((resolve, reject) => {
//       wx.readBLECharacteristicValue({
//         deviceId: this.deviceId,
//         serviceId: BLE_CFG.SVC_DFU,
//         characteristicId: BLE_CFG.CH_DFU_READ,
//         success: res => resolve(res),
//         fial: err => reject(err),
//       })
//     })
//   }

//   _enablePipe() {
//     return new Promise((resolve, reject) => {
//       wx.notifyBLECharacteristicValueChange({
//         deviceId: this.deviceId,
//         serviceId: BLE_CFG.SVC_DFU,
//         characteristicId: BLE_CFG.CH_DFU_CTRL,
//         state: true,
//         success: res => resolve(res),
//         fail: err => reject(err),
//       })
//     })
//   }

//   _writeCtrl(a) {
//     return new Promise((resolve, reject) => {
//       wx.writeBLECharacteristicValue({
//         deviceId: this.deviceId,
//         serviceId: BLE_CFG.SVC_DFU,
//         characteristicId: BLE_CFG.CH_DFU_CTRL,
//         value: a instanceof ArrayBuffer ? a : a instanceof Array ? new Uint8Array(a).buffer : a.buffer,
//         success: res => resolve(res),
//         fail: err => reject(err),
//       })
//     })
//   }

//   _writePack(a) {
//     return new Promise((resolve, reject) => {
//       wx.writeBLECharacteristicValue({
//         deviceId: this.deviceId,
//         serviceId: BLE_CFG.SVC_DFU,
//         characteristicId: BLE_CFG.CH_DFU_PACK,
//         value: a instanceof ArrayBuffer ? a : a instanceof Array ? new Uint8Array(a).buffer : a.buffer,
//         success: res => resolve(res),
//         fail: err => reject(err),
//       })
//     })
//   }

// }


// export default MegaDfu
