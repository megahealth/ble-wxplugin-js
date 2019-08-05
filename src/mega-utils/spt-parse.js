import Taro from '@tarojs/taro'

export function toInt(bytes) {
  return (
    (bytes[0] & 0xff) |
    ((bytes[1] & 0xff) << 8) |
    ((bytes[2] & 0xff) << 16) |
    ((bytes[3] & 0xff) << 24)
  );
}

export function calculate(data) {
  var buf = base64ToBinarry(data);
  console.log(buf);
  var sptData = [];
  var sptShakeData = [];
  var sptStartTime;
  var isShow = true;

  for (var j = 0; j < buf.length; j = j + 256) {
    var end = j + 256 >= buf.length ? buf.length : j + 256;

    var buffer = buf.slice(j, end);
    var startCount = 0;
    var sharkCount = 0;

    for (var i = 0; i < buffer.length; i++) {
      var temp = buffer[i] & 0xff;
      if (temp === 0xcd) {
        startCount++;
      } else if (temp === 0xef) {
        startCount = 0;
        sharkCount++;
      } else if (temp === 0x0) {
        startCount = 0;
      } else if (startCount === 4) {
        if (isShow) {
          var times = [];
          var k = 0;
          for (var j = i - 8; j < i - 4; j++) {
            times[k++] = buffer[j];
          }
          sptStartTime = toInt(times);
          isShow = false;
        }

        if (temp !== 0) {
          var status = temp & 0x80;
          var sleep = temp & 0x0f;
          if (status !== 0) {
            sptData.push(sleep);
          }
        }
      } else if (sharkCount === 4) {
        var st = i;
        for (var k = st; k < buffer.length - 8; k = k + 8) {
          var startShark;
          var endShark;

          if (buffer[k] !== 0x0) {
            startShark = [
              buffer[k],
              buffer[k + 1],
              buffer[k + 2],
              buffer[k + 3]
            ];
            endShark = [
              buffer[k + 4],
              buffer[k + 5],
              buffer[k + 6],
              buffer[k + 7]
            ];

            var json = {
              start: toInt(startShark),
              end: toInt(endShark)
            };
            sptShakeData.push(json);
            sharkCount = 0;
          } else {
            break;
          }
        }
      } else {
        startCount = 0;
        sharkCount = 0;
      }
    }
  }

  console.log("sptStartTime:" + sptStartTime);
  console.log(JSON.stringify(sptData));
  console.log(JSON.stringify(sptShakeData));
  return {
    sptStartTime: sptStartTime,
    sptData: sptData,
    sptShakeData: sptShakeData
  };
}

export function base64ToBinarry(base64) {
//   var buf = [];
//   if (typeof window !== "undefined") {
//     atob(base64)
//       .split("")
//       .map(function(item) {
//         buf.push(item.charCodeAt(0));
//         return item;
//       });
//   } else {
//     buf = new Buffer(base64, "base64");
//   }
//   return buf;
  const a = Array.from(new Uint8Array(Taro.base64ToArrayBuffer(base64)))
  if (a && a.length > 4 && a.slice(1, 4).toString() ===  '0,0,0')
    return a.slice(4)
  return a
}

/*
 * 赵孟收新版血氧bin文件解析方法2017/11/06
 * 4字节时间戳，4字节cd有效性，200组spt数据�?1s�?�?.
 * 每组数据格式：ABCD EFGH  其中，A�?1代表这组数据有效；BCD代表震动强度，共7档；EFGH代表睡姿�?0x01 --- 平躺�? 0x02 ---左侧卧； 0x04 ---右侧卧； 0x08 ---俯卧�?
 */
export function calculate_1(data) {
  var sptData = [];
  var sptShakeData = [];
  var sptStartTime;
  var originalSptShakeData = [];

  var buf = base64ToBinarry(data);

  //for(var m =0;m<buf.length;m++){
  //    console.log(buf[m].toString(16))
  //}
  var bufArray = cutArray(buf);
  for (var i = 0; i < bufArray.length; i++) {
    var item = bufArray[i];
    var start;

    if (
      item[4] === 0xcd &&
      item[5] === 0xcd &&
      item[6] === 0xcd &&
      item[7] === 0xcd
    ) {
      start = item[0] | (item[1] << 8) | (item[2] << 16) | (item[3] << 24);
      if (i === 0) {
        //取出spt�?始时�?
        sptStartTime = start;
      }
      for (var j = 8; j < item.length - 48; j++) {
        var u = item[j];
        if (u >> 7 === 1) {
          sptData.push(u & 0xf);
          if (((u >> 4) & 0x8) !== 0) {
            //该组数据有效
            originalSptShakeData.push((u >> 4) & 0x7);
            //if(((u >> 4) & 0x7) !== 0){ //该秒数据出现震动
            //    var sptTimes = 1;
            //    var s = start + j;
            //    var j_start = j;
            //
            //    for(j=j+1;j<item.length-48;j++){
            //        var u = item[j];
            //        sptData.push(u & 0xf);
            //        if((u >> 4) & 0x7 !== 0){ //该秒数据出现震动
            //            sptTimes++;
            //        }else{
            //            var level = (item[j-1] >> 4) & 0x7;
            //            sptShakeData.push({start:s,end:s+(j-j_start)*1000,total:sptTimes,level:level,sp:(item[j-1] & 0xf)});
            //            break;
            //        }
            //
            //    }
            //}
          } else {
            originalSptShakeData.push(-1);
          }
        } else {
          console.log("无效");
        }
      }
    }
  }

  for (var m = 0; m < originalSptShakeData.length; m++) {
    var sptTimes = 0;
    if (originalSptShakeData[m] > 0) {
      var starttime = sptStartTime + m;
      for (; ; m++) {
        if (
          originalSptShakeData[m] <= 0 ||
          m === originalSptShakeData.length - 1
        ) {
          sptShakeData.push({
            start: starttime,
            end: (sptStartTime + m) * 1000,
            total: sptTimes,
            level: originalSptShakeData[m - 1]
          });
          break;
        }
        sptTimes++;
      }
    }
  }
  return {
    sptStartTime: sptStartTime,
    sptData: sptData,
    sptShakeData: sptShakeData
  };
}

/**
 * 将完整的spt字节数据，切�?256个字节一组的数组
 * @Description
 * @DateTime    2017-11-06T15:36:47+0800
 * @param       {[type]}                 buf [description]
 * @return      {[type]}                     [description]
 */
export function cutArray(buf) {
  var o = [];
  var l = 256;
  for (var i = 0; i < buf.length; i += l) {
    o.push(buf.slice(i, i + l));
  }
  return o;
}
