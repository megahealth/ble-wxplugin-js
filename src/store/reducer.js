import { combineReducers } from 'redux'
import { reducer as indexReducer } from '../pages/index/store'
import { reducer as bleReducer } from '../stores/store-ble'

export default combineReducers({
  index: indexReducer,
  ble: bleReducer,
})
