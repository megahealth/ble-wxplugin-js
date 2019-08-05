import Taro, { Component } from "@tarojs/taro";
import * as echarts from "./ec-canvas/echarts";

function setChartData(chart, obj) {
  let option = makeOption(obj.startTime, obj.endTime, obj.categories, obj.data);

  // if (data && data.dimensions && data.measures) {
  //   option.xAxis[0].data = data.dimensions.data
  //   option.series = data.measures.map(item => {
  //     return {
  //       ...item,
  //       type:'line',
  //     }
  //   })
  // }

  chart.setOption(option);
}

export default class LineChart extends Component {
  config = {
    usingComponents: {
      "ec-canvas": "./ec-canvas/ec-canvas"
    }
  };

  constructor(props) {
    super(props);
  }

  state = {
    ec: {
      lazyLoad: true
    }
  };

  refresh(data) {
    this.Chart.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      setChartData(chart, data);
      return chart;
    });
  }

  refChart = node => (this.Chart = node);

  render() {
    return (
      <ec-canvas
        ref={this.refChart}
        canvas-id="mychart-area"
        ec={this.state.ec}
      />
    );
  }
}


const makeOption = (startTime, endTime, categories, data) => {
  let min = getLastSharpTime(startTime).getTime();
  let max = getNextSharpTime(endTime).getTime();
  let splitNumber = ~~((max - min) / 3600000);

  return {
    tooltip: {
      show: false,
      formatter: function(params) {
        return params.marker + params.name + ": " + params.value[3] + " ms";
      }
    },
    // title: {
    //   text: "Profile",
    //   left: "center"
    // },
    grid: {
      x: 25,
      y: 35,
      x2: 30,
      y2: 20,
      borderColor: "rgba(0,0,0,0)"
    },
    calculable: false,
    xAxis: {
      name: "时间",
      nameLocation: "end",
      nameGap: 5,
      splitNumber: splitNumber,
      min: min,
      max: max,
      type: "time",
      // scale: true,
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function(val) {
          return new Date(val).getHours();
          // let delta = val - startTime;
          // return ~~(delta / 3600) + "h";
          // return Math.max(0, val - startTime) + " ms";
        }
      }
    },
    yAxis: {
      data: categories,
      splitLine: {
        show: true
      }
    },
    series: [
      {
        type: "custom",
        renderItem: renderItem,
        itemStyle: {
          normal: {
            opacity: 0.8
          }
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data
      }
    ]
  };
};


function renderItem(params, api) {
  var categoryIndex = api.value(0);
  var start = api.coord([api.value(1), categoryIndex]);
  var end = api.coord([api.value(2), categoryIndex]);
  var height = api.size([0, 1])[1] * 1;

  var rectShape = echarts.graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    }
  );

  return (
    rectShape && {
      type: "rect",
      shape: rectShape,
      style: api.style()
    }
  );
}


//获取上一个整点
const getLastSharpTime = time => {
  time = new Date(time);
  var time_ = new Date(time);
  time_.setMinutes(0);
  time_.setSeconds(0);
  time_.setMilliseconds(0);
  if (time - time_ === 0) {
    return time;
  } else {
    time_.setHours(time.getHours());
  }
  return time_;
};
//获取下一个整点
const getNextSharpTime = time => {
  time = new Date(time);
  var time_ = new Date(time);
  time_.setMinutes(0);
  time_.setSeconds(0);
  time_.setMilliseconds(0);
  if (time - time_ === 0) {
    return time;
  } else {
    time_.setHours(time.getHours() + 1);
  }
  return time_;
};
