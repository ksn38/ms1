let item = 250;
let level = 30;
let win = 30;
let offset = 0;
let date = [];
let vix2 = [];
let data = [];
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

for (let i = 0; i <= arrTr.length; i += 11) {
  colorVal(arrTr.slice(i, i + 11));
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

let lineChart = function(x, y, xLabel, yLabel, xColor, yColor, chart, win, item) {
  let rcor = [];
  
  for (let i = 0; i < item; i++) {
      rcor.push(cor(x.slice(i, i + win), y.slice(i, i + win)));
  };
  
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
      labels: date.slice(win),
      datasets: [{ 
          data: x.slice(win),
          borderColor: xColor,
          fill: false,
          label: xLabel,
          yAxisID: 'xLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
          lineTension: 0
        }, { 
          data: y.slice(win),
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
          data: vix2.slice(win),
          borderColor: '#ff0000',
          backgroundColor: '#feadad',
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
   'tnx': [[], '#c000ff', 'TR10'], 'gspc': [[], "#0000ff", 'S&P500'], 'ixic': [[], '#1473b5', 'Nasdaq'], 'rut': [[], "#03007d", 'Russell'], 
   'wtiGold': [[], '#858344', 'Wti/Gold'], 'sz': [[], "#a42857", 'Shenzhen Component'], 'bvsp': [[], '#cf7e00', 'IBOVESPA'],
   'gdaxi': [[], "#016a81", 'DAX'], 'wheat': [[], '#2bdf01', 'Wheat'], 'ss': [[], '#a30202', 'SSE Composite'], 'bsesn': [[], '#9db001', 'S&P BSE SENSEX'], 'wheatGold': [[], '#156e00', 'Wheat/Gold']};

let createCharts = function (offset, level, win, item) {
  if (lengthRD - item - win - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  for (let i = lengthRD - item - win - offset; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    tickersDict.vix[0].push(received_data[i]['fields']['vix']);
    tickersDict.tnx[0].push(received_data[i]['fields']['tnx']);
    tickersDict.gspc[0].push(received_data[i]['fields']['gspc']);
    tickersDict.ixic[0].push(received_data[i]['fields']['ixic']);
    tickersDict.rut[0].push(received_data[i]['fields']['rut']);
    tickersDict.wti[0].push(received_data[i]['fields']['wti']);
    tickersDict.gold[0].push(received_data[i]['fields']['gold']);
    tickersDict.sz[0].push(received_data[i]['fields']['sz']);
    tickersDict.bvsp[0].push(received_data[i]['fields']['bvsp']);
    tickersDict.gdaxi[0].push(received_data[i]['fields']['gdaxi']);
    tickersDict.wheat[0].push(received_data[i]['fields']['wheat']);
    tickersDict.ss[0].push(received_data[i]['fields']['ss']);
    tickersDict.bsesn[0].push(received_data[i]['fields']['bsesn']);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  if (data1.value == 'wtiGold' || data2.value == 'wtiGold') {
    tickersDict.wtiGold[0] = tickersDict.wti[0].map((n, i) => n/tickersDict.gold[0][i]);
  }
  
  if (data1.value == 'wheatGold' || data2.value == 'wheatGold') {
    tickersDict.wheatGold[0] = tickersDict.wheat[0].map((n, i) => n/tickersDict.gold[0][i]);
  }
  
  return [[lineChart(tickersDict[data1.value][0], tickersDict[data2.value][0], tickersDict[data1.value][2], tickersDict[data2.value][2], tickersDict[data1.value][1], tickersDict[data2.value][1], chart0, win, item), 
  lineChart(tickersDict.vix[0], tickersDict.gspc[0], 'VIX', 'S&P500', tickersDict['vix'][1], tickersDict['gspc'][1], chart1, win, item),
  lineChart(tickersDict.tnx[0], tickersDict.gspc[0], 'TR10', 'S&P500 (-0.65)', tickersDict['tnx'][1], tickersDict['gspc'][1], chart4, win, item),
  lineChart(tickersDict.ixic[0], tickersDict.rut[0], 'Nasdaq', 'Russell', tickersDict['ixic'][1], tickersDict['rut'][1], chart2, win, item),
  lineChart(tickersDict.wheat[0], tickersDict.wti[0], 'Wheat', 'WTI (0.82)', tickersDict['wheat'][1], tickersDict['wti'][1], chart3, win, item)],
  
  [date = [],
  tickersDict.vix[0] = [],
  vix2 = [],
  tickersDict.tnx[0] = [],
  tickersDict.gspc[0] = [],
  tickersDict.ixic[0] = [],
  tickersDict.rut[0] = [],
  tickersDict.wti[0] = [],
  tickersDict.gold[0] = [],
  tickersDict.sz[0] = [],
  tickersDict.bvsp[0] = [],
  tickersDict.gdaxi[0] = [],
  tickersDict.wheat[0] = [],
  tickersDict.ss[0] = [],
  tickersDict.wtiGold[0] = [],
  tickersDict.wheatGold[0] = [],
  tickersDict.bsesn[0] = []]];
};


let rollAvg = (list, win) => {
  let average = (list) => {
    return list.reduce((accum, curr) => accum + curr) / list.length;
  };
  let result = [];
  for (let i = 0; i < list.length - win; i++) {
    result.push(average(list.slice(i, i + win - 1)));
  };
  return result;
};


let tickersDictAvg = {'vix': [[], '#ff0000', 'VIX'], 'wti': [[], '#000000', 'WTI'], 'gold': [[], '#dfbd00', 'Gold'],
   'tnx': [[], '#c000ff', 'TR10'], 'gspc': [[], "#0000ff", 'S&P500'], 'ixic': [[], '#1473b5', 'Nasdaq'], 'rut': [[], "#03007d", 'Russell'], 
   'wtiGold': [[], '#858344', 'Wti/Gold'], 'sz': [[], "#a42857", 'Shenzhen Component'], 'bvsp': [[], '#cf7e00', 'IBOVESPA'],
   'gdaxi': [[], "#016a81", 'DAX'], 'wheat': [[], '#2bdf01', 'Wheat'], 'ss': [[], '#a30202', 'SSE Composite'], 'bsesn': [[], '#9db001', 'S&P BSE SENSEX'], 'wheatGold': [[], '#156e00', 'Wheat/Gold']};

let createAvgChart = function (offset, level, item, ticker) {
  maxWin = 250;
  if (lengthRD - item - maxWin - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  
  for (let i = lengthRD - item - maxWin - offset; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    data.push(received_data[i]['fields'][ticker]);
    tickersDictAvg.wti[0].push(received_data[i]['fields']['wti']);
    tickersDictAvg.gold[0].push(received_data[i]['fields']['gold']);
    tickersDictAvg.wheat[0].push(received_data[i]['fields']['wheat']);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  if (ticker == 'wtiGold') {
    data = tickersDictAvg.wti[0].map((n, i) => n/tickersDictAvg.gold[0][i])
  }
  
  if (ticker == 'wheatGold') {
    data = tickersDictAvg.wheat[0].map((n, i) => n/tickersDictAvg.gold[0][i])
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
      labels: date.slice(maxWin),
      datasets: [{ 
          data: data.slice(maxWin),
          borderColor: tickersDictAvg[dataAvg.value][1],
          fill: false,
          label: tickersDictAvg[ticker][2],
          yAxisID: 'xLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
          lineTension: 0
        }, {          
          data: vix2.slice(maxWin),
          borderColor: '#ff0000',
          backgroundColor: '#feadad',
          steppedLine: 'middle',
          fill: true,
          label: 'VIX    Average:',
          yAxisID: 'VIX2',
          pointRadius: 0,
          borderWidth: 0,
        }, { 
          data: rollAvg(data, maxWin),
          borderColor: '#444444',
          fill: false,
          label: 'year',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [50, 10],
        }, {
          data: rollAvg(data, 125).slice(maxWin - 125),
          borderColor: '#444444',
          fill: false,
          label: 'half-year',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [25, 7],
        }, { 
          data: rollAvg(data, 60).slice(maxWin - 60),
          borderColor: '#444444',
          fill: false,
          label: 'quarter',
          yAxisID: 'xLabel',
          pointRadius: 0,
          borderWidth: 1,
          borderDash: [10, 5],
        }, {
          data: rollAvg(data, 20).slice(maxWin - 20),
          borderColor: '#444444',
          fill: false,
          label: 'month',
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
  tickersDictAvg.wti[0] = [],
  tickersDictAvg.gold[0] = [],
  tickersDictAvg.wheat[0] = [],
  data = []]];
};


let charts = createCharts(offset, level, win, item); 
let chartAvg2 = createAvgChart(offset, level, item, dataAvg.value);

buttonAvg.onclick = () => {
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
    item = parseInt(radio[i].value);
    charts[0].map((chart) => chart.destroy());
    charts = createCharts(offset, level, win, item); 
    chartAvg2[0].destroy();
    chartAvg2 = createAvgChart(offset, level, item, dataAvg.value);     
    periodInput.value = item;
  });
}

for(let i = 0; i < radWin.length; i++){
  radWin[i].addEventListener("change", function(){
    win = parseInt(radWin[i].value);
    charts[0].map((chart) => chart.destroy());
    charts = createCharts(offset, level, win, item); 
    correlationInput.value = win;
  });
}

correlationInput.onchange = function () {
  win = parseInt(correlationInput.value);
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
}

offsetInput.onchange = function () {
  offset = parseInt(offsetInput.value);
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

levelVix.onchange = function () {
  level = parseInt(levelVix.value);
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
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
  item = periodInput.value;
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
  chartAvg2[0].destroy();
  chartAvg2 = createAvgChart(offset, level, item, dataAvg.value); 
}

button0.onclick = () => {
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
}
