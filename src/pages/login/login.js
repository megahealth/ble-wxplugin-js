import Taro, { Component } from '@tarojs/taro'
import { View, Button, Input, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import api from '../../service/api'
import { actionCreators as bleActionCreators } from "../../stores/store-ble";

import './login.scss'

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            enableBtn: true,
            phone: null,
            password: null,
        }
    }

    config = {
        navigationBarTitleText: '账户'
    }

    componentWillUnmount() {
    }

    render() {
        const { user, handleLogout } = this.props

        return user ? (
            <View className='container'>
                <Text>账号: {user.username}</Text>
                <Button className='btn-login'
                    onClick={handleLogout} >退出登录</Button>
            </View>
        ) : (
            <View className='container'>
                <Text>登录兆观健康账号</Text>
                <Input type='number' placeholder='手机号' focus onInput={this.onPhoneInput}/>
                <Input type='password' placeholder='密码' maxLength='15' onInput={this.onPasswordInput}/>
                <Button className='btn-login'
                    disabled={!this.state.enableBtn}
                    onClick={this.login} >登录</Button>
            </View>
        )
    }

    onPhoneInput(e) {
        this.setState({phone: e.target.value})
    }    
    onPasswordInput(e) {
        this.setState({password: e.target.value})
    }

    login() {
        if (!this.state.phone || !this.state.password) {
            Taro.showToast({title: '不能为空', icon: 'none', duration: 1000})
            return
        }
        const { handleLoginSuccess } = this.props

        this.setState({ enableBtn: false })
        try {
            api.post('/login', {
                'mobilePhoneNumber': this.state.phone,
                'password': this.state.password,
            }).then(res=>{
                console.log(res);

                if (res.statusCode === 200) {
                    handleLoginSuccess(res.data)
                } else {
                    Taro.showToast({ title: res.data.error, duration: 2000, icon: 'none', })
                }
            })
            
        } catch (error) {
            Taro.showToast({ title: error.message, duration: 2000 })
        }

        setTimeout(() => {
            this.setState({ enableBtn: true })
        }, 1000);
    }
}

const mapState = (state) => {
    return {
        user: state.ble.user
    }
}

const mapDispatch = (dispatch) => {
    return {
        handleLoginSuccess(data) {
            dispatch(bleActionCreators.loginSuccess(data))
        },
        handleLogout() {
            dispatch(bleActionCreators.logout())
        },
    }
}

export default connect(mapState, mapDispatch)(Login)
