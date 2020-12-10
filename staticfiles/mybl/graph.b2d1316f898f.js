let date = [];
let vix = [];
let tnx = [];
let gspc = [];

for (let i of received_data) {
  date.push(i['fields']['date_added']);
  vix.push(i['fields']['vix']);
  tnx.push(i['fields']['tnx']);
  gspc.push(i['fields']['gspc']);
}

let chart1 = document.getElementById("line-chart");
let chart2 = document.getElementById("line-chart2");
let chart3 = document.getElementById("line-chart3");


let lineChart = function(x, y, xLabel, yLabel, chart) {
  new Chart(chart, {
    type: 'line',
    data: {
      labels: date,
      datasets: [{ 
          data: x,
          label: xLabel,
          borderColor: "#039000",
          fill: false,
          label: xLabel,
          yAxisID: xLabel,
        }, { 
          data: y,
          label: yLabel,
          borderColor: "#8e5ea2",
          fill: false,
          label: yLabel,
          yAxisID: yLabel,
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: xLabel + ' ' + yLabel
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

lineChart(vix, tnx, 'VIX', 'TR10', chart1);
lineChart(vix, gspc, 'VIX', 'S&P500', chart2);
lineChart(tnx, gspc, 'TR10', 'S&P500', chart3);

