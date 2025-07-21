import Taro from '@tarojs/taro'

import { constants } from "../store-ble"

const inArray = (arr, key, val) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return i
  }
  return -1
}
const myPluginInterface = Taro.requirePlugin('myPlugin')
const {
  MegaUtils,
} = myPluginInterface.ble;

const defaultState = {
  devices: [],
  device: {},
  user: null,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.ACTION_DEVICES_FOUND:
      const foundDevices = [...state.devices]
      action.data.devices.forEach(device => {
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        if (idx === -1) {
          foundDevices.push(device)
        } else {
          foundDevices[idx] = device
        }
      })
      return {
        ...state,
        devices: foundDevices.sort((a, b) => b.RSSI - a.RSSI),
      }

    case constants.ACTION_CLEAR:
      return {
        ...state,
        devices: [],
      }

    case constants.ACTION_DEVICE_INFO:
      console.log('ACTION_DEVICE_INFO',action.data);
      return {
        ...state,
        device: action.data ? {
          ...state.device,
          ...action.data,
        } : {}
      }
    case constants.ACTION_UPLOAD_SPT_DATA:
        const b64 = Taro.arrayBufferToBase64(new Uint8Array(action.data))
        console.log('data received', b64);

        return state;

    case constants.ACTION_UPDATE_TOKEN:
        console.log('ACTION_UPDATE_TOKEN',action.data);
        Taro.setStorage('token', action.data);
          // api.put('/users/' + state.user.objectId, {sptToken: action.data}, {'X-LC-Session': state.user.sessionToken})
          // .then(res => console.log(res))
          // .catch(err => console.log(err))
        return state;

    case constants.ACTION_LOGIN_SUCCESS:
        console.log('ACTION_LOGIN_SUCCESS',action.data);
        return {
          user: action.data
        }

    case constants.ACTION_LOGOUT:
        console.log('ACTION_LOGOUT',action.data);
        return {
          user: null
        }


    default:
      return state;
  }
}
