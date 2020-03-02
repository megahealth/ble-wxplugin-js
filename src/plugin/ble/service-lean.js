const baseUrl = 'https://api-mhn.megahealth.cn/1.1'

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
                'X-LC-Id': 'f82OcAshk5Q1J993fGLJ4bbs-gzGzoHsz',
                'X-LC-Key': 'O9COJzi78yYXCWVWMkLqlpp8',
            }, // 设置请求的 header
            success,
            fail,
            complete,
        }
        return wx.request(option)
    },
    get(url, data, success, fail, complete) { // classes/WeChatMiniRawdata
        let patams = { url, data }
        return this.baseRequest(patams, 'GET', success, fail, complete)
    },
    post(url, data, success, fail, complete) {
        let params = { url, data }
        return this.baseRequest(params, 'POST', success, fail, complete)
    }
}
