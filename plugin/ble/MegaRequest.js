'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var baseUrl = 'https://raw.megahealth.cn/parse';

exports.default = {
  baseRequest: function baseRequest(params, method, success, fail, complete) {
    var url = params.url,
        data = params.data;

    var contentType = 'application/json';
    contentType = params.contentType || contentType;

    var option = {
      url: baseUrl + url,
      data: data,
      method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': contentType
      }, // 设置请求的 header
      success: success,
      fail: fail,
      complete: complete
    };
    return wx.request(option);
  },
  get: function get(url, success, fail, complete) {
    // classes/WeChatMiniRawdata
    var patams = { url: url, data: '' };
    return this.baseRequest(patams, 'GET', success, fail, complete);
  },
  post: function post(url, data, success, fail, complete) {
    var params = { url: url, data: data };
    return this.baseRequest(params, 'POST', success, fail, complete);
  }
};