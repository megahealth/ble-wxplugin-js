import { crc16XModem, intToByte4 } from "./MegaUtils"
import { CMD } from "./MegaBleConst"

const CRC_LEN = 2
const PAYLOAD_LEN = 19

class MegaBleBigDataManager {
  totalBytes = []
  subSnMap = {}

  totalLen = 0
  subLen = 0

  mReportPack = []
  mReportPackMissPack = []

  ver = []
  stopType = 0
  dataType = 0

  constructor(iDataCallback) {
    this.iDataCallback = iDataCallback
  }

  handleTransmitPermited(a) {
    this.ver = [a[3], a[6], 0, 0]
    this.stopType = a[4]
    this.dataType = a[6]
  }

  handleCtrlIndicate(a) {
    if (a[2] == 0) { // 一大包开始了
      this.totalLen = (a[3] << 24) | (a[4] << 16) | (a[5] << 8) | (a[6])
      this.subLen = ((a[7] << 8) | a[8])
      console.log(`Total length: ${this.totalLen}, sub length: ${this.subLen}`)
      this.subSnMap = {}
      this.mReportPackMissPack = new Uint8Array(16)
    } else if (a[2] == 1) { // 一包传完了，开始检查，有无漏包
      const refNum = Math.ceil((this.subLen + CRC_LEN) / PAYLOAD_LEN)
      const missedNum = refNum - Object.keys(this.subSnMap).length
      this.mReportPack = new Uint8Array(20)
      this.mReportPack[0] = a[0]
      this.mReportPack[1] = a[1]

      missedNum === 0 ? this.handleNoMiss(a) : this.handleMiss(missedNum)
    }
  }

  handleNotify(a) {
    if (!this.mReportPackMissPack) {
      console.log('Big data receive warning: Notify comes ahead of indicate, app_report_pack_misspart has not been initiated')
      return
    }
    const sn = a[0]
    if (!this.subSnMap.hasOwnProperty(sn)) {
      this.subSnMap[sn] = a.subarray(1)
      this.mReportPackMissPack[Math.floor(sn / 8)] |= 1 << (sn % 8)
    }
  }

  handleNoMiss(a) {
    const length = Object.keys(this.subSnMap).length
    let rawSub = []
    for (let i = 0; i < length; i++) {
      rawSub = rawSub.concat(Array.from(this.subSnMap[i]))
    }
    rawSub.splice(this.subLen + 2)
    const crcBytes = rawSub.splice(-2) // rawSub now has no crc bytes
    const bleCrc = (crcBytes[1] | crcBytes[0] << 8)
    const myCrc = crc16XModem(rawSub)

    console.log(`blecrc: ${bleCrc}, mycrc: ${myCrc}`)
    if (myCrc === bleCrc) { // crc一致
      this.mReportPack[2] = 1 // 1 ：续传；0：丢包重传、crc错误重传
      this.iDataCallback.writeReportPack(this.mReportPack)

      // 将已收到的搜集起来
      this.totalBytes = this.totalBytes.concat(rawSub)
      if (this.totalLen <= 0) return
      const progress = Math.floor(this.totalBytes.length * 100 / this.totalLen)
      this.iDataCallback.onProgress(progress)
      console.log("receiving data, progress " + progress)

      if (this.totalLen > 0 && this.totalLen == this.totalBytes.length) { // transmit complete
        const finalBytes = this.ver.concat(this.totalBytes)
        if (a[0] == CMD.CTRL_MONITOR_DATA) {
          this.iDataCallback.onMonitorDataComplete(finalBytes, this.stopType, this.dataType) // 继续请求看ble有没有 运动/日常 数据了。
          setTimeout(() => this.iDataCallback.syncMonitorData(), 1200)
        } else if (a[0] == CMD.CTRL_DAILY_DATA) {
          const timestampBytes = intToByte4(Math.floor(Date.now() / 1000))
          const dailyBytes = timestampBytes.concat(finalBytes)
          this.iDataCallback.onDailyDataComplete(dailyBytes)
          setTimeout(() => this.iDataCallback.syncDailyData(), 1200)
        }
      }
    } else { // crc不一致
      console.error('crc wrong!')
      this.mReportPack[2] = 0
      this.mReportPack[3] = 0xff
      this.iDataCallback.writeReportPack(this.mReportPack)
    }
  }

  handleMiss(miss) {
    this.mReportPack[2] = 0 //1 ：续传；0：丢包重传、crc错误重传
    this.mReportPack[3] = miss
    this.mReportPack.set(this.mReportPackMissPack, 4)
    this.iDataCallback.writeReportPack(this.mReportPack)
  }
}

export default MegaBleBigDataManager
