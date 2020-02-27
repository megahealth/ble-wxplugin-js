import initSdk from "./ble/MegaBleClient";
import MegaBleScanner from "./ble/MegaBleScanner";
import { STATUS } from "./ble/MegaBleConst";


// export function sayHello () {
//   console.log('Hello plugin!')
// }

// export const answer = 42


export const ble = {
  initSdk,
  MegaBleScanner,
  MegaBleStatus: STATUS
}