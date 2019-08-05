const baseUrl = 'https://raw.megahealth.cn/parse'

export default {
  baseRequest(params, method, success, fail, complete) {
    let { url, data } = params
    let contentType = 'application/json'
    contentType = params.contentType || contentType

    const option = {
      url: baseUrl + url,
      data,
      method: method, // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': contentType,
      }, // 设置请求的 header
      success,
      fail,
      complete,
    }
    return wx.request(option)
  },
  get(url, success, fail, complete) { // classes/WeChatMiniRawdata
    let patams = { url, data: '' }
    return this.baseRequest(patams, 'GET', success, fail, complete)
  },
  post(url, data, success, fail, complete) {
    let params = { url, data }
    return this.baseRequest(params, 'POST', success, fail, complete)
  }
}
