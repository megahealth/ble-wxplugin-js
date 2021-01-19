import Taro, { Component } from '@tarojs/taro'
import { View, WebView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import api from '../../service/api'
import LineChart from '../../components/LineChart'
// import realData from "./data";


import './reportDetail.scss'
import { sptParse } from '../../mega-utils';
var url = null;
class reportDetail extends Component {
    config = {
        navigationBarTitleText: "详情"
    };
    async componentWillMount() {
        console.log(this.$router.params.objectId);
        url = 'https://frontend-test.megahealth.cn/ringadmin2/#/sleep-report/' + this.$router.params.objectId;
    }
    handleMessage() { }
    render() {
        return (
            url ?
                <WebView src={url} onMessage={this.handleMessage} />
                : <view></view>
        );
    }
}

const mapState = (state) => {
    return {
    }
}

const mapDispatch = (dispatch) => {
    return {
    }
}

export default connect(mapState, mapDispatch)(reportDetail)