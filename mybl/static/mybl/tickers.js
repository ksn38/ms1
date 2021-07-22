let radio = document.querySelector('form');
let item = 250;
let date = [];
let vix = [];
let tnx = [];
let gspc = [];
let ixic = [];
let rut = [];
let wti = [];
let gold = [];
let sz = [];
let bvsp = [];
let gdaxi = [];
let wheat = [];
let ss = [];
let bsesn = [];
let level = 30;
let vix2 = [];
let chart0 = document.getElementById("line-chart0");
let chart1 = document.getElementById("line-chart1");
let chart2 = document.getElementById("line-chart2");
let chart3 = document.getElementById("line-chart3");
let chart4 = document.getElementById("line-chart4");
let chart5 = document.getElementById("line-chart5");
let chart6 = document.getElementById("line-chart6");
let chart7 = document.getElementById("line-chart7");
let chart8 = document.getElementById("line-chart8");
let lengthRD = received_data.length;
//console.log(lengthRD);
let win = 30;
let radWin = document.getElementsByName('win');
let tr = document.querySelectorAll('.change');
let tri = document.querySelectorAll('.change-invert');
let offsetInput = document.getElementById('offset-input');
let levelInput = document.getElementById('level-input');
let correlationInput = document.getElementById('correlation-input');
let offset = 0;
let dateOffset = [];
let dateOffsetOutput = document.getElementById('dateOffsetOutput');
dateOffsetOutput.innerHTML = received_data[lengthRD - 1]['fields']['date_added'];
let periodInput = document.getElementById("period-input");
let data1 = document.getElementById('data1');
let data2 = document.getElementById('data2');
let button0 = document.getElementById('button0');


for (let i = lengthRD - 1; i >= 0; i--) {
    dateOffset.push(received_data[i]['fields']['date_added']);
    //console.log(i);
  }

for (let i of tr) {
  if (parseInt(i.textContent) < 0) {
    i.classList.add('bg-danger')
  }
  else if (parseInt(i.textContent) > 0) {
    i.classList.add('bg-success')
  }else {i.classList.add('bg-secondary')}
}

for (let i of tri) {
  if (parseInt(i.textContent) > 0) {
    i.classList.add('bg-danger')
  }
  else if (parseInt(i.textContent) < 0) {
    i.classList.add('bg-success')
  }else {i.classList.add('bg-secondary')}
}

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
  
  let radPoint = 3;
  let bordWidth = 3;
  
  if (item > 60) {
    radPoint = 0;
    bordWidth = 2;
  };
  
  return new Chart(chart, {
    type: 'line',
    data: {
      labels: date.slice(win),
      datasets: [{ 
          data: x.slice(win),
          borderColor: xColor,
          fill: false,
          label: xLabel,
          yAxisID: 'yLabel',
          pointRadius: radPoint,
          borderWidth: bordWidth,
        }, { 
          data: y.slice(win),
          borderColor: yColor,
          fill: false,
          label: yLabel,
          yAxisID: 'yLabel1',
          pointRadius: radPoint,
          borderWidth: bordWidth,
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
      /*scales: {
        xAxes: {
          gridLines: {
          drawOnChartArea: false
          }
        },
        yLabel: {
          type: 'linear',
          position: 'left',
          gridLines: {
            drawOnChartArea: false
          }
        }, 
        yLabel1: {
          type: 'linear',
          position: 'right',
          gridLines: {
            drawOnChartArea: false
          }          
        }, 
        RollingCorrelation: {
          type: 'linear',
          display: false,
          position: 'right',
          max : 1,    
          min : -1
        }, 
        VIX2: {
          type: 'linear',
          display: false,
          position: 'left',
          max : 100,    
          min : 0
        }
      }*/
      scales: {
        yAxes: [
          {id: 'yLabel',
          type: 'linear',
          position: 'left'
          },
          {id: 'yLabel1',
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


let createCharts = function (offset, level, win, item) {
  //console.log(dateOffset[offset]);
  if (lengthRD - item - win - offset < 0) {
    offset = 0;
    offsetInput.value = 0;
  };
  for (let i = lengthRD - item - win - offset; i < lengthRD - offset; i++) {
    date.push(received_data[i]['fields']['date_added']);
    vix.push(received_data[i]['fields']['vix']);
    tnx.push(received_data[i]['fields']['tnx']);
    gspc.push(received_data[i]['fields']['gspc']);
    ixic.push(received_data[i]['fields']['ixic']);
    rut.push(received_data[i]['fields']['rut']);
    wti.push(received_data[i]['fields']['wti']);
    gold.push(received_data[i]['fields']['gold']);
    sz.push(received_data[i]['fields']['sz']);
    bvsp.push(received_data[i]['fields']['bvsp']);
    gdaxi.push(received_data[i]['fields']['gdaxi']);
    wheat.push(received_data[i]['fields']['wheat']);
    ss.push(received_data[i]['fields']['ss']);
    bsesn.push(received_data[i]['fields']['ss']);
    if (received_data[i]['fields']['vix'] > level) {
      vix2.push(received_data[i]['fields']['vix'])
    } else {vix2.push(0)};
  }
  
  let wtiGold = wti.map((n, i) => n/gold[i]);
  let wheatGold = wheat.map((n, i) => n/gold[i]);
  
  let tickersDict = {'VIX': [vix, '#ff0000'], 'WTI': [wti, '#000000'], 'Gold': [gold, '#dfbd00'],
     'TR10': [tnx, '#c000ff'], 'S&P500': [gspc, "#0000ff"], 'Nasdaq': [ixic, '#4343d6'],
     'Russell': [rut, "#03007d"], 'Wti/Gold': [wtiGold, '#858344'], 'Shenzhen Component': [sz, "#9e4e4e"], 'IBOVESPA': [bvsp, '#cf7e00'],
     'DAX': [gdaxi, "#016a81"], 'Wheat': [wheat, '#2bdf01'], 'SSE Composite': [ss, '#a30202'], 'S&P BSE SENSEX': [bsesn, '#c7df00'], 'Wheat/Gold': [wheatGold, '#156e00']};

  return [[lineChart(tickersDict[data1.value][0], tickersDict[data2.value][0], data1.value, data2.value, tickersDict[data1.value][1], tickersDict[data2.value][1], chart0, win, item), 
  lineChart(vix, gspc, 'VIX', 'S&P500', tickersDict['VIX'][1], tickersDict['S&P500'][1], chart1, win, item),
  lineChart(tnx, gspc, 'TR10', 'S&P500', tickersDict['TR10'][1], tickersDict['S&P500'][1], chart2, win, item),
  lineChart(wtiGold, tnx, 'Wti/Gold', 'TR10', tickersDict['Wti/Gold'][1], tickersDict['TR10'][1], chart7, win, item),
  lineChart(ixic, rut, 'Nasdaq', 'Russell', tickersDict['Nasdaq'][1], tickersDict['Russell'][1], chart8, win, item)],
  
  [date = [],
  vix = [],
  vix2 = [],
  tnx = [],
  gspc = [],
  ixic = [],
  rut = [],
  wti = [],
  gold = [],
  sz = [],
  bvsp = [],
  gdaxi = [],
  wheat = [],
  ss = [],
  bsesn = []]];
};


let charts = createCharts(offset, level, win, item); 

for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
    item = parseInt(radio[i].value);
    charts[0].map((chart) => chart.destroy());
    charts = createCharts(offset, level, win, item); 
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
}

levelInput.onchange = function () {
  level = parseInt(levelInput.value);
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
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
}

button0.onclick = () => {
  charts[0].map((chart) => chart.destroy());
  charts = createCharts(offset, level, win, item); 
}

