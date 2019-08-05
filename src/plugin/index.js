import MegaBleClient from "./ble/MegaBleClient";
import MegaBleScanner from "./ble/MegaBleScanner";


export function sayHello () {
  console.log('Hello plugin!')
}

export const answer = 42


export const ble = {
  MegaBleClient,
  MegaBleScanner
}