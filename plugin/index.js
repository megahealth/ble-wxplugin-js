const  initSdk =require("./ble/MegaBleClient") ;
const  MegaBleScanner =require("./ble/MegaBleScanner") ;
const  { STATUS } =require("./ble/MegaBleConst") ;
const  { parseAdv } =require('./ble/MegaUtils') ;

const ble={
  initSdk,
  MegaBleScanner,
  MegaBleStatus: STATUS,
  MegaUtils: {
    parseAdv
  },
  current:new Date()
}

module.exports ={ble}
