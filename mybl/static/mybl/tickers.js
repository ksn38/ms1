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
let rcsv = [0, 0, 0, 0];
let rcst = [0, 0, 0, 0];
let rctv = [0, 0, 0, 0];


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

let lineChart = function(x, y, corr, xLabel, yLabel, corrLabel, xColor, yColor, chart) {
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
        }, { 
          data: corr,
          borderColor: '#777777',
          fill: true,
          label: corrLabel,
          yAxisID: corrLabel,
          pointRadius: 0,
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
          id: corrLabel,
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


for (let i = lengthRD - 50; i < lengthRD; i++) {
  date.push(received_data[i]['fields']['date_added']);
  vix.push(received_data[i]['fields']['vix']);
  tnx.push(received_data[i]['fields']['tnx']);
  gspc.push(received_data[i]['fields']['gspc']);
}

console.log(cor(vix, gspc));

for (let i = 0; i <= vix.length - 5; i++) {
  rcsv.push(cor(gspc.slice(i, i+ 5), vix.slice(i, i+ 5)));
};

for (let i = 0; i <= vix.length - 5; i++) {
  rcst.push(cor(gspc.slice(i, i+ 5), tnx.slice(i, i+ 5)));
};

for (let i = 0; i <= vix.length - 5; i++) {
  rctv.push(cor(tnx.slice(i, i+ 5), vix.slice(i, i+ 5)));
};

lineChart(vix, gspc, rcsv, 'VIX', 'S&P500', 'Rolling correlation', '#ff0000', "#0000ff", chart1);
lineChart(tnx, gspc, rcst, 'TR10', 'S&P500', 'Rolling correlation', '#c000ff', "#0000ff", chart2);
lineChart(vix, tnx, rctv, 'VIX', 'TR10', 'Rolling correlation', '#ff0000', "#c000ff", chart3);


for(let i = 0; i < radio.length; i++){
  radio[i].addEventListener("change", function(){
    item = radio[i].value;
    console.log(item);
    console.log(item);
    date = [];
    vix = [];
    tnx = [];
    gspc = [];
    let rcsv = [0, 0, 0, 0];
    let rcst = [0, 0, 0, 0];
    let rctv = [0, 0, 0, 0];
    for (let i = lengthRD - item; i < lengthRD; i++) {
      date.push(received_data[i]['fields']['date_added']);
      vix.push(received_data[i]['fields']['vix']);
      tnx.push(received_data[i]['fields']['tnx']);
      gspc.push(received_data[i]['fields']['gspc']);
    }
    
    /*while (rollcorr.length < 5 - 1) {
      rollcorr.push(0);
    };*/
    for (let i = 0; i <= item - 5; i++) {
      rcsv.push(cor(gspc.slice(i, i+ 5), vix.slice(i, i+ 5)));
    };
    
    for (let i = 0; i <= item - 5; i++) {
      rcst.push(cor(gspc.slice(i, i+ 5), tnx.slice(i, i+ 5)));
    };
    
    for (let i = 0; i <= item - 5; i++) {
      rctv.push(cor(tnx.slice(i, i+ 5), vix.slice(i, i+ 5)));
    };

    lineChart(vix, gspc, rcsv, 'VIX', 'S&P500', 'Rolling correlation', '#ff0000', "#0000ff", chart1);
    lineChart(tnx, gspc, rcst, 'TR10', 'S&P500', 'Rolling correlation', '#c000ff', "#0000ff", chart2);
    lineChart(vix, tnx, rctv, 'VIX', 'TR10', 'Rolling correlation', '#ff0000', "#c000ff", chart3);
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



