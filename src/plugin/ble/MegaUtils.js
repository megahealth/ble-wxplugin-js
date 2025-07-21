import md5 from "./MegaMD5";
import aes from './MegaAes'

// const
const RING_SN_TYPE = {
  0: "P11A",
  1: "P11B",
  2: "P11C",
  3: "P11D",
  4: "E11D",
  7: "P11T"
};

const byteToBits = (octet) => {
  let bits = [];
  for (let i = 7; i >= 0; i--) {
    let bit = octet & (1 << i) ? 1 : 0;
    bits.push(bit);
  }
  return bits;
};

export const getRandomString = (size) => {
  const s = 'zxcvbnmlkjhgfdsaqwertyuiopQWERTYUIOPASDFGHJKLZXCVBNM1234567890'
  let str = ''
  for (let i = 0; i < size; i++) {
    str += s.charAt(Math.floor(Math.random() * 62))
  }
  return str
}

export const getMD5Bytes = (s) => {
  const hash = md5(s)
  let arr = []
  for (let i = 0; i < hash.length;) {
    arr.push(parseInt(hash.slice(i, i + 2), 16))
    i += 2
  }
  return arr
}

export const userIdToBytes = userId => {
  const a = []
  for (let i = 0; i < 12; i++) {
    a.push(parseInt(userId.slice(i * 2, i * 2 + 2), 16))
  }
  return a
}

export const u8s2hex = (u8s) => {
  var hexArr = Array.prototype.map.call(
    u8s,
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join(' ');
}

// a: array
export const crc16XModem = (a) => {
  let crc = 0x00; // crc需要可变
  const polynomial = 0x1021;
  a.forEach(b => {
    for (let i = 0; i < 8; i++) {
      let bit = ((b >> (7 - i) & 1) == 1);
      let c15 = ((crc >> 15 & 1) == 1);
      crc <<= 1;
      if (c15 ^ bit) crc ^= polynomial;
    }
  })
  crc &= 0xffff;
  return crc;
}

export const intToByte4 = (a) => {
  return [
    a & 0x000000ff,
    (a & 0x0000ff00) >> 8,
    (a & 0x00ff0000) >> 16,
    (a & 0xff000000) >> 24,
  ]
}

export const byte4ToInt = (a) => (a[3] << 24) | (a[2] << 16) | (a[1] << 8) | a[0]



export const parseRead = (a) => {
  const hw1 = (a[0] & 0xf0) >> 4;
  const hw2 = (a[0] & 0x0f);
  const fw1 = (a[1] & 0xf0) >> 4;
  const fw2 = (a[1] & 0x0f);
  const fw3 = (a[2] << 8) | a[3];
  const bl1 = (a[4] & 0xf0) >> 4;
  const bl2 = (a[4] & 0x0f);
  let sn = '0000'
  if (a[5] !== 0) {
    sn = parseSnEnter([a[5], a[6], a[7], a[8], a[9], a[10]]);
  }

  let GSENSOR_4404_FLAG = byteToBits(a[11]).reverse(); // xyz
  const x = GSENSOR_4404_FLAG[0];
  const y = GSENSOR_4404_FLAG[1];
  const z = GSENSOR_4404_FLAG[2];
  const t = GSENSOR_4404_FLAG[3];
  const deviceCheck = "I2C[" + (x != 0 ? "y" : "n") + "] "
    + "GS[" + (y != 0 ? "y" : "n") + "] "
    + "4404[" + (z != 0 ? "y" : "n") + "] "
    + "BQ[" + (t != 0 ? "y" : "n") + "] ";
  const runFlag = a[12] === 0 ? "off" : (a[12] === 1 ? "on" : "pause");
  const isRunning = a[12] != 0;

  const hwVer = `${hw1}.${hw2}`
  const fwVer = `${fw1}.${fw2}.${fw3}`
  const blVer = `${bl1}.${bl2}`
  const otherInfo = `HW: v${hwVer} BL: v${blVer} hwCheck: ${deviceCheck} run: ${runFlag}`
  return { otherInfo, hwVer, fwVer, blVer, sn, isRunning }
}

// 入口
export const parseAdv = (a) => {
  if (!a) return null;
  if (a instanceof ArrayBuffer) a = Array.from(new Uint8Array(a));
  // console.log(a.map(i => i.toString(16)))
  if (a.length < 37) return null;
  const sn = parseSnEnter(a.slice(18, 24));
  const mac = a.slice(2, 8).reverse().map(i => ('00' + i.toString(16)).slice(-2)).join(':').toUpperCase();
  return { sn: sn, mac: mac };
}

const parseSnEnter = (a) => {
  const verYYmm = (a[0] << 8) | a[1];
  const snVersion = (verYYmm >> 13) & 0x07;
  if (snVersion === 1) {
    return parseSnV1(a);
  } else if (snVersion === 0) {
    return parseSnV0(a);
  }
  return "";
}

const parseSnV0 = (a) => {
  let sn;
  if (RING_SN_TYPE[a[5] & 0x07] === "P11T") {
    // 没有size
    sn = RING_SN_TYPE[a[5] & 0x07];
  } else {
    // 有size
    sn = RING_SN_TYPE[a[5] & 0x07] + ((a[5] >> 3) & 0x0f);
  }
  return `${sn}${zeroPad(a[0], 10)}${zeroPad(a[1], 10)}${zeroPad((a[2] << 16) | (a[3] << 8) | a[4], 100000)}`;
}

// 29 d0 00 00 40 15
// C11E31910000064
const parseSnV1 = (a) => {
  const C11X_TYPE = ["C11E", "P11E", "P11F", "C11G", "C11H", "P11G", "P11H"];
  const ver_yy_mm = a[0] * 2**8 + a[1];
  const sn_version = (ver_yy_mm >> 13) & 0x07;
  const year = (ver_yy_mm >> 7) & 0x3F;
  const month = (ver_yy_mm >> 3) & 0x0F;
  const num = a[2] * 2**16 + a[3] * 2**8 + a[4];

  const medicine_consumer = (a[5] >> 5) & 0x07;
  const sizeType = a[5];
  const size = (a[5] >> 4) & 0x01;
  const type_ = a[5] & 0x0F;
  const nSize = (a[5] & 0xF0) >> 4;
  const t = sizeType >> 5;
  try {
    let sn_str;
    if (type_ === 1) {
      let c11e_nSize = nSize + 7;
      if (c11e_nSize === 10) {
        c11e_nSize = 6;
      }
      sn_str = `C11E${c11e_nSize}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (sizeType === 0x1d) {
      sn_str = `C11E4${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (type_ === 4) {
      sn_str = `C11H${nSize + 2}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (type_ === 3) {
      sn_str = `C11G${nSize + 2}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (t === 4) {
      sn_str = `P11G${size + 1}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (t === 5) {
      sn_str = `P11H${size + 1}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else if (type_ === 5 || type_ === 6) {
      sn_str = `${C11X_TYPE[type_]}${size + 1}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    } else {
      sn_str = `${C11X_TYPE[medicine_consumer]}${size + 1}${zeroPad(year,10)}${zeroPad(month,10)}${zeroPad(num,100000)}`;
    }
    return sn_str;
  } catch (error) {
    console.error('parseSnV1', error);
  }
  return "";
}

const zeroPad = (nr,base) => {
  const len = (String(base).length - String(nr).length) + 1;
  return len > 0? new Array(len).join('0')+nr : nr;
}


const macToBytes = mac => mac.split(':').map(i => +('0x' + i))
const tokenToBytes = token => token.split(',').map(i => +i)

const _encrypt = a => {
  const preparedKey = [
    a[0], a[1], a[2], a[3], a[4], a[5],
    'M'.charCodeAt(), 'e'.charCodeAt(), 'g'.charCodeAt(), 'a'.charCodeAt(),
    '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(),
    '*'.charCodeAt(), '*'.charCodeAt(), '*'.charCodeAt(),
  ]
  const preparedContent = [
    a[0], a[1], a[2], a[3], a[4], a[5],
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ]
  const aesEcb = new aes.ModeOfOperation.ecb(preparedKey)
  let encryptedBytes = aesEcb.encrypt(preparedContent)
  return Array.from(encryptedBytes).slice(-5) // aes mac完，取后x位
}

export const encryptMac = mac => _encrypt(macToBytes(mac))
export const encryptToken = token => _encrypt(tokenToBytes(token))

export const getDfuMac = mac => mac.slice(0, -2) + ('0x00' + (+("0x" + mac.slice(-2)) + 1).toString(16)).slice(-2).toUpperCase().slice(-2);


export const discoverServicesAndChs = deviceId => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: res => {
        const arr = []
        for (let i = 0; i < res.services.length; i++) {
          const service = res.services[i]
          if (service.isPrimary) {
            arr.push(discoverChs(deviceId, service.uuid))
          }
        }
        Promise.all(arr).then(res1 => resolve(res1)).catch(err => reject(err))
      },
      fail: err => reject(err)
    })
  })
}

const discoverChs = (deviceId, serviceId) => {
  return new Promise((resolve, reject) => {
    wx.getBLEDeviceCharacteristics({
      deviceId, serviceId,
      success: res => {
        res.serviceId = serviceId
        resolve(res)
      },
      fail: err => reject(err),
    })
  })
}

export const yyyymmddhhmmss = d => {
  const pad2 = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() +
    pad2(d.getMonth() + 1) +
    pad2(d.getDate()) +
    pad2(d.getHours()) +
    pad2(d.getMinutes()) +
    pad2(d.getSeconds());
}

export const createFormData = (params = {}, boundary = '') => {
  let result = '';
  for (let i in params) {
    result += `\r\n--${boundary}`;
    result += `\r\nContent-Disposition: form-data; name="${i}"`;
    result += '\r\n';
    result += `\r\n${params[i]}`
  }
  // 如果obj不为空，则最后一行加上boundary
  if (result) {
    result += `\r\n--${boundary}`
  }
  return result
}

function base64Encode(input) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  let padding = 0;
  let buffer = 0;
  let bufferLength = 0;

  for (let i = 0; i < input.length; i++) {
    buffer = (buffer << 8) | input.charCodeAt(i);
    bufferLength += 8;

    while (bufferLength >= 6) {
      result += chars[(buffer >> (bufferLength - 6)) & 63];
      bufferLength -= 6;
    }
  }

  if (bufferLength > 0) {
    padding = 6 - bufferLength;
    buffer <<= padding;
    result += chars[buffer & 63];
  }

  while (padding > 0) {
    result += "=";
    padding -= 2;
  }

  return result;
}

export function arrayBufferToBase64(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let base64String = "";
  for (let i = 0; i < uint8Array.length; i++) {
    base64String += String.fromCharCode(uint8Array[i]);
  }

  return base64Encode(base64String);
}

export function bytesToUint8Array (b,swVer) {
  if (b[0] === 94 || b[0] === 91) {
    let array=[]
    const swVerStart=swVer.toLowerCase().split('.')[0]
    if (Number(swVerStart)===3) {
      if (b[1] === 12) {
        array[0] = ((b[2] << 16) | (b[3] << 8) | (b[4])), ((b[5] << 16) | (b[6] << 8) | (b[7]))
        array[1] = ((b[8] << 16) | (b[9] << 8) | (b[10])), ((b[11] << 16) | (b[12] << 8) | (b[13]))
      } else if (b[1] === 6) {
        array[0] = ((b[2] << 16) | (b[3] << 8) | (b[4])), ((b[5] << 16) | (b[6] << 8) | (b[7]))
      }
      return array
    } else if (Number(swVerStart)===5 && b.length === 182) {
      let  groupLen = b[6];
      if(groupLen > 19){
        groupLen = 19;
      }
      for (let i = 7; i < groupLen * 9; i += 9) {
        array[(i - 7) / 9] = ((b[i] << 16) | b[i + 1] << 8 | b[i + 2]), ((b[i + 3] << 16) | b[i + 4] << 8 | b[i + 5]), ((b[i + 6] << 16) | b[i + 7] << 8 | b[i + 8])
      }
      return array
    } else if(Number(swVerStart)===5 && b.length === 100){
      let j = 0;//array index
      for (let i = 0; i < 5; i++){
        let index = i * 20;
        if (b[index + 1] === 12) {
          array[j++] =((b[index+2] << 16) | (b[index+3] << 8) | (b[index+4])), ((b[index+5] << 16) | (b[index+6] << 8) | (b[index+7]))
          array[j++] =((b[index+8] << 16) | (b[index+9] << 8) | (b[index+10])), ((b[index+11] << 16) | (b[index+12] << 8) | (b[index+13]))
        }
      }
      return array
    } else if(Number(swVerStart)===6 && b.length === 100){
      let j = 0;//array index
      for (let i = 0; i < 5; i++){
        let index = i * 20;
        if (b[index + 1] === 12) {
          array[j++] =((b[index+2] << 16) | (b[index+3] << 8) | (b[index+4])), ((b[index+5] << 16) | (b[index+6] << 8) | (b[index+7]))
          array[j++] =((b[index+8] << 16) | (b[index+9] << 8) | (b[index+10])), ((b[index+11] << 16) | (b[index+12] << 8) | (b[index+13]))
        }
      }
      return array
    }else{
      return []
    }
  }
}
