"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _class,_temp2,_createClass=function(){function n(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}}(),_get=function e(t,r,n){null===t&&(t=Function.prototype);var o=Object.getOwnPropertyDescriptor(t,r);if(void 0===o){var i=Object.getPrototypeOf(t);return null===i?void 0:e(i,r,n)}if("value"in o)return o.value;var a=o.get;return void 0!==a?a.call(n):void 0},_index=require("../../npm/@tarojs/taro-weapp/index.js"),_index2=_interopRequireDefault(_index);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var List=(_temp2=_class=function(){function a(){var e,t,r;_classCallCheck(this,a);for(var n=arguments.length,o=Array(n),i=0;i<n;i++)o[i]=arguments[i];return(t=r=_possibleConstructorReturn(this,(e=a.__proto__||Object.getPrototypeOf(a)).call.apply(e,[this].concat(o)))).$usedState=["loopArray2","list"],r.state={list:[{name:"A",value:"1"},{name:"B",value:"2"},{name:"C",value:"3"}]},r.customComponents=["ListItem"],_possibleConstructorReturn(r,t)}return _inherits(a,_index.Component),_createClass(a,[{key:"_constructor",value:function(e){_get(a.prototype.__proto__||Object.getPrototypeOf(a.prototype),"_constructor",this).call(this,e),this.$$refs=[]}},{key:"_createData",value:function(e,t,r){this.__state=e||this.state||{},this.__props=t||this.props||{};var n=this.$prefix,o=this.__state.list.map(function(e,t){e={$original:(0,_index.internal_get_original)(e)};var r=(0,_index.genCompid)(n+"bMocJqHEit"+t);return _index.propsManager.set({name:e.$original.name,value:e.$original.value},r),{$compid__0:r,$original:e.$original}});return Object.assign(this.__state,{loopArray2:o}),this.__state}}]),a}(),_class.$$events=[],_class.$$componentPath="plugin/pages/list/list",_temp2);exports.default=List,Component(require("../../npm/@tarojs/taro-weapp/index.js").default.createComponent(List,!0));