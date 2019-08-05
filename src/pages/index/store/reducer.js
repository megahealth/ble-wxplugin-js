import { constants } from "../store"

const defaultState = {
  num: 0,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case constants.ACTION_ADD:
      return {
        ...state,
        num: state.num + 1
      }
    case constants.ACTION_MINUS:
      return {
        ...state,
        num: state.num - 1
      }
      
    default:
      return state
  }
}
