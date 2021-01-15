import Taro, { Component } from '@tarojs/taro'
import { View, Button, Input, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import api from '../../service/api'

import './spt-list.scss'

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            list: []
        }
    }

    config = {
        navigationBarTitleText: '报告列表'
    }

    componentDidMount() {
        const { user } = this.props

        api.get(`/classes/RingSport?where={"userId":"5d285a32d5de2b006cea5fe5"}`)
        .then(res => {
            console.log(res.data)
            this.setState({list: res.data.results})
        })
        .catch(err => console.error(err))
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <View className=''>
                <ScrollView
                scrollY
                scrollWithAnimation
                className='data-list'>
                {
                    this.state.list.length > 0 ? this.state.list.map(item => {
                        return (
                            <View key={item.objectId} className='data-item' onClick={goDetil.bind(this, item)}>
                            <View>{this.getx(item.createdAt)}</View>
                            </View>
                        )
                    })
                    : <View>无数据</View>
                }
                </ScrollView>
            </View>
        )
    }

    goDetil(item) {
        Taro.navigateTo({ url: `/pages/reportDetail/reportDetail?objectId=${item.objectId}` })
    }

    getx(date) {
        date = new Date(date)
        let format = 'Y/M/D h:m:s'
        var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
        var returnArr = [];

        const formatNumber = (n) => {
            n = n.toString()
            return n[1] ? n : '0' + n
        }
    
        returnArr.push(date.getFullYear());
        returnArr.push(formatNumber(date.getMonth() + 1));
        returnArr.push(formatNumber(date.getDate()));
    
        returnArr.push(formatNumber(date.getHours()));
        returnArr.push(formatNumber(date.getMinutes()));
        returnArr.push(formatNumber(date.getSeconds()));
    
        for (var i in returnArr) {
            format = format.replace(formateArr[i], returnArr[i]);
        }
        return format;
    }

}

const mapState = (state) => {
    return {
        user: state.ble.user
    }
}

const mapDispatch = (dispatch) => {
    return {

    }
}

export default connect(mapState, mapDispatch)(Login)
