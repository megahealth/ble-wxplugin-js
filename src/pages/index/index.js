import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { actionCreators as bleActionCreators } from "../../stores/store-ble";

import api from '../../service/api'

import './index.scss'


class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  componentWillMount() {
    const user = Taro.getStorageSync('user')
    console.log(user);

    if (user) {
      this.props.handleUserExists(user)
      
      api.get('/users/' + user.objectId)
      .then(res => {
        if (res.data.sptToken && res.data.sptToken.indexOf(',') != -1) {
          Taro.setStorageSync('token', res.data.sptToken)
        }
      })
      .catch(err => console.log(err))
    }
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount() {
    this.props.handleExit()
  }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    const {
      device, handleGoScanPage,
      handleStart,
      handleStop,
      handleGetData,
      user,
    } = this.props

    return (
      <View>
        <View className='btn-block'>
          {
            user ? <Button onClick={handleGoScanPage}>去扫描页</Button> : null
          }
        </View>

        <View>
          <View> <Text className='info-title'>Name:</Text> {device.name}</View>
          <View> <Text className='info-title'>Mac:</Text> {device.mac}</View>
          <View> <Text className='info-title'>SN:</Text> {device.sn}</View>
          <View> <Text className='info-title'>Fw:</Text> {device.fwVer}</View>
          <View> {device.otherInfo} </View>
        </View>

        {
          device.name ? (
            <View>
              <Button onClick={handleStart}>开</Button>
              <Button onClick={handleStop}>关</Button>
              <Button onClick={handleGetData}>收</Button>
            </View>
          ) : null
        }

        <View>
          {/* <Button size='mini' onClick={this.uploadMock}>上传</Button>
          <Button size='mini' onClick={this.updateToken}>更新token</Button>
          <Button size='mini' onClick={this.fetchUserInfo}>获取token</Button>
          <Button size='mini' onClick={this.goDetail}>详情</Button> */}
          {
            user ? <Button onClick={this.goSptList}>列表</Button> : null
          }
        </View>

        <View className='account' onClick={this.handleGoLoginPage}>
          {user ? '已登录' : '未登录'}
        </View>
      </View>
    )
  }

  handleGoLoginPage() {
    Taro.navigateTo({ url: '/pages/login/login' })
  }

  uploadMock() {


    // api.post()
  }

  updateToken() {
    api.put('/users/' + this.props.user.objectId, {sptToken: 'xxx1'}, {'X-LC-Session': this.props.user.sessionToken})
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }

  fetchUserInfo() {
    api.get('/users/' + this.props.user.objectId)
    .then(res => console.log(res))
    .catch(err => console.log(err))
  }

  goDetail() {
    Taro.navigateTo({ url: '/pages/spt-detail/spt-detail' })
  }
  goSptList() {
    Taro.navigateTo({ url: '/pages/spt-list/spt-list' })

  }
}

const mapState = (state) => {
  return {
    num: state.index.num,
    device: state.ble.device,
    user: state.ble.user,
  }
}

const mapDispatch = (dispatch) => {
  return {
    handleGoScanPage() {
      Taro.navigateTo({ url: '/pages/scan/scan?name=dfs' })
    },
    handleExit() {
      bleActionCreators.clearAll()
    },
    handleStart() {
      bleActionCreators.start()
    },
    handleStop() {
      bleActionCreators.stop()
    },
    handleGetData() {
      bleActionCreators.getData()
    },
    handleUserExists(user) {
      dispatch(bleActionCreators.loginSuccess(user))
    },
  }
}

export default connect(mapState, mapDispatch)(Index)