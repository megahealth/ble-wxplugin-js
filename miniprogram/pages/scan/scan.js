"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _class,_temp2,_createClass=function(){function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}}(),_get=function e(t,n,o){null===t&&(t=Function.prototype);var r=Object.getOwnPropertyDescriptor(t,n);if(void 0===r){var a=Object.getPrototypeOf(t);return null===a?void 0:e(a,n,o)}if("value"in r)return r.value;var i=r.get;return void 0!==i?i.call(o):void 0},_index=require("../../npm/@tarojs/taro-weapp/index.js"),_index2=_interopRequireDefault(_index),_index3=require("../../npm/@tarojs/redux/index.js"),_index4=require("../../stores/store-ble/index.js");function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var Scan=(_temp2=_class=function(){function i(){var e,t,n;_classCallCheck(this,i);for(var o=arguments.length,r=Array(o),a=0;a<o;a++)r[a]=arguments[a];return(t=n=_possibleConstructorReturn(this,(e=i.__proto__||Object.getPrototypeOf(i)).call.apply(e,[this].concat(r)))).$usedState=["loopArray0","devices","enableBtn","handleDestroy","handleConnect","__fn_onClick","handleScan"],n.config={navigationBarTitleText:"扫描"},n.customComponents=[],_possibleConstructorReturn(n,t)}return _inherits(i,_index.Component),_createClass(i,[{key:"_constructor",value:function(e){_get(i.prototype.__proto__||Object.getPrototypeOf(i.prototype),"_constructor",this).call(this,e),this.state={enableBtn:!0},this.$$refs=[]}},{key:"componentWillUnmount",value:function(){this.props.handleDestroy()}},{key:"_createData",value:function(e,t,n){this.__state=e||this.state||{},this.__props=t||this.props||{};this.$prefix;var o=this.__props,r=o.devices,a=(o.handleConnect,r?r.map(function(e,t){return e={$original:(0,_index.internal_get_original)(e)},{$loopState__temp2:r?Math.max(0,e.$original.RSSI+100):null,$original:e.$original}}):[]);return Object.assign(this.__state,{loopArray0:a,devices:r}),this.__state}},{key:"scan",value:function(){var e=this;this.props.handleScan(),this.setState({enableBtn:!1}),setTimeout(function(){e.setState({enableBtn:!0})},1e4)}},{key:"funPrivatepUfWd",value:function(){return this.props.handleConnect.apply(this,Array.prototype.slice.call(arguments,1))}}]),i}(),_class.$$events=["scan","funPrivatepUfWd"],_class.$$componentPath="pages/scan/scan",_temp2),mapState=function(e){return{devices:e.ble.devices}},mapDispatch=function(t){return{handleScan:function(){t(_index4.actionCreators.scan())},handleConnect:function(e){_index2.default.showLoading({title:"Loading...",mask:!0}),t(_index4.actionCreators.connect(e))},handleDestroy:function(){t(_index4.actionCreators.destroyScanner())}}},Scan__Connected=(0,_index3.connect)(mapState,mapDispatch)(Scan);exports.default=Scan__Connected,Component(require("../../npm/@tarojs/taro-weapp/index.js").default.createComponent(Scan__Connected,!0));