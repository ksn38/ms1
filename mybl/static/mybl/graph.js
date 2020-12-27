let radio = document.querySelector('form');
let item = 50;
let date = [];
let vix = [];
let tnx = [];
let gspc = [];
let chart1 = document.getElementById("line-chart");
let chart2 = document.getElementById("line-chart2");
let chart3 = document.getElementById("line-chart3");
let onload = true;
let lengthRD = received_data.length;


let lineChart = function(x, y, xLabel, yLabel, xColor, yColor, chart) {
  new Chart(chart, {
    type: 'line',
    data: {
      labels: date,
      datasets: [{ 
          data: x,
          borderColor: xColor,
          fill: false,
          label: xLabel,
          yAxisID: xLabel,
        }, { 
          data: y,
          borderColor: yColor,
          fill: false,
          label: yLabel,
          yAxisID: yLabel,
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
          
        }]
      }
    }
  });
};


for (let i = lengthRD - 50; i < lengthRD; i++) {
  date.push(received_data[i]['fields']['date_added']);
  vix.push(received_data[i]['fields']['vix']);
  tnx.push(received_data[i]['fields']['tnx']);
  gspc.push(received_data[i]['fields']['gspc']);
}

lineChart(vix, gspc, 'VIX', 'S&P500', '#ff0000', "#0000ff", chart1);
lineChart(tnx, gspc, 'TR10', 'S&P500', '#c000ff', "#0000ff", chart2);
lineChart(vix, tnx, 'VIX', 'TR10', '#ff0000', "#c000ff", chart3);


for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
    item = radio[i].value;
    console.log(item);
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    for (let i = lengthRD - item; i < lengthRD; i++) {
      date.push(received_data[i]['fields']['date_added']);
      vix.push(received_data[i]['fields']['vix']);
      tnx.push(received_data[i]['fields']['tnx']);
      gspc.push(received_data[i]['fields']['gspc']);
    }

    lineChart(vix, gspc, 'VIX', 'S&P500', '#ff0000', "#0000ff", chart1);
    lineChart(tnx, gspc, 'TR10', 'S&P500', '#c000ff', "#0000ff", chart2);
    lineChart(vix, tnx, 'VIX', 'TR10', '#ff0000', "#c000ff", chart3);
    item = 50;
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
  });
}


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


