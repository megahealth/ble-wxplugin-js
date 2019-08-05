"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _class,_temp2,_createClass=function(){function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}}(),_get=function e(t,n,o){null===t&&(t=Function.prototype);var r=Object.getOwnPropertyDescriptor(t,n);if(void 0===r){var a=Object.getPrototypeOf(t);return null===a?void 0:e(a,n,o)}if("value"in r)return r.value;var s=r.get;return void 0!==s?s.call(o):void 0},_index=require("../../npm/@tarojs/taro-weapp/index.js"),_index2=_interopRequireDefault(_index),_index3=require("../../npm/@tarojs/redux/index.js"),_api=require("../../service/api.js"),_api2=_interopRequireDefault(_api),_index4=require("../../stores/store-ble/index.js");function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _asyncToGenerator(e){return function(){var i=e.apply(this,arguments);return new Promise(function(a,s){return function t(e,n){try{var o=i[e](n),r=o.value}catch(e){return void s(e)}if(!o.done)return Promise.resolve(r).then(function(e){t("next",e)},function(e){t("throw",e)});a(r)}("next")})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var Login=(_temp2=_class=function(){function s(){var e,t,n;_classCallCheck(this,s);for(var o=arguments.length,r=Array(o),a=0;a<o;a++)r[a]=arguments[a];return(t=n=_possibleConstructorReturn(this,(e=s.__proto__||Object.getPrototypeOf(s)).call.apply(e,[this].concat(r)))).$usedState=["user","enableBtn","phone","password","handleLogout","__fn_onClick","handleLoginSuccess"],n.config={navigationBarTitleText:"账户"},n.customComponents=[],_possibleConstructorReturn(n,t)}var e;return _inherits(s,_index.Component),_createClass(s,[{key:"_constructor",value:function(e){_get(s.prototype.__proto__||Object.getPrototypeOf(s.prototype),"_constructor",this).call(this,e),this.state={enableBtn:!0,phone:null,password:null},this.$$refs=[]}},{key:"componentWillUnmount",value:function(){}},{key:"_createData",value:function(e,t,n){this.__state=e||this.state||{},this.__props=t||this.props||{};this.$prefix;var o=this.__props,r=o.user;o.handleLogout;return Object.assign(this.__state,{user:r}),this.__state}},{key:"onPhoneInput",value:function(e){this.setState({phone:e.target.value})}},{key:"onPasswordInput",value:function(e){this.setState({password:e.target.value})}},{key:"login",value:(e=_asyncToGenerator(regeneratorRuntime.mark(function e(){var t,n,o=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state.phone&&this.state.password){e.next=3;break}return _index2.default.showToast({title:"不能为空",icon:"none",duration:1e3}),e.abrupt("return");case 3:return t=this.props.handleLoginSuccess,this.setState({enableBtn:!1}),e.prev=5,e.next=8,_api2.default.post("/login",{mobilePhoneNumber:this.state.phone,password:this.state.password});case 8:n=e.sent,console.log(n),200===n.statusCode?t(n.data):_index2.default.showToast({title:n.data.error,duration:2e3,icon:"none"}),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(5),_index2.default.showToast({title:e.t0.message,duration:2e3});case 16:setTimeout(function(){o.setState({enableBtn:!0})},1e3);case 17:case"end":return e.stop()}},e,this,[[5,13]])})),function(){return e.apply(this,arguments)})},{key:"funPrivateKCPmo",value:function(){return this.props.handleLogout.apply(void 0,Array.prototype.slice.call(arguments,1))}}]),s}(),_class.$$events=["funPrivateKCPmo","onPhoneInput","onPasswordInput","login"],_class.$$componentPath="pages/login/login",_temp2),mapState=function(e){return{user:e.ble.user}},mapDispatch=function(t){return{handleLoginSuccess:function(e){t(_index4.actionCreators.loginSuccess(e))},handleLogout:function(){t(_index4.actionCreators.logout())}}},Login__Connected=(0,_index3.connect)(mapState,mapDispatch)(Login);exports.default=Login__Connected,Component(require("../../npm/@tarojs/taro-weapp/index.js").default.createComponent(Login__Connected,!0));