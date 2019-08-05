import Taro from '@tarojs/taro'

const base = 'https://api-mhn.megahealth.cn/1.1'
// const base = 'https://1ulsksiu.api.lncld.net/1.1'

export default {
  baseOptions(params, method = 'GET') {
    let { url, data, header } = params

    const option = {
      url: base + url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json',
        'X-LC-Id': 'f82OcAshk5Q1J993fGLJ4bbs-gzGzoHsz',
        'X-LC-Key': 'O9COJzi78yYXCWVWMkLqlpp8',
        // "X-LC-Id": "1UlsKsiUTHpNkAyAKSWVW1oo-gzGzoHsz",
        // "X-LC-Key": "MeyXCB3GkeYmQkQFOacuTSMU",
        ...header
      },
    }
    return Taro.request(option)
  },
  get(url, data = '') {
    let option = { url, data }
    return this.baseOptions(option)
  },
  post: function (url, data, header) {
    let params = { url, data, header }
    return this.baseOptions(params, 'POST')
  },
  put: function (url, data, header) {
    let params = { url, data, header }
    return this.baseOptions(params, 'PUT')
  }

}