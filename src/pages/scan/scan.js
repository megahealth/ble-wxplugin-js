import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { actionCreators as bleActionCreators } from '../../stores/store-ble'
import './scan.scss'

class Scan extends Component {

  config = {
    navigationBarTitleText: '扫描'
  }

  constructor(props) {
    super(props)
    this.state = {
      enableBtn: true
    }
  }

  componentWillUnmount() {
    this.props.handleDestroy()
  }

  render() {
    const { devices, handleConnect } = this.props

    return (
      <View>
        <Button className='btn' onClick={this.scan} disabled={!this.state.enableBtn}>scan</Button>
        <ScrollView
          scrollY
          scrollWithAnimation
          className='devices-list'>
          {
            devices && devices.map(item => {
              return (
                <View key={item.deviceId} className='device-item' onClick={handleConnect.bind(this, item)}>
                  <View>{item.name}</View>
                  <View>信号强度: {item.RSSI}dBm ({Math.max(0, item.RSSI + 100)}%)</View>
                  <View>UUID: {item.deviceId}</View>
                  <View>Service数量: {item.advertisServiceUUIDs.length}</View>
                </View>
              )
            })
          }
        </ScrollView>
      </View>
    )
  }

  scan() {
    this.props.handleScan()
    this.setState({enableBtn: false})

    setTimeout(() => {
      this.setState({enableBtn: true})
    }, 10000)
  }

}

const mapState = (state) => {
  return {
    devices: state.ble.devices
  }
}

const mapDispatch = (dispatch) => {
  return {
    handleScan() {
      dispatch(bleActionCreators.scan())
    },
    handleConnect(device) {
      Taro.showLoading({title: 'Loading...', mask: true})

      dispatch(bleActionCreators.connect(device))
    },
    handleDestroy() {
      dispatch(bleActionCreators.destroyScanner())
    },
  }
}

export default connect(mapState, mapDispatch)(Scan)
