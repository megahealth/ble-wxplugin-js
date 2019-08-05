import Taro, { Component } from '@tarojs/taro'
import { View, Button, Input, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

import api from '../../service/api'
import LineChart from '../../components/LineChart'
// import realData from "./data";


import './spt-detail.scss'
import { sptParse } from '../../mega-utils';

class SptDetail extends Component {
    config = {
        navigationBarTitleText: "详情"
    };
    async componentDidMount() {
        console.log(this.$router.params.objectId);
        let res = await api.get("/classes/SptData/" + this.$router.params.objectId);
        let parsed = sptParse.calculate_1(res.data["data"]);

        // let res = await api.get("/classes/Reports/5a6674099f5454298c29face");
        // let parsed = sptParse.calculate_1(res.data["sptOriginalData"]);
        console.log(parsed)
        parsed.sptData = parsed.sptData.map(i => {
            switch (i) {
              case 8:
                return 4;
              case 1:
                return 2;
              case 2:
                return 1;
              case 4:
                return 3;
              default:
                return i;
            }
          });

        if (parsed['sptStartTime']) {
            // const startTime = Date.now();
            // const endTime = startTime + realData.length * 1000;
            // var categories = ["X", "R", "S", "L", "P"];
            // var data = reduceSpt(realData, startTime);
            // const chartData = {
            //     startTime, endTime, categories, data
            // }
            // this.lineChart.refresh(chartData);

            const realData = parsed['sptData']
            const startTime = parsed['sptStartTime'] * 1000;
            const endTime = startTime + realData.length * 1000;
            var categories = ["X", "R", "S", "L", "P"];
            var data = reduceSpt(realData, startTime);
            const chartData = {
                startTime, endTime, categories, data
            }
            this.lineChart.refresh(chartData);
        }
    }
    refLineChart = (node) => this.lineChart = node

    render() {
        return (
            <View className="line-chart">
                <LineChart ref={this.refLineChart} />
                <View className='hint'>P:  俯卧L:  左侧卧S:  正卧R:  右侧卧X:  悬空态</View>
            </View>
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

export default connect(mapState, mapDispatch)(SptDetail)


const reduceSpt = (a, startTime) => {
    const COLOR = ["#ccc", "#0004b3", "#ff4c45", "#0004b3", "#ff4c45"];

    let res = [];
    let pre = null;
    let baseTime = startTime;
    a.forEach((item, i) => {
        if (item !== pre) {
            res.push({
                value: [item, baseTime + i * 1000, baseTime + i * 1000 + 1000, 1000],
                itemStyle: {
                    normal: {
                        color: COLOR[item]
                    }
                }
            });
        } else {
            res[res.length - 1].value[2] += 1000;
            res[res.length - 1].value[3] += 1000;
        }
        pre = item;
    });
    return res;
};