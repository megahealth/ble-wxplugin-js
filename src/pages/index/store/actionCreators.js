import { constants } from "../store";

export const add = () => {
  return {
    type: constants.ACTION_ADD
  }
}

export const minus = () => {
  return {
    type: constants.ACTION_MINUS
  }
}

// 异步的action
export const asyncAdd = () => {
  return dispatch => {
    setTimeout(() => {
      dispatch(add())
    }, 2000)
  }
}
