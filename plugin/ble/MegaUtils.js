"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.discoverServicesAndChs=exports.getDfuMac=exports.encryptToken=exports.encryptMac=exports.parseRead=exports.byte4ToInt=exports.intToByte4=exports.crc16XModem=exports.u8s2hex=exports.userIdToBytes=exports.getMD5Bytes=exports.getRandomString=void 0;var _MegaMD=require("./MegaMD5.js"),_MegaMD2=_interopRequireDefault(_MegaMD),_MegaAes=require("./MegaAes.js"),_MegaAes2=_interopRequireDefault(_MegaAes);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var byteToBits=function(e){for(var r=[],t=7;0<=t;t--){var n=e&1<<t?1:0;r.push(n)}return r},getRandomString=exports.getRandomString=function(e){for(var r="",t=0;t<e;t++)r+="zxcvbnmlkjhgfdsaqwertyuiopQWERTYUIOPASDFGHJKLZXCVBNM1234567890".charAt(Math.floor(62*Math.random()));return r},getMD5Bytes=exports.getMD5Bytes=function(e){for(var r=(0,_MegaMD2.default)(e),t=[],n=0;n<r.length;)t.push(parseInt(r.slice(n,n+2),16)),n+=2;return t},userIdToBytes=exports.userIdToBytes=function(e){for(var r=[],t=0;t<12;t++)r.push(parseInt(e.slice(2*t,2*t+2),16));return r},u8s2hex=exports.u8s2hex=function(e){return Array.prototype.map.call(e,function(e){return("00"+e.toString(16)).slice(-2)}).join(" ")},crc16XModem=exports.crc16XModem=function(e){var n=0;return e.forEach(function(e){for(var r=0;r<8;r++){var t=1==(n>>15&1);n<<=1,t^1==(e>>7-r&1)&&(n^=4129)}}),n&=65535},intToByte4=exports.intToByte4=function(e){return[255&e,(65280&e)>>8,(16711680&e)>>16,(4278190080&e)>>24]},byte4ToInt=exports.byte4ToInt=function(e){return e[3]<<24|e[2]<<16|e[1]<<8|e[0]},parseRead=exports.parseRead=function(e){var r=(240&e[0])>>4,t=15&e[0],n=(240&e[1])>>4,o=15&e[1],s=e[2]<<8|e[3],c=(240&e[4])>>4,i=15&e[4],u="0000";if(0!==e[5]){var a={0:"P11A",1:"P11B",2:"P11C",3:"P11D",7:"P11T",4:"E11D"}[7&e[10]]||"0000";"P11T"!=a&&(a+=e[10]>>3&15),u=a+(1e6*(100*e[5]+e[6])+(e[7]<<16|e[8]<<8|e[9]))}var p=byteToBits(e[11]).reverse(),f=r+"."+t,d=c+"."+i;return{otherInfo:"HW: v"+f+" BL: v"+d+" hwCheck: "+("I2C["+(0!=p[0]?"y":"n")+"] GS["+(0!=p[1]?"y":"n")+"] 4404["+(0!=p[2]?"y":"n")+"] BQ["+(0!=p[3]?"y":"n")+"] ")+" run: "+(0===e[12]?"off":1===e[12]?"on":"pause"),hwVer:f,fwVer:n+"."+o+"."+s,blVer:d,sn:u,isRunning:0!=e[12]}},macToBytes=function(e){return e.split(":").map(function(e){return+("0x"+e)})},tokenToBytes=function(e){return e.split(",").map(function(e){return+e})},_encrypt=function(e){var r=[e[0],e[1],e[2],e[3],e[4],e[5],"M".charCodeAt(),"e".charCodeAt(),"g".charCodeAt(),"a".charCodeAt(),"*".charCodeAt(),"*".charCodeAt(),"*".charCodeAt(),"*".charCodeAt(),"*".charCodeAt(),"*".charCodeAt()],t=[e[0],e[1],e[2],e[3],e[4],e[5],0,0,0,0,0,0,0,0,0,0],n=new _MegaAes2.default.ModeOfOperation.ecb(r).encrypt(t);return Array.from(n).slice(-5)},encryptMac=exports.encryptMac=function(e){return _encrypt(macToBytes(e))},encryptToken=exports.encryptToken=function(e){return _encrypt(tokenToBytes(e))},getDfuMac=exports.getDfuMac=function(e){return e.slice(0,-2)+("0x00"+(+("0x"+e.slice(-2))+1).toString(16)).slice(-2).toUpperCase().slice(-2)},discoverServicesAndChs=exports.discoverServicesAndChs=function(c){return new Promise(function(o,s){wx.getBLEDeviceServices({deviceId:c,success:function(e){for(var r=[],t=0;t<e.services.length;t++){var n=e.services[t];console.log(n),n.isPrimary&&r.push(discoverChs(c,n.uuid))}Promise.all(r).then(function(e){return o(e)}).catch(function(e){return s(e)})},fail:function(e){return s(e)}})})},discoverChs=function(e,n){return new Promise(function(r,t){wx.getBLEDeviceCharacteristics({deviceId:e,serviceId:n,success:function(e){return r(e)},fail:function(e){return t(e)}})})};