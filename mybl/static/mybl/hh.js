let valChng2020 = document.querySelectorAll('.val-cndg-2020');
let val_noexpChng2020 = document.querySelectorAll('.val_noexp-cndg-2020');
let res_vacChng2020 = document.querySelectorAll('.res_vac-cndg-2020');
let valChng2021 = document.querySelectorAll('.val-cndg-2021');
let val_noexpChng2021 = document.querySelectorAll('.val_noexp-cndg-2021');
let res_vacChng2021 = document.querySelectorAll('.res_vac-cndg-2021');
let rateToday = document.querySelectorAll('.rate-today');
let rateToMarch = document.querySelectorAll('.rate-to-march');
let win = 14;
let radWin = document.getElementsByName('win');


let colorCol = (arr) => {
  arr = Array.from(arr);
  let arrInt = arr.map((i) => parseInt(i.textContent));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > 0) {
      arr[i].style.backgroundColor = 'rgba(40, 167, 69,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < 0) {
      arr[i].style.backgroundColor = 'rgba(220, 53, 69,'  + arrInt[i]/minArr + ')';
    }
  }
}

let colorColInv = (arr) => {
  arr = Array.from(arr);
  let arrInt = arr.map((i) => parseInt(i.textContent));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > 0) {
      arr[i].style.backgroundColor = 'rgba(220, 53, 69,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < 0) {
      arr[i].style.backgroundColor = 'rgba(40, 167, 69,'  + arrInt[i]/minArr + ')';
    }
  }
}

//let start = performance.now();
colorCol(valChng2020);
colorCol(val_noexpChng2020);
colorColInv(res_vacChng2020);
colorCol(valChng2021);
colorCol(val_noexpChng2021);
colorColInv(res_vacChng2021);


let valNowNod = document.querySelectorAll('.val-now');
let valNoexpNowNod = document.querySelectorAll('.val_noexp-now');
let resVacNowNod = document.querySelectorAll('.res_vac-now');


let median = (values) => {
  values.sort((a,b) => a - b);
  let half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

let colorColNow = (arr) => {
  arr = Array.from(arr);
  let arrInt = arr.map((i) => parseInt(i.textContent));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  let medianArr = median(arrInt);
  arrInt = arr.map((i) => parseInt(i.textContent));
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > medianArr) {
      arr[i].style.backgroundColor = 'rgba(40, 167, 69,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < medianArr) {
      arr[i].style.backgroundColor = 'rgba(220, 53, 69,'  + minArr/arrInt[i] + ')';
      //console.log(minArr/arrInt[i]);
    }
  }
}

let colorColNowInv = (arr) => {
  arr = Array.from(arr);
  let arrInt = arr.map((i) => parseInt(i.textContent));
  let maxArr = Math.max.apply(null, arrInt);
  let minArr = Math.min.apply(null, arrInt);
  let medianArr = median(arrInt);
  arrInt = arr.map((i) => parseInt(i.textContent));
  for (let i = 0; i < arrInt.length; i++) {
    if (arrInt[i] > medianArr) {
      arr[i].style.backgroundColor = 'rgba(220, 53, 69,'  + arrInt[i]/maxArr + ')';
    }
    else if (arrInt[i] < medianArr) {
      arr[i].style.backgroundColor = 'rgba(40, 167, 69,'  + minArr/arrInt[i] + ')';
    }
  }
}

colorColNow(valNowNod);
colorColNow(valNoexpNowNod);
colorColNowInv(resVacNowNod);

let cavas = document.getElementById("line-chart");

if (cavas.width > window.innerWidth) {
  cavas.width = window.innerWidth;
  cavas.height = window.innerWidth * 0.5625;
}

let graph = (win) => {
  let date = [];
  let java = [];
  let js = [];
  let php = [];
  let py = [];
  let cpp = [];

  for (let i = 0; i < receivedData.length; i += 5) {
    date.push(receivedData[i]['fields']['date_added']);
    cpp.push(receivedData[i]['fields']['res_vac']);
    java.push(receivedData[i + 1]['fields']['res_vac']);
    js.push(receivedData[i + 2]['fields']['res_vac']);
    php.push(receivedData[i + 3]['fields']['res_vac']);
    py.push(receivedData[i + 4]['fields']['res_vac']);
  };

  date = date.slice(win);

  let average = (list) => {
    return list.reduce((accum, curr) => accum + curr) / list.length;
  };

  let rollAvg = (list) => {
    let result = [];
    for (let i = 0; i < list.length - win; i++) {
      result.push(average(list.slice(i, i + win - 1)));
    };
    return result;
  };

  //console.log(rollAvg(py).length);

  new Chart(document.getElementById("line-chart"), {
    type: 'line',
    data: {
      labels: date,
      datasets: [{ 
          data: rollAvg(java),
          label: "Java",
          borderColor: "#c53535",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rollAvg(js),
          label: "Javascript",
          borderColor: "#d9df32",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rollAvg(php),
          label: "php",
          borderColor: "#df9c32",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rollAvg(py),
          label: "Python",
          borderColor: "#3579c5",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
        }, { 
          data: rollAvg(cpp),
          label: "C++",
          borderColor: "#5435c5",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
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
      title: {
          display: true,
          text: 'Number applicants on vacancy'
      },
      scales: {
        yAxes: [{
          id: 'xLabel',
          type: 'linear',
          position: 'left',
          scaleLabel: {
              display: true,
              labelString: "C++, Python"
            }
        }, {
          id: 'yLabel',
          type: 'linear',
          position: 'right',
          scaleLabel: {
              display: true,
              labelString: "Javascript, Java, php"
            }
          }]
       }
    }
  });
};

let cavasAvg = document.getElementById("line-chart-avg");

if (cavasAvg.width > window.innerWidth) {
  cavasAvg.width = window.innerWidth;
  cavasAvg.height = window.innerWidth * 0.5625;
}

let graphAvg = (win) => {
  let dateAvg = Object.keys(receivedDataAvg).map((key) => receivedDataAvg[key]['fields']['date_added']);
  let avgVn = Object.keys(receivedDataAvg).map((key) => parseFloat(receivedDataAvg[key]['fields']['avg_vn']));
  let avgRv = Object.keys(receivedDataAvg).map((key) => receivedDataAvg[key]['fields']['avg_rv']);
  let rCor = [];
  
  for (let i = 0; i < avgVn.length - win; i++) {
    rCor.push(cor(avgVn.slice(i, i + win), avgRv.slice(i, i + win)));
  };
  
  //console.log(rCor);

  dateAvg = dateAvg.slice(win);

  let average = (list) => {
    return list.reduce((accum, curr) => accum + curr) / list.length;
  };

  let rollAvg = (list) => {
    let result = [];
    for (let i = 0; i < list.length - win; i++) {
      result.push(average(list.slice(i, i + win - 1)));
    };
    return result;
  };

  new Chart(document.getElementById("line-chart-avg"), {
    type: 'line',
    data: {
      labels: dateAvg,
      datasets: [{ 
          data: rollAvg(avgVn),
          label: "percent without experience",
          borderColor: "#00af00",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rollAvg(avgRv),
          label: "number applicants on vacancy",
          borderColor: "#434343",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rCor,
          borderColor: '#777777',
          fill: true,
          label: 'rolling correlation',
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
      title: {
          display: true,
      },
      scales: {
        yAxes: [{
          id: 'yLabel',
          type: 'linear',
          position: 'left',
          scaleLabel: {
              display: true,
              labelString: ""
            }
          }, {
          id: 'Rolling correlation',
          type: 'linear',
          display: false,
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


for(let i = 0; i < radWin.length; i++){
  radWin[i].addEventListener("change", function(){
    win = parseInt(radWin[i].value);
    graph(win);
    graphAvg(win);
  })
}

graph(win);
graphAvg(win);
