import api from './MegaRequest'
import pako from './MegaPako'
import { Config } from './MegaBleConst';
import { yyyymmddhhmmss,arrayBufferToBase64 } from './MegaUtils';
import  {bytesToUint8Array} from './MegaUtils';
const UPLOAD_INTERVAL = 10 // s

class MegaBleRawdataManager {
  constructor(api,callback) {
    this.api = api;
    this.callback=callback
  }
  rawDataLen=0;
  rawDataBytes=null
  rdb=null
  interval=1000; //ms
  intervaler=null
  open() {
    if(Config.debugable)console.log('open')
    //开启rawdata
    this.api.enableRawdata(true)
    if(this.intervaler) {
      clearInterval(this.intervaler)
      this.intervaler=null
    }
  }
  stop(){
    //关闭rawdata
    this.api.enableRawdata(false)
  }
  setReadByte(a,deviceInfo){
    this.readByte=a
    this.deviceInfo=deviceInfo
  }
  handleTransmitPermited(a) {
    if(Config.debugable)console.log('a',a)
    this.stopType = a[4];
    this.dataType = a[6];
    // 版本(0) 结束类型(1) 协议(2) 保留(3) 头部1c(4) 结束原因(5) 固件版本(6-10) sn(11-16) ID(17-28) step(29-32)
    this.id = [
      a[7],
      a[8],
      a[9],
      a[10],
      a[11],
      a[12],
      a[13],
      a[14],
      a[15],
      a[16],
      a[17],
      a[18],
    ];
    this.step = [a[10], a[11], a[12], a[13]];
    this.hwBl = [
      this.readByte[0],
      this.readByte[1],
      this.readByte[2],
      this.readByte[3],
      this.readByte[4],
    ];
    this.sn = [
      this.readByte[5],
      this.readByte[6],
      this.readByte[7],
      this.readByte[8],
      this.readByte[9],
      this.readByte[10],
    ];

    this.ver = [
      a[3],
      a[6],
      1,
      0,
      0x1c,
      a[4],
      ...this.hwBl,
      ...this.sn,
      ...this.id,
      ...this.step,
    ];

    //放 版本[0],结束类型[1] , 协议1 [2],保留0 [3],头部1c [4],结束原因this.stopType [5],固件版本[6]-[10],sn:[11]-[16],id:[17]-[28],step,

    //取a id:a[7-18] , sn: , 固件版本：fw ,step:a[10-13] ,结束原因a[4] ,结束类型a[6]
  }
  // 合并两个 Uint8Array
  mergeUint8Arrays(array1, array2) {
    const mergedArray = new Uint8Array(array1.length + array2.length);
    mergedArray.set(array1, 0);
    mergedArray.set(array2, array1.length);
    return mergedArray;
  }

  setSleepLength(length){
    this.rawDataLen=length
    if(Config.debugable)console.log('sleep-length',length)
    this.rawDataBytes = new Uint8Array();
  }

  setSleepByte(a){
    this.rawDataBytes = this.mergeUint8Arrays(this.rawDataBytes, a);
    const progress = ((this.rawDataBytes.length * 100) / this.rawDataLen).toFixed(3);
    if (this.rawDataLen <= 0) {
      return this.api.enableRawdata(false)
    }
    if (this.rawDataBytes.length < this.rawDataLen) {
      if (progress !== 100) this.callback.onSyncingDataProgress(progress);
    } else if (this.rawDataBytes.length >= this.rawDataLen || progress == 100) {
      //关掉rawData
      const file = this.mergeUint8Arrays(this.ver, this.rawDataBytes);
      const b64 = arrayBufferToBase64(file);
      this.callback.onSyncingDataProgress(100);
      this.callback.onSyncMonitorDataComplete(
        b64,
        this.stopType,
        this.dataType,
        this.deviceInfo
      );
      this.clear()
      this.api.clearReport()
    }
  }

  setPulseTime(time){
    this.interval = time
    this.rawDataBytes=null
    if(Config.debugable)console.log('time',time)
  }

  setPulseByte(a){
    if(!this.rawDataBytes){
      this.rawDataBytes= bytesToUint8Array(a,this.deviceInfo.swVer)
    }else{
      this.rawDataBytes =this.rawDataBytes.concat(bytesToUint8Array(a,this.deviceInfo.swVer)) 
    }
    if(!this.intervaler){
      this.intervaler=setInterval(()=>{
        this.callback.ontPulse(this.rawDataBytes)
        this.rawDataBytes=null
      },this.interval)
    }
  }


  // queue(a) {
  //   if (this.isFirstPayload) {
  //     this.isFirstPayload = false
  //     this.firstPayload = a
  //   }
  //   this.totalList.push(a)
  //   this.cnt++
  //   this.currentPayload = a

  //   if (!this.isProcessing) {
  //     this.processTask()
  //   }
  // }

  clear() {
    if(Config.debugable)console.log('clear')
    this.api.enableRawdata(false)
    if (this.intervaler) clearInterval(this.intervaler)
    this.interval=1000
    this.rawDataLen=0;
    this.rawDataBytes=null
    this.intervaler=null
  }

  // getCount() {
  //   return this.cnt
  // }

  // getDuration() {
  //   return Math.floor((Date.now() - this.startTime) / 1000)
  // }

  // getBleCount() {
  //   if (!this.firstPayload || !this.currentPayload) return -1
  //   if (this.firstPayload.length < 20) return -1

  //   const start = (this.firstPayload[16] << 24)
  //     | (this.firstPayload[17] << 16)
  //     | (this.firstPayload[18] << 8)
  //     | this.firstPayload[19]

  //   const end = (this.currentPayload[16] << 24)
  //     | (this.currentPayload[17] << 16)
  //     | (this.currentPayload[18] << 8)
  //     | this.currentPayload[19]

  //   return end - start;
  // }

  /**
   * 执行上传rawdata等耗时的操作
   */
  // processTask() {
  //   if (this.isProcessing) return
  //   const size = this.totalList.length
  //   if (size <= 1) return
  //   // console.log('processTask...' + ~~(Date.now() / 1000))
    
  //   this.isProcessing = true

  //   const payload = this.totalList.slice(0, size).reduce((a, b) => a.concat(b));
  //   this.requestTask = api.post('/rawdata', {
  //     rawdata: size === 2 ? 'start' : pako.deflate(payload, { to: 'string' }),
  //     appId: Config.AppId,
  //     appKey: Config.AppKey,
  //     timestamp: ~~(Date.now() / 1000),
  //   }, null, null, this._doAfterRequest(size === 2 ? 0 : size))

  //   // save to file
  //   this.saveRawdataFile(payload);
  // }

  // _completeTask() {
  //   this.isProcessing = false
  //   this.processTask()
  // }

  // _doAfterRequest(size) {
  //   this.totalList.splice(0, size)
  //   this.taskTimeout = setTimeout(() => {
  //     this._completeTask()
  //   }, UPLOAD_INTERVAL * 1000)
  // }

  // saveRawdataFile(payload) {
  //   if (!this.filePath) {
  //     const fname = 'raw_' + yyyymmddhhmmss(new Date()) + '.dat';
  //     this.filePath = `${this.ctx.env.USER_DATA_PATH}/${fname}`;
  //     this.fs.writeFile({
  //       filePath: this.filePath,
  //       data: new Uint8Array(payload).buffer,
  //       encoding: 'binary',
  //       success: () => console.log('write ok'),
  //       fial: err => console.error(err),
  //     });
  //   } else {
  //     this.fs.appendFile({
  //       filePath: this.filePath,
  //       data: new Uint8Array(payload).buffer,
  //       encoding: 'binary',
  //       success: () => console.log('append ok'),
  //       fial: err => console.error(err),
  //     });
  //   }
  // }
}

export default MegaBleRawdataManager
