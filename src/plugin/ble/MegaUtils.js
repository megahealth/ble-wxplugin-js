import md5 from "./MegaMD5";
import aes from './MegaAes'

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
  const RING_SN_TYPE = { 0: "P11A", 1: "P11B", 2: "P11C", 3: "P11D", 7: "P11T", 4: "E11D" }
  const hw1 = (a[0] & 0xf0) >> 4;
  const hw2 = (a[0] & 0x0f);
  const fw1 = (a[1] & 0xf0) >> 4;
  const fw2 = (a[1] & 0x0f);
  const fw3 = (a[2] << 8) | a[3];
  const bl1 = (a[4] & 0xf0) >> 4;
  const bl2 = (a[4] & 0x0f);

  let sn = '0000'
  if (a[5] !== 0) {
    let tName = RING_SN_TYPE[a[10] & 0x07] || "0000"
    if (tName != 'P11T') tName += ((a[10] >> 3) & 0x0f)
    sn = tName + ((a[5] * 100 + a[6]) * 1000000 + ((a[7] << 16) | (a[8] << 8) | (a[9])))
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
          console.log(service)
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
      success: res => resolve(res),
      fail: err => reject(err),
    })
  })
}