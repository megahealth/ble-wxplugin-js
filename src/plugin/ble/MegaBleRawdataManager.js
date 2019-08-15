import api from './MegaRequest'
import pako from './MegaPako'
import { Config } from './MegaBleConst';
import { yyyymmddhhmmss } from './MegaUtils';

const UPLOAD_INTERVAL = 10 // s

class MegaBleRawdataManager {
  cnt = 0;
  totalList = [];

  isFirstPayload = true;
  firstPayload = null;
  currentPayload = null;
  startTime = Date.now();

  isProcessing = false;
  taskTimeout = null;
  requestTask = null;

  filePath = null;
  fs = null;
  ctx = null;

  constructor(ctx) {
    this.ctx = ctx;
    this.fs = this.ctx.getFileSystemManager();
  }

  queue(a) {
    if (this.isFirstPayload) {
      this.isFirstPayload = false
      this.firstPayload = a
    }
    this.totalList.push(a)
    this.cnt++
    this.currentPayload = a

    if (!this.isProcessing) {
      this.processTask()
    }
  }

  clear() {
    if (this.taskTimeout) clearTimeout(this.taskTimeout)
    if (this.requestTask) this.requestTask.abort()
  }

  getCount() {
    return this.cnt
  }

  getDuration() {
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  getBleCount() {
    if (!this.firstPayload || !this.currentPayload) return -1
    if (this.firstPayload.length < 20) return -1

    const start = (this.firstPayload[16] << 24)
      | (this.firstPayload[17] << 16)
      | (this.firstPayload[18] << 8)
      | this.firstPayload[19]

    const end = (this.currentPayload[16] << 24)
      | (this.currentPayload[17] << 16)
      | (this.currentPayload[18] << 8)
      | this.currentPayload[19]

    return end - start;
  }

  /**
   * 执行上传rawdata等耗时的操作
   */
  processTask() {
    if (this.isProcessing) return
    const size = this.totalList.length
    if (size <= 1) return
    // console.log('processTask...' + ~~(Date.now() / 1000))
    
    this.isProcessing = true

    const payload = this.totalList.slice(0, size).reduce((a, b) => a.concat(b));
    this.requestTask = api.post('/rawdata', {
      rawdata: size === 2 ? 'start' : pako.deflate(payload, { to: 'string' }),
      appId: Config.AppId,
      appKey: Config.AppKey,
      timestamp: ~~(Date.now() / 1000),
    }, null, null, this._doAfterRequest(size === 2 ? 0 : size))

    // save to file
    this.saveRawdataFile(payload);
  }

  _completeTask() {
    this.isProcessing = false
    this.processTask()
  }

  _doAfterRequest(size) {
    this.totalList.splice(0, size)
    this.taskTimeout = setTimeout(() => {
      this._completeTask()
    }, UPLOAD_INTERVAL * 1000)
  }

  saveRawdataFile(payload) {
    if (!this.filePath) {
      const fname = 'raw_' + yyyymmddhhmmss(new Date()) + '.dat';
      this.filePath = `${this.ctx.env.USER_DATA_PATH}/${fname}`;
      this.fs.writeFile({
        filePath: this.filePath,
        data: new Uint8Array(payload).buffer,
        encoding: 'binary',
        success: () => console.log('write ok'),
        fial: err => console.error(err),
      });
    } else {
      this.fs.appendFile({
        filePath: this.filePath,
        data: new Uint8Array(payload).buffer,
        encoding: 'binary',
        success: () => console.log('append ok'),
        fial: err => console.error(err),
      });
    }
  }
}

export default MegaBleRawdataManager
