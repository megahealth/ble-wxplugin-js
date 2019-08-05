"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _class,_temp2,_createClass=function(){function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}(),_get=function e(t,r,n){null===t&&(t=Function.prototype);var a=Object.getOwnPropertyDescriptor(t,r);if(void 0===a){var o=Object.getPrototypeOf(t);return null===o?void 0:e(o,r,n)}if("value"in a)return a.value;var i=a.get;return void 0!==i?i.call(n):void 0},_index=require("../../npm/@tarojs/taro-weapp/index.js"),_index2=_interopRequireDefault(_index),_index3=require("../../npm/@tarojs/redux/index.js"),_api=require("../../service/api.js"),_api2=_interopRequireDefault(_api),_index4=require("../../mega-utils/index.js");function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _asyncToGenerator(e){return function(){var s=e.apply(this,arguments);return new Promise(function(o,i){return function t(e,r){try{var n=s[e](r),a=n.value}catch(e){return void i(e)}if(!n.done)return Promise.resolve(a).then(function(e){t("next",e)},function(e){t("throw",e)});o(a)}("next")})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var SptDetail=(_temp2=_class=function(){function i(){var e,t,r;_classCallCheck(this,i);for(var n=arguments.length,a=Array(n),o=0;o<n;o++)a[o]=arguments[o];return(t=r=_possibleConstructorReturn(this,(e=i.__proto__||Object.getPrototypeOf(i)).call.apply(e,[this].concat(a)))).$usedState=[],r.config={navigationBarTitleText:"详情"},r.refLineChart=function(e){return r.lineChart=e},r.customComponents=["LineChart"],_possibleConstructorReturn(r,t)}var e;return _inherits(i,_index.Component),_createClass(i,[{key:"_constructor",value:function(e){_get(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"_constructor",this).call(this,e),this.$$refs=[{type:"component",id:"dWTMp",refName:"",fn:this.refLineChart}]}},{key:"componentDidMount",value:(e=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,r,n,a,o,i,s,u;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log(this.$router.params.objectId),e.next=3,_api2.default.get("/classes/SptData/"+this.$router.params.objectId);case 3:t=e.sent,r=_index4.sptParse.calculate_1(t.data.data),console.log(r),r.sptData=r.sptData.map(function(e){switch(e){case 8:return 4;case 1:return 2;case 2:return 1;case 4:return 3;default:return e}}),r.sptStartTime&&(n=r.sptData,a=1e3*r.sptStartTime,o=a+1e3*n.length,i=["X","R","S","L","P"],s=reduceSpt(n,a),u={startTime:a,endTime:o,categories:i,data:s},this.lineChart.refresh(u));case 8:case"end":return e.stop()}},e,this)})),function(){return e.apply(this,arguments)})},{key:"_createData",value:function(e,t,r){this.__state=e||this.state||{},this.__props=t||this.props||{};this.$prefix;return Object.assign(this.__state,{}),this.__state}}]),i}(),_class.$$events=[],_class.$$componentPath="pages/spt-detail/spt-detail",_temp2),mapState=function(e){return{}},mapDispatch=function(e){return{}},SptDetail__Connected=(0,_index3.connect)(mapState,mapDispatch)(SptDetail),reduceSpt=function(e,t){var r=["#ccc","#0004b3","#ff4c45","#0004b3","#ff4c45"],n=[],a=null,o=t;return e.forEach(function(e,t){e!==a?n.push({value:[e,o+1e3*t,o+1e3*t+1e3,1e3],itemStyle:{normal:{color:r[e]}}}):(n[n.length-1].value[2]+=1e3,n[n.length-1].value[3]+=1e3),a=e}),n};exports.default=SptDetail__Connected,Component(require("../../npm/@tarojs/taro-weapp/index.js").default.createComponent(SptDetail__Connected,!0));