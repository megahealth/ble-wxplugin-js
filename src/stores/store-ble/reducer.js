import Taro from '@tarojs/taro'

import { constants } from "../store-ble"
import { utils } from '../../mega-utils'
import api from "../../service/api";

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
        const idx = utils.inArray(foundDevices, 'deviceId', device.deviceId)
        if (idx === -1) {
          foundDevices.push(device)
          const adv = MegaUtils.parseAdv(device.advertisData)
          console.log(adv);
        } else {
          foundDevices[idx] = device
        }
      })
      return {
        ...state,
        devices: foundDevices
      }

    case constants.ACTION_CLEAR:
      return {
        ...state,
        devices: [],
      }

    case constants.ACTION_DEVICE_INFO:
      return {
        ...state,
        device: action.data ? {
          ...state.device,
          ...action.data,
        } : {}
      }

      case constants.ACTION_UPLOAD_SPT_DATA:
        const b64 = Taro.arrayBufferToBase64(new Uint8Array(action.data))
        console.log('data received', b64.length);
        // api.post('/classes/SptData', {data: b64, userId: state.user.objectId})
        // .then(res => {
        //   console.log('spt data upload ok')
        // })
        // .catch(err => console.error(err))
        return state;

      case constants.ACTION_UPDATE_TOKEN:
        Taro.setStorage('token', action.data);
          // api.put('/users/' + state.user.objectId, {sptToken: action.data}, {'X-LC-Session': state.user.sessionToken})
          // .then(res => console.log(res))
          // .catch(err => console.log(err))
        return state;

      case constants.ACTION_LOGIN_SUCCESS:
        return {
          user: action.data
        }

      case constants.ACTION_LOGOUT:
        return {
          user: null
        }
        
      
    default:
      return state;
  }
}
