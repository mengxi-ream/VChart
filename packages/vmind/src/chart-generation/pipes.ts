import {
  COLOR_THEMES,
  DEFAULT_PIE_VIDEO_LENGTH,
  DEFAULT_VIDEO_LENGTH,
  DEFAULT_VIDEO_LENGTH_LONG,
  LINEAR_COLOR_THEMES,
  WORDCLOUD_NUM_LIMIT,
  animationDuration,
  oneByOneGroupSize
} from './constants';
import { Context } from './type';
import { detectAxesType } from './utils';

// const chartTypeMap: { [chartName: string]: string } = {
//   柱状图: "bar",
//   折线图: "line",
//   饼图: "pie",
//   词云: "wordCloud",
//   散点图: "scatter",
//   动态条形图: "bar",
// };

const chartTypeMap: { [chartName: string]: string } = {
  'BAR CHART': 'bar',
  'LINE CHART': 'line',
  'PIE CHART': 'pie',
  'WORD CLOUD': 'wordCloud',
  'SCATTER PLOT': 'scatter',
  'DYNAMIC BAR CHART': 'bar'
};

export const chartType = (spec: any, context: Context) => {
  const { chartType } = context;
  spec.type = chartTypeMap[chartType];
  return spec;
};

export const data = (spec: any, context: Context) => {
  const { dataView } = context;
  // spec.data = [dataView]
  spec.data = {
    id: 'data',
    values: dataView.latestData
  };

  return spec;
};
export const wordCloudData = (spec: any, context: Context) => {
  const { dataView, cell } = context;
  const { color, size } = cell;
  spec.data = {
    id: 'data',
    values: dataView.latestData
      .filter((d: any) => d[color!] && d[size!] && d[color!].length > 0 && d[size!].length > 0)
      .slice(0, WORDCLOUD_NUM_LIMIT)
  };

  return spec;
};

export const sequenceData = (spec: any, context: Context) => {
  const { dataView, cell, totalTime } = context;
  const timeField = cell.time as string;
  const latestData = dataView.latestData;

  // 数据按照时间分组
  const timeArray: any[] = [];
  const contentMap = {} as any;
  latestData.forEach((element: any) => {
    const time = element[timeField].toString();
    if (!timeArray.includes(time)) {
      timeArray.push(time);
      contentMap[time] = [];
      contentMap[time].push(element);
    } else {
      contentMap[time].push(element);
    }
  });

  //分组数据排序
  const valueField = cell.y as string;
  for (const time in contentMap) {
    const contentItem = contentMap[time];

    contentItem.sort(function (a: any, b: any) {
      return b[valueField] - a[valueField];
    });
  }

  const dataSpecs = Object.keys(contentMap).map(year => {
    return {
      data: [
        {
          id: 'id',
          values: contentMap[year]
        },
        {
          id: 'year',
          values: [{ year }]
        }
      ]
    };
  });

  //配置data
  spec.data = dataSpecs[0].data;

  const duration = totalTime ? totalTime / dataSpecs.length : 1000;

  //配置player
  spec.player = {
    type: 'continuous',
    orient: 'bottom',
    auto: true,
    loop: true,
    dx: 0,
    position: 'middle',
    interval: duration,
    specs: dataSpecs,
    slider: {
      railStyle: {
        visible: false,
        height: 6
      },
      trackStyle: {
        visible: false
      },
      handlerStyle: {
        visible: false
      }
    },
    controller: {
      backward: {
        style: {
          visible: false,
          size: 12
        }
      },
      forward: {
        style: {
          visible: false,
          size: 12
        }
      },
      start: {
        style: {
          visible: false
        },
        order: 1,
        position: 'end'
      },
      pause: {
        style: {
          visible: false
        }
      }
    }
  };

  spec.animationUpdate = {
    bar: [
      {
        type: 'update',
        options: { excludeChannels: ['x', 'y'] },
        duration: duration,
        easing: 'linear'
      },
      {
        channel: ['x', 'y'],
        options: { excludeChannels: ['width'] },
        duration: duration,
        easing: 'linear'
      }
    ],
    axis: {
      duration: duration,
      easing: 'linear'
    }
  };

  return spec;
};

export const color = (spec: any, context: Context) => {
  const { colors } = context;
  // spec.data = [dataView]
  if (colors && colors.length > 0) {
    spec.color = colors;
  } else {
    spec.color = COLOR_THEMES.default;
  }

  return spec;
};

export const colorBar = (spec: any, context: Context) => {
  const { colors } = context;
  // spec.data = [dataView]
  let colorThemes = COLOR_THEMES.default;
  if (colors && colors.length > 0) {
    colorThemes = colors;
  }

  //应用透明渐变
  spec.color = colorThemes.map(c => ({
    gradient: 'linear',
    x0: 0.01,
    y0: 0,
    x1: 0.01,
    y1: 1,
    stops: [
      {
        offset: 0,
        color: `#${c.split('#')[1]}FF`
      },
      {
        offset: 1,
        color: `#${c.split('#')[1]}00`
      }
    ]
  }));

  return spec;
};

export const colorDynamicBar = (spec: any, context: Context) => {
  const { colors } = context;
  // spec.data = [dataView]
  let colorThemes = COLOR_THEMES.default;
  if (colors && colors.length > 0) {
    colorThemes = colors;
  }

  //应用透明渐变
  spec.color = colorThemes.map(c => ({
    gradient: 'linear',
    x0: 1,
    y0: 0.01,
    x1: 0.01,
    y1: 0.01,
    stops: [
      {
        offset: 0,
        color: `#${c.split('#')[1]}FF`
      },
      {
        offset: 1,
        color: `#${c.split('#')[1]}00`
      }
    ]
  }));

  return spec;
};

export const colorLine = (spec: any, context: Context) => {
  const { colors } = context;
  // spec.data = [dataView]
  if (colors && colors.length > 0) {
    spec.color = colors;
  } else {
    //应用渐变色
    spec.color = LINEAR_COLOR_THEMES.map(c => ({
      gradient: 'linear',
      x0: 0,
      y0: 0.5,
      x1: 1,
      y1: 0.5,
      stops: [
        {
          offset: 0,
          color: c[0]
        },
        {
          offset: 1,
          color: c[1]
        }
      ]
    }));
    spec.point = {
      style: {
        visible: false
      }
    };
  }
  return spec;
};

export const cartesianLine = (spec: any, context: Context) => {
  //折线图根据cell分配字段
  const { cell, dataView } = context;
  spec.xField = cell.x;
  spec.yField = cell.y;
  if (cell.color) {
    spec.seriesField = cell.color;
  } else {
    //没有分配颜色字段，从剩下的字段里选择一个离散字段分配到颜色上
    const dataFields = Object.keys(dataView.latestData[0]);
    const remainedFields = dataFields.filter(f => !spec.xField.includes(f) && spec.yField !== f);
    const colorField = remainedFields.find(f => {
      const fieldType = detectAxesType(spec.data.values, f);
      return fieldType === 'band';
    });
    if (colorField) {
      spec.seriesField = colorField;
    }
  }
  return spec;
};

export const pieField = (spec: any, context: Context) => {
  //饼图根据cell分配字段
  const { cell } = context;
  spec.valueField = cell.angle;
  if (cell.color) {
    spec.categoryField = cell.color;
  }
  return spec;
};

export const scatterField = (spec: any, context: Context) => {
  //散点图根据cell分配字段
  const { cell } = context;
  spec.xField = cell.x;
  spec.yField = cell.y;
  if (cell.color) {
    spec.seriesField = cell.color;
  }
  if (cell.size) {
    spec.sizeField = cell.size;
    spec.size = {
      type: 'linear'
    };
  }

  return spec;
};

export const wordCloudField = (spec: any, context: Context) => {
  //词云根据cell分配字段
  const { cell } = context;
  spec.nameField = cell.color;

  if (cell.size) {
    spec.valueField = cell.size;
  }

  spec.seriesField = spec.nameField;

  return spec;
};

export const wordCloudDisplayConf = (spec: any, context: Context) => {
  spec.fontSizeRange = [20, 50];
  spec.fontWeightRange = [800, 800];
  //spec.wordCloudConfig = {
  //  zoomToFit: {
  //    enlarge: true
  //  }
  //}
  return spec;
};

export const cartesianBar = (spec: any, context: Context) => {
  //折线图根据cell分配字段
  const { cell, dataView } = context;
  const flattenedXField = Array.isArray(cell.x) ? cell.x : [cell.x];
  if (cell.color && cell.color.length > 0 && cell.color !== cell.x) {
    flattenedXField.push(cell.color);
  }
  spec.xField = flattenedXField;
  spec.yField = cell.y;
  if (cell.color) {
    spec.seriesField = cell.color;
  } else {
    //没有分配颜色字段，从剩下的字段里选择一个离散字段分配到颜色上
    const dataFields = Object.keys(dataView.latestData[0]);
    const remainedFields = dataFields.filter(f => !spec.xField.includes(f) && spec.yField !== f);
    const colorField = remainedFields.find(f => {
      const fieldType = detectAxesType(spec.data.values, f);
      return fieldType === 'band';
    });
    if (colorField) {
      spec.seriesField = colorField;
      spec.xField.push(colorField);
    }
  }
  return spec;
};

export const rankingBarField = (spec: any, context: Context) => {
  //折线图根据cell分配字段
  const { cell } = context;
  spec.xField = cell.y;
  spec.yField = cell.x;
  if (cell.color) {
    spec.seriesField = cell.color;
  } else {
    spec.seriesField = spec.yField;
  }
  spec.direction = 'horizontal';
  return spec;
};

export const rankingBarAxis = (spec: any, context: Context) => {
  //动态条形图坐标轴
  spec.axes = [
    {
      animation: true,
      orient: 'bottom',
      type: 'linear',
      visible: true,
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      },
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      grid: {
        visible: true
      }
    },
    {
      animation: true,
      id: 'axis-left',
      orient: 'left',
      tick: { visible: false },
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      },
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      type: 'band'
    }
  ];

  return spec;
};

export const axis = (spec: any, context: Context) => {
  //坐标轴
  spec.axes = [
    {
      orient: 'bottom',
      type: 'band',
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      }
    },
    {
      orient: 'left',
      type: 'linear',
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      }
    }
  ];
  return spec;
};

export const legend = (spec: any, context: Context) => {
  //图例
  const { cell } = context;
  if (!cell.color && !spec.seriesField) {
    return spec;
  }
  spec.legends = [
    {
      orient: 'right',
      type: 'discrete',
      item: {
        visible: true,
        background: {
          style: {
            fillOpacity: 0
          }
        },
        label: {
          style: {
            fill: '#FFFFFF'
          }
        },
        shape: {
          style: {
            symbolType: 'rect'
          }
        }
      }
    }
  ];
  return spec;
};

export const customMark = (spec: any, context: Context) => {
  spec.customMark = [
    {
      type: 'text',
      dataId: 'year',
      style: {
        textBaseline: 'bottom',
        fontSize: 130,
        textAlign: 'right',
        fontFamily: 'PingFang SC',
        fontWeight: 600,
        text: (datum: { year: any }) => datum.year,
        x: () => 700,
        y: () => 480 - 50,
        fill: 'grey',
        fillOpacity: 0.5
      }
    }
  ];
  return spec;
};

export const rankingBarLabel = (spec: any, context: Context) => {
  spec.label = {
    visible: true,
    style: {
      fill: '#FFFFFF',
      stroke: null
    }
  };
  return spec;
};

export const scatterAxis = (spec: any, context: Context) => {
  //坐标轴
  const xField = spec.xField;
  const yField = spec.yField;
  spec.axes = [
    {
      orient: 'bottom',
      type: detectAxesType(spec.data.values, xField),
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      }
    },
    {
      orient: 'left',
      type: detectAxesType(spec.data.values, yField),
      label: {
        style: {
          fill: '#FFFFFF'
        }
      },
      title: {
        visible: false,
        style: {
          fill: '#FFFFFF'
        }
      }
    }
  ];
  return spec;
};

const oneByOneDelayFunc = (delay: number) => (datum: any) => {
  const group = datum['__CHARTSPACE_DEFAULT_DATA_INDEX'] % oneByOneGroupSize;
  return group * delay;
};
export const animationOneByOne = (spec: any, context: Context) => {
  if (spec.type === 'wordCloud3d') {
    return spec;
  }
  const totalTime = context.totalTime ?? DEFAULT_VIDEO_LENGTH_LONG;
  const duration = animationDuration;
  const dataLength = spec.data.values.length;
  const delay = Math.max(totalTime / dataLength - duration, 0);
  const finalDuration = delay === 0 ? totalTime / dataLength : duration;
  const finalDelay = delay === 0 ? Number.MIN_VALUE : delay;

  spec.animationAppear = {
    //word: [
    //  {
    //    channel: {
    //      fontSize: {
    //        from: 0,
    //      },
    //    },
    //    duration: animationDuration,
    //    delay: oneByOneDelayFunc(delay),
    //  },
    //],
    oneByOne: finalDelay,
    duration: finalDuration
  };
  return spec;
};

export const animationScatter = (spec: any, context: Context) => {
  const totalTime = context.totalTime ?? DEFAULT_VIDEO_LENGTH;
  const dataLength = spec.data.values.length;
  const groupNum = Math.ceil(dataLength / oneByOneGroupSize);
  const delay = totalTime / groupNum;
  spec.animationAppear = {
    duration: animationDuration,
    delay: oneByOneDelayFunc(delay)
  };
  return spec;
};

function onlyUnique(value: any, index: number, array: any) {
  return array.indexOf(value) === index;
}

export const animationCartesianBar = (spec: any, context: Context) => {
  const totalTime = context.totalTime ?? DEFAULT_VIDEO_LENGTH;
  const groupKey = Array.isArray(spec.xField) ? spec.xField[0] : spec.xField;
  const dataValues = spec.data.values as any[];
  const groupNum = dataValues.map(d => d[groupKey]).filter(onlyUnique).length;
  //const delay = totalTime / groupNum - 1000;
  spec.animationAppear = {
    oneByOne: Number.MIN_VALUE,
    duration: totalTime / groupNum
  };
  return spec;
};

export const animationCartisianLine = (spec: any, context: Context) => {
  const totalTime = context.totalTime ?? DEFAULT_VIDEO_LENGTH;
  const groupKey = Array.isArray(spec.xField) ? spec.xField[0] : spec.xField;
  const dataValues = spec.data.values as any[];
  const groups = dataValues.map(d => d[groupKey]).filter(onlyUnique);
  const groupNum = groups.length;
  const lineAnimationTotalTime = totalTime > 2000 ? 2000 : totalTime;
  const pointDelay = lineAnimationTotalTime / groupNum;
  spec.animationAppear = {
    line: {
      type: 'clipIn',
      duration: lineAnimationTotalTime,
      easing: 'linear'
    },
    point: {
      delay: (datum: any) => {
        const groupIndex = groups.findIndex(d => d === datum[groupKey]);
        return groupIndex * pointDelay;
      }
    }
  };

  spec.animationNormal = {
    point: {
      loop: true,
      timeSlices: [
        {
          effects: {
            channel: {
              size: { to: 14 }
            },
            easing: 'circInOut'
          },
          duration: 1000
        },
        {
          effects: {
            channel: {
              size: { to: 10 }
            },
            easing: 'circInOut'
          },
          duration: 500
        }
      ]
    }
  };
  return spec;
};

export const animationCartesianPie = (spec: any, context: Context) => {
  const totalTime = context.totalTime ?? DEFAULT_PIE_VIDEO_LENGTH;
  const groupKey = context.cell.color;
  const dataValues = spec.data.values as any[];
  const groupNum = dataValues.map(d => d[groupKey!]).filter(onlyUnique).length;
  //const delay = totalTime / groupNum - 1000;
  const loopTime = 100 + groupNum * 100 + 400;
  // 看看是否可以500ms走一个循环
  if (groupNum * 500 + loopTime < totalTime) {
    // 前面500ms的oneByone
    spec.animationAppear = {
      oneByOne: Number.MIN_VALUE,
      duration: (totalTime - loopTime) / groupNum,
      options: {
        overall: false
      }
    };
    // 然后走循环动画
    spec.animationNormal = {
      pie: [
        {
          startTime: 100,
          oneByOne: 100,
          timeSlices: [
            {
              delay: 0,
              effects: {
                channel: {
                  scaleX: { to: 1.2 },
                  scaleY: { to: 1.2 }
                },
                easing: 'linear'
              },
              duration: 200
            },
            {
              effects: {
                channel: {
                  scaleX: { to: 1 },
                  scaleY: { to: 1 }
                },

                easing: 'linear'
              },
              duration: 200
            }
          ]
        }
      ]
    };
  } else {
    spec.animationAppear = {
      oneByOne: Number.MIN_VALUE,
      duration: totalTime / groupNum,
      options: {
        overall: false
      }
    };
  }
  return spec;
};

export const displayConfBar = (spec: any, context: Context) => {
  spec.bar = {
    style: {
      cornerRadius: [8, 8, 0, 0]
    }
  };

  return spec;
};

export const displayConfLine = (spec: any, context: Context) => {
  spec.line = {
    style: {
      curveType: 'monotone',
      lineWidth: 6,
      lineCap: 'round'
    }
  };

  return spec;
};