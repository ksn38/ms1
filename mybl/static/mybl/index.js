let item = 125;
let level = 23;
let win = 60;
let offset = 0;
let date = [];
let vix2 = [];
let data = [];
let ticker1 = [];
let ticker2 = [];
let chart0 = document.getElementById("line-chart0");
let chart1 = document.getElementById("line-chart1");
let chart2 = document.getElementById("line-chart2");
let chart3 = document.getElementById("line-chart3");
let chart4 = document.getElementById("line-chart4");
let chartAvg = document.getElementById("line-chart-avg");
let lengthRD = received_data.length;
let radio = document.getElementsByName('period');
let radWin = document.getElementsByName('win');
let tr = document.querySelectorAll('.change');
let trTnx = document.querySelectorAll('.change-tnx');
let trVix = document.querySelectorAll('.change-invert');
let offsetInput = document.getElementById('offset-input');
let levelVix = document.getElementById('level-vix');
let correlationInput = document.getElementById('correlation-input');
let dateOffset = [];
let dateOffsetOutput = document.getElementById('dateOffsetOutput');
dateOffsetOutput.innerHTML = received_data[lengthRD - 1]['fields']['date_added'];
let periodInput = document.getElementById("period-input");
let data1 = document.getElementById('data1');
let data2 = document.getElementById('data2');
let button0 = document.getElementById('button0');
let dataAvg = document.getElementById('data-avg');
let buttonAvg = document.getElementById('button-avg');
let animationButton = document.getElementById("animation-button");
let maxWin = 250;
let dataAnimation1 = [];
let dataAnimation2 = [];
let animationSpeed = document.getElementById("animation-speed");
let run = false;
let timeSleep = 200;
let maxRangeCor = lengthRD - 100;
let winAnimation = 5;


//coloring table
for (let i = lengthRD - 1; i >= 0; i--) {
    dateOffset.push(received_data[i]['fields']['date_added']);
    //console.log(i);
  }

let colorVal = (arr) => {
  let arrInt = arr.map((i) => parseFloat(i.innerText));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > 0) {
      arr[i].style.backgroundColor = 'rgba(40, 167, 69,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < 0) {
      arr[i].style.backgroundColor = 'rgba(220, 53, 69,'  + arrInt[i]/minArr+ ')';
    }
  }
}

arrTr = Array.from(tr)
//console.log(arrTr);

for (let i = 0; i <= arrTr.length; i += 12) {
  colorVal(arrTr.slice(i, i + 12));
}


let colorInv = (arr) => {
  arr = Array.from(arr);
  let arrInt = arr.map((i) => parseFloat(i.innerText));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > 0) {
      arr[i].style.backgroundColor = 'rgba(255, 193, 7,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < 0) {
      arr[i].style.backgroundColor = 'rgba(23, 162, 184,'  + arrInt[i]/minArr+ ')';
    }
  }
}

colorInv(trVix);
colorInv(trTnx);


//correlation
let cor = (list1, list2) => {
  let average = (list) => {
    return list.reduce((accum, curr) => accum + curr) / list.length;
  };

  let avgList1 = average(list1);
  let avgList2 = average(list2);

  let cov = (list1, avgList1, list2, avgList2) => {
    let list = [];
    for (let i = 0; i < list1.length; i++) {
      list[i] = (list1[i] - avgList1)*(list2[i] - avgList2);
    };
    return list;
  };

  let sum = (list) => {
    return list.reduce((accum, curr) => accum + curr);
  }

  let dif2 = (list, avg) => {
    let initialValue = 0;
    return list.reduce((accum, curr) => accum + ((curr - avg)**2), initialValue);
  }

  return (sum(cov(list1, avgList1, list2, avgList2)))/Math.sqrt(dif2(list1, avgList1)*dif2(list2, avgList2));
};

//linechart for 2 tickers with correlation
let lineChart = function(x, y, xLabel, yLabel, xColor, yColor, chart, win, item) {
  let rcor = [];
  
  if (item + win > lengthRD) {
    rcor = new Array(win).fill(0);
    for (let i = 0; i < item - win; i++) {
      rcor.push(cor(x.slice(i, i + win), y.slice(i, i + win)));
    };
    //console.log('1_' + rcor.length)
  }else {  
    for (let i = 0; i < item + win; i++) {
      rcor.push(cor(x.slice(i, i + win), y.slice(i, i + win)));
    };
    //console.log('2_' + rcor.length)
  }  
  
  let radPoint = 2;
  let bordWidth = 2;
  
  if (item > 125) {
    radPoint = 0
  }
  
  if (item > 2500) {
    bordWidth = 1
  }
  
  return new Chart(chart, {
    type: 'line',
    data: {
      labels: date.slice(-item),
      datasets: [{ 
          data: x.slice(-item),
          borderColor: xColor,
          fill: false,
          label: xLabel,
          yAxisID: 'xLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
          lineTension: 0
        }, { 
          data: y.slice(-item),
          borderColor: yColor,
          fill: false,
          label: yLabel,
          yAxisID: 'yLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
          lineTension: 0
        }, { 
          data: rcor,
          borderColor: '#777777',
          fill: true,
          label: 'Rolling correlation',
          yAxisID: 'RollingCorrelation',
          pointRadius: 0,
          borderWidth: 1,
        }, { 
          data: vix2.slice(-item),
          borderColor: '#ff0000',
          backgroundColor: '#fec6c6',
          steppedLine: 'middle',
          fill: true,
          label: 'VIX',
          yAxisID: 'VIX2',
          pointRadius: 0,
          borderWidth: 0,
        }
      ]
    },
    options: {
      animation: {
        duration: 0
      },
      events: [],
      title: {
        display: true,
        text: ''
      },
      scales: {
        yAxes: [
          {id: 'xLabel',
          type: 'linear',
          position: 'left'
          },
          {id: 'yLabel',
          type: 'linear',
          position: 'right'
          }, 
          {id: 'VIX2',
          type: 'linear',
          display: false,
          position: 'left',
          ticks : {max : 100, min : 0}
          }, 
          {id: 'RollingCorrelation',
          type: 'linear',
          display: false,
          position: 'right',
          ticks : {max : 1, min : -1}
          }
        ]
      }
    }
  });
};


let tickersDict = {'vix': [[], '#ff0000', 'VIX'], 'wti': [[], '#000000', 'WTI'], 'gold': [[], '#dfbd00', 'Gold'],
   'tnx': [[], '#c000ff', 'UST'], 'gspc': [[], "#0000ff", 'S&P500'], 'ixic': [[], '#1473b5', 'Nasdaq'], 'rut': [[], "#03007d", 'Russell'], 
   'wti_gold': [[], '#858344', 'Wti/Gold'], 'sz': [[], "#a1497f", 'Shenzhen Component'], 'bvsp': [[], '#cf7e00', 'IBOVESPA'],
   'gdaxi': [[], "#016a81", 'DAX'], 'wheat': [[], '#2bdf01', 'Wheat'], 'ss': [[], '#a30202', 'SSE Composite'], 'bsesn': [[], '#9db001', 'S&P BSE SENSEX'], 
   'wheat_gold': [[], '#156e00', 'Wheat/Gold'], 'cop': [[], '#8d4734', 'Copper'], 'cop_gold': [[], '#8d6d34', 'Copper/Gold']};


let createMainChart = function (offset, level, win, item) {
  if (lengthRD - item - win - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  
  let i = lengthRD - item - offset - win;
  if (item + win >  lengthRD) {
    i = 0
  }
  
  for (i; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    ticker1.push(received_data[i]['fields'][data1.value]);
    ticker2.push(received_data[i]['fields'][data2.value]);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  return [lineChart(ticker1, ticker2, tickersDict[data1.value][2], tickersDict[data2.value][2], tickersDict[data1.value][1], tickersDict[data2.value][1], chart0, win, item), 
  [date = [],
  vix2 = [],
  ticker1 = [],
  ticker2 = []]];
};


let createCharts4 = function (offset, level, win, item) {
  if (lengthRD - item - win - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  
  let i = lengthRD - item - offset - win;
  if (item + win >  lengthRD) {
    i = 0
  }
  
  for (i; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    tickersDict.vix[0].push(received_data[i]['fields']['vix']);
    tickersDict.tnx[0].push(received_data[i]['fields']['tnx']);
    tickersDict.gspc[0].push(received_data[i]['fields']['gspc']);
    //tickersDict.ixic[0].push(received_data[i]['fields']['ixic']);
    tickersDict.rut[0].push(received_data[i]['fields']['rut']);
	tickersDict.wheat[0].push(received_data[i]['fields']['wheat']);
    tickersDict.wti[0].push(received_data[i]['fields']['wti']);
    tickersDict.cop_gold[0].push(received_data[i]['fields']['cop_gold']);
	tickersDict.gold[0].push(received_data[i]['fields']['gold']);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  return [[
  lineChart(tickersDict.vix[0], tickersDict.gspc[0], 'VIX', 'S&P500', tickersDict['vix'][1], tickersDict['gspc'][1], chart1, win, item),
  lineChart(tickersDict.tnx[0], tickersDict.gold[0], 'UST', 'Gold', tickersDict['tnx'][1], tickersDict['gold'][1], chart4, win, item),
  lineChart(tickersDict.gspc[0], tickersDict.rut[0], 'S&P500', 'Russell', tickersDict['gspc'][1], tickersDict['rut'][1], chart3, win, item),
  lineChart(tickersDict.wheat[0], tickersDict.wti[0], 'Wheat', 'WTI', tickersDict['wheat'][1], tickersDict['wti'][1], chart2, win, item)],
  
  [date = [],
  tickersDict.vix[0] = [],
  tickersDict.tnx[0] = [],
  tickersDict.gspc[0] = [],
  //tickersDict.ixic[0] = [],
  tickersDict.rut[0] = [],
  tickersDict.wti[0] = [],
  tickersDict.cop_gold[0] = [],
  tickersDict.gold[0] = [],
  tickersDict.wheat[0] = [],
  vix2 = []]];
};


//rolling average
let rollAvg = (list, meanWin, item) => {
  let average = (list) => {
    return list.reduce((accum, curr) => accum + curr) / list.length;
  };
  let result = [];
  
  if (item + meanWin > lengthRD) {
    result = new Array(meanWin).fill(0);
    for (let i = 0; i < item - meanWin; i++) {
      result.push(average(list.slice(i, i + meanWin)));
    }
    //console.log('1_' + result.length);
  }else {
    for (let i = 0; i < item + maxWin - meanWin; i++) {
      result.push(average(list.slice(i, i + meanWin)));
    }
    //console.log('2_' + result.length);
    result = result.slice(-item);
  }
  return result;
};


let tickersDictAvg = {'vix': [[], '#ff0000', 'VIX'], 'wti': [[], '#000000', 'WTI'], 'gold': [[], '#dfbd00', 'Gold'],
   'tnx': [[], '#c000ff', 'UST'], 'gspc': [[], "#0000ff", 'S&P500'], 'ixic': [[], '#1473b5', 'Nasdaq'], 'rut': [[], "#03007d", 'Russell'], 
   'wti_gold': [[], '#858344', 'Wti/Gold'], 'sz': [[], "#a1497f", 'Shenzhen Component'], 'bvsp': [[], '#cf7e00', 'IBOVESPA'],
   'gdaxi': [[], "#016a81", 'DAX'], 'wheat': [[], '#2bdf01', 'Wheat'], 'ss': [[], '#a30202', 'SSE Composite'], 'bsesn': [[], '#9db001', 'S&P BSE SENSEX'], 
   'wheat_gold': [[], '#156e00', 'Wheat/Gold'], 'cop': [[], '#8d4734', 'Copper'], 'cop_gold': [[], '#8d6d34', 'Copper/Gold']};


let createAvgChart = function (offset, level, item, ticker) {
  if (lengthRD - item - maxWin - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  
  let i = lengthRD - item - offset - maxWin;
  if (item + maxWin >  lengthRD) {
    i = 0
  }
  
  for (i; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    data.push(received_data[i]['fields'][ticker]);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  let radPoint = 2;
  let bordWidth = 2;
  
  if (item > 125) {
    radPoint = 0
  }
  
  if (item > 2500) {
    bordWidth = 1
  }
  
  return [new Chart(chartAvg, {
    type: 'line',
    data: {
      labels: date.slice(-item),
      datasets: [{ 
          data: data.slice(-item),
          borderColor: tickersDictAvg[dataAvg.value][1],
          fill: false,
          label: tickersDictAvg[ticker][2],
          yAxisID: 'xLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
          lineTension: 0
        }, {          
          data: vix2.slice(-item),
          borderColor: '#ff0000',
          backgroundColor: '#fec6c6',
          steppedLine: 'middle',
          fill: true,
          label: 'VIX    Average:',
          yAxisID: 'VIX2',
          pointRadius: 0,
          borderWidth: 0,
        }, {
          data: rollAvg(data, 200, item),
          borderColor: '#444444',
          fill: false,
          label: '200',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [30, 7],
        }, {
          data: rollAvg(data, 100, item),
          borderColor: '#444444',
          fill: false,
          label: '100',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [15, 5],
        }, {
          data: rollAvg(data, 50, item),
          borderColor: '#444444',
          fill: false,
          label: '50',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [5, 2],
        }
      ]
    },
    options: {
      animation: {
        duration: 0
      },
      events: [],
      title: {
        display: true,
        text: ''
      },
      scales: {
        yAxes: [
          {id: 'xLabel',
          type: 'linear',
          position: 'left'
          },
          {id: 'VIX2',
          type: 'linear',
          display: false,
          position: 'left',
          ticks : {max : 100, min : 0}
          }, 
          {id: 'avg',
          type: 'linear',
          display: false,
          position: 'right'
          }
        ]
      }
    }
  }),
  
  [date = [],
  vix2 = [],
  data = []]];
};


let mainChart = createMainChart(offset, level, win, item); 
let charts4 = createCharts4(offset, level, win, item); 
let chartAvg2 = createAvgChart(offset, level, item, dataAvg.value);

buttonAvg.onclick = () => {
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
	//win = 60;
    item = parseInt(radio[i].value);
    mainChart[0].destroy();
    mainChart = createMainChart(offset, level, win, item); 
    charts4[0].map((chart) => chart.destroy());
    charts = createCharts4(offset, level, win, item); 
    chartAvg2[0].destroy();
    chartAvg2 = createAvgChart(offset, level, item, dataAvg.value);     
    periodInput.value = item;
  });
}

for(let i = 0; i < radWin.length; i++){
  radWin[i].addEventListener("change", function(){
    win = parseInt(radWin[i].value);
    mainChart[0].destroy();
    mainChart = createMainChart(offset, level, win, item); 
    charts4[0].map((chart) => chart.destroy());
    charts = createCharts4(offset, level, win, item); 
    correlationInput.value = win;
  });
}

correlationInput.onchange = function () {
  win = parseInt(correlationInput.value);
  mainChart[0].destroy();
  mainChart = createMainChart(offset, level, win, item); 
  charts4[0].map((chart) => chart.destroy());
  charts = createCharts4(offset, level, win, item); 
}

offsetInput.onchange = function () {
  offset = parseInt(offsetInput.value);
  mainChart[0].destroy();
  mainChart = createMainChart(offset, level, win, item); 
  charts4[0].map((chart) => chart.destroy());
  charts = createCharts4(offset, level, win, item); 
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

levelVix.onchange = function () {
  level = parseInt(levelVix.value);
  mainChart[0].destroy();
  mainChart = createMainChart(offset, level, win, item); 
  charts4[0].map((chart) => chart.destroy());
  charts = createCharts4(offset, level, win, item); 
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

offsetInput.oninput = function() {
  offset = parseInt(offsetInput.value);
  if (offset < lengthRD - win - item + 1) {
    dateOffsetOutput.innerHTML = dateOffset[offset];
  } else {
    dateOffsetOutput.innerHTML = received_data[lengthRD - 1]['fields']['date_added'];;
  }
};

periodInput.onchange = () => {
  item = parseInt(periodInput.value);
  mainChart[0].destroy();
  mainChart = createMainChart(offset, level, win, item); 
  charts4[0].map((chart) => chart.destroy());
  charts = createCharts4(offset, level, win, item); 
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value);
}

button0.onclick = () => {
  mainChart[0].destroy();
  mainChart = createMainChart(offset, level, win, item); 
  charts4[0].map((chart) => chart.destroy());
  charts = createCharts4(offset, level, win, item); 
}


let animationChart = function (offset, level, win, item, ticker1, ticker2) {
  if (lengthRD - item - win - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  
  let i = lengthRD - item - offset - win;
  if (item + win >  lengthRD) {
    i = 0
  }
  
  for (i; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    dataAnimation1.push(received_data[i]['fields'][ticker1]);
    dataAnimation2.push(received_data[i]['fields'][ticker2]);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  let radPoint = 2;
  let bordWidth = 2;
  
  if (item > 125) {
    radPoint = 0
  }
  
  if (item > 2500) {
    bordWidth = 1
  }
  
  return [lineChart(dataAnimation1, dataAnimation2, tickersDict[data1.value][2], tickersDict[data2.value][2], tickersDict[data1.value][1], tickersDict[data2.value][1], chart0, win, item),
  
  [date = [],
  vix2 = [],
  dataAnimation1 = [],
  dataAnimation2 = []]];
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

animationSpeed.onchange = () => {
  timeSleep = parseInt(animationSpeed.value);
};

animationButton.onclick = async function () {
  if (winAnimation >= item) {
    winAnimation = 5;
  }
  animationButton.value = 'Stop';
  run = !run;
  
  for (winAnimation; winAnimation <= item; winAnimation += Math.ceil(winAnimation/10)) {
    if (run) {
      await sleep(timeSleep);
      correlationInput.value = winAnimation;
      mainChart[0].destroy();
      mainChart[0] = animationChart(offset, level, winAnimation, item, data1.value, data2.value)[0];
    } else {break}
  }
  animationButton.value = 'Start';
  run = false;
  win = winAnimation;
}


//hovering prompts for tickers
let ust = new Vue ({
  el: '#ust',
  data: {
    message: "Treasury Yield 10 Years",
  }
})

let ixic = new Vue ({
  el: '#ixic',
  data: {
    message: "NASDAQ Composite",
  }
})

let rut = new Vue ({
  el: '#rut',
  data: {
    message: 'Russell 2000',
  }
})

let sse = new Vue ({
  el: '#sse',
  data: {
    message: 'SSE Composite',
  }
})

let szse = new Vue ({
  el: '#szse',
  data: {
    message: 'Shenzhen Component',
  }
})

let ibov = new Vue ({
  el: '#ibov',
  data: {
    message: 'Brasil Sao Paulo Stock Exchange Index',
  }
})

let bse = new Vue ({
  el: '#bse',
  data: {
    message: 'S&P Bombay Stock Exchange Sensitive Index',
  }
})

let vix = new Vue ({
  el: '#vix',
  data: {
    message: 'volatility index',
  }
})


