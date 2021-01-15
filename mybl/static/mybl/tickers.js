let radio = document.querySelector('form');
let item = 50;
let date = [];
let vix = [];
let tnx = [];
let gspc = [];
let ixic = [];
let rut = [];
let wti = [];
let gold = [];
let chart1 = document.getElementById("line-chart");
let chart2 = document.getElementById("line-chart2");
let chart3 = document.getElementById("line-chart3");
let chart4 = document.getElementById("line-chart4");
let chart5 = document.getElementById("line-chart5");
let chart6 = document.getElementById("line-chart6");
let chart7 = document.getElementById("line-chart7");
let lengthRD = received_data.length;
let win = 5;
let radWin = document.getElementsByName('win');
let tr = document.querySelectorAll('.change');
let tri = document.querySelectorAll('.change-invert');


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

let lineChart = function(x, y, xLabel, yLabel, xColor, yColor, chart) {
  let rcor = [];
  for (let i = 0; i < item; i++) {
      rcor.push(cor(x.slice(i, i + win), y.slice(i, i + win)));
  };
  let radPoint = 3;
  if (item > 50) {
    radPoint = 0;
  };
  new Chart(chart, {
    type: 'line',
    data: {
      labels: date.slice(win),
      datasets: [{ 
          data: x.slice(win),
          borderColor: xColor,
          fill: false,
          label: xLabel,
          yAxisID: xLabel,
          pointRadius: radPoint,
        }, { 
          data: y.slice(win),
          borderColor: yColor,
          fill: false,
          label: yLabel,
          yAxisID: yLabel,
          pointRadius: radPoint,
        }, { 
          data: rcor,
          borderColor: '#777777',
          fill: true,
          label: 'Rolling correlation',
          yAxisID: 'Rolling correlation',
          pointRadius: 0,
          borderWidth: 1,
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
        yAxes: [{
          id: xLabel,
          type: 'linear',
          position: 'left',
        }, {
          id: yLabel,
          type: 'linear',
          position: 'right',
          
        }, {
          id: 'Rolling correlation',
          type: 'linear',
          position: 'right',
          ticks : {
            max : 1,    
            min : -1
          }
        }]
      }
    }
  });
};


for (let i = lengthRD - 50 - win; i < lengthRD; i++) {
  date.push(received_data[i]['fields']['date_added']);
  vix.push(received_data[i]['fields']['vix']);
  tnx.push(received_data[i]['fields']['tnx']);
  gspc.push(received_data[i]['fields']['gspc']);
  ixic.push(received_data[i]['fields']['ixic']);
  rut.push(received_data[i]['fields']['rut']);
  wti.push(received_data[i]['fields']['wti']);
  gold.push(received_data[i]['fields']['gold']);
}

lineChart(vix, gspc, 'VIX', 'S&P500', '#ff0000', "#0000ff", chart1);
lineChart(tnx, gspc, 'TR10', 'S&P500', '#c000ff', "#0000ff", chart2);
lineChart(ixic, rut, 'Nasdaq', 'Russell', '#36ff00', "#ff6600", chart3);
lineChart(ixic, gspc, 'Nasdaq', 'S&P500', '#36ff00', "#0000ff", chart4);
lineChart(rut, gspc, 'Russell', 'S&P500', '#ff6600', "#0000ff", chart5);
lineChart(gold, tnx, 'Gold', 'TR10', '#ffd800', "#c000ff", chart6);
lineChart(wti, gspc, 'WTI', 'S&P500', '#000000', "#0000ff", chart7);

for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
    item = parseInt(radio[i].value);
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    ixic = [];
    rut = [];
    wti = [];
    gold = [];
    for (let i = lengthRD - item - win; i < lengthRD; i++) {
      date.push(received_data[i]['fields']['date_added']);
      vix.push(received_data[i]['fields']['vix']);
      tnx.push(received_data[i]['fields']['tnx']);
      gspc.push(received_data[i]['fields']['gspc']);
      ixic.push(received_data[i]['fields']['ixic']);
      rut.push(received_data[i]['fields']['rut']);
      wti.push(received_data[i]['fields']['wti']);
      gold.push(received_data[i]['fields']['gold']);
    }
    
    lineChart(vix, gspc, 'VIX', 'S&P500', '#ff0000', "#0000ff", chart1);
    lineChart(tnx, gspc, 'TR10', 'S&P500', '#c000ff', "#0000ff", chart2);
    lineChart(ixic, rut, 'Nasdaq', 'Russell', '#36ff00', "#ff6600", chart3);
    lineChart(ixic, gspc, 'Nasdaq', 'S&P500', '#36ff00', "#0000ff", chart4);
    lineChart(rut, gspc, 'Russell', 'S&P500', '#ff6600', "#0000ff", chart5);
    lineChart(gold, tnx, 'Gold', 'TR10', '#ffd800', "#c000ff", chart6);
    lineChart(wti, gspc, 'WTI', 'S&P500', '#000000', "#0000ff", chart7);    
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    ixic = [];
    rut = [];
    wti = [];
    gold = [];
  });
}

for(let i = 0; i < radWin.length; i++){
  radWin[i].addEventListener("change", function(){
    console.log(radWin[i].value);
    win = parseInt(radWin[i].value);
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    ixic = [];
    rut = [];
    wti = [];
    gold = [];
    for (let i = lengthRD - item - win; i < lengthRD; i++) {
      date.push(received_data[i]['fields']['date_added']);
      vix.push(received_data[i]['fields']['vix']);
      tnx.push(received_data[i]['fields']['tnx']);
      gspc.push(received_data[i]['fields']['gspc']);
      ixic.push(received_data[i]['fields']['ixic']);
      rut.push(received_data[i]['fields']['rut']);
      wti.push(received_data[i]['fields']['wti']);
      gold.push(received_data[i]['fields']['gold']);
    }
    
    lineChart(vix, gspc, 'VIX', 'S&P500', '#ff0000', "#0000ff", chart1);
    lineChart(tnx, gspc, 'TR10', 'S&P500', '#c000ff', "#0000ff", chart2);
    lineChart(ixic, rut, 'Nasdaq', 'Russell', '#36ff00', "#ff6600", chart3);
    lineChart(ixic, gspc, 'Nasdaq', 'S&P500', '#36ff00', "#0000ff", chart4);
    lineChart(rut, gspc, 'Russell', 'S&P500', '#ff6600', "#0000ff", chart5);
    lineChart(gold, tnx, 'Gold', 'TR10', '#ffd800', "#c000ff", chart6);
    lineChart(wti, gspc, 'WTI', 'S&P500', '#000000', "#0000ff", chart7);    
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    ixic = [];
    rut = [];
    wti = [];
    gold = [];
  });
}




