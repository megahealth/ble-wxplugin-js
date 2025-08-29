const  { Config } =require('./MegaBleConst') ;
const  {yyyymmddhhmmss, arrayBufferToBase64, u8s2hex} =require('./MegaUtils') ;
const   {bytesToUint8Array} =require('./MegaUtils') ;
const UPLOAD_INTERVAL = 10 // s
class MegaBleRawdataManager {
  constructor(api,callback) {
    this.RawdataSwitch=false
    this.rawDataLen=0;
    this.rawDataBytes=null
    this.interval=1000; //ms
    this.intervaler=[]
    this.api = api;
    this.callback=callback
  }
  open() {
    //开启rawdata
    this.api.enableRawdata(true)
    this.RawdataSwitch=true
    if(this.intervaler.length!==0) {
      this.clearAllInterval(this.intervaler)
    }
  }
  stop(){
    //关闭rawdata
    this.RawdataSwitch=false
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

  setSleepLength(length,type){
    this.rawDataLen=length
    if(Config.debugable)console.log('length',length,type)
    this.dataType=type
    this.rawDataBytes = new Uint8Array();
  }

  setSleepByte(a){
    if (this.rawDataLen <= 0) {
       return this.api.enableRawdata(false)
    }
    this.rawDataBytes = this.mergeUint8Arrays(this.rawDataBytes, a);
    const progress = ((this.rawDataBytes.length * 100) / this.rawDataLen).toFixed(3);
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

      //删除报告
      if(Config.delReport){
        if(this.dataType===1){
          this.api.clearReport(1)
        }else if(this.dataType===5){
          this.api.clearReport(5)
        }else if(this.dataType===10){
          this.api.clearReport(10)
        }
      }
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
    if(this.intervaler.length===0){
      const id=setInterval(()=>{
        if(!this.RawdataSwitch){
          this.clearAllInterval(this.intervaler)
        }

        this.callback.ontPulse(this.rawDataBytes)
        this.rawDataBytes=null
      },this.interval)
      this.intervaler.push(id)
    }
  }

  clear() {
    this.api.enableRawdata(false)
    this.interval=1000
    this.rawDataLen=0;
    this.rawDataBytes=null
    this.RawdataSwitch=false
    this.clearAllInterval(this.intervaler)
  }

  clearAllInterval(timerIds){
    for (const id of timerIds) {
      clearInterval(id);
    }
    this.RawdataSwitch=false
    this.intervaler=[]
  }
}

module.exports= MegaBleRawdataManager
