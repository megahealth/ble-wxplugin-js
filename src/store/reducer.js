import { combineReducers } from 'redux'
import { reducer as bleReducer } from '../stores/store-ble'

export default combineReducers({
  ble: bleReducer,
})
