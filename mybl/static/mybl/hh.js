let valChng2020 = document.querySelectorAll('.val-cndg-2020');
let val_noexpChng2020 = document.querySelectorAll('.val_noexp-cndg-2020');
let res_vacChng2020 = document.querySelectorAll('.res_vac-cndg-2020');
let valChng2021 = document.querySelectorAll('.val-cndg-2021');
let val_noexpChng2021 = document.querySelectorAll('.val_noexp-cndg-2021');
let res_vacChng2021 = document.querySelectorAll('.res_vac-cndg-2021');


let colorCol = (arr) => {
  let arrInt = [];
  for (let i = 0; i < arr.length; i++) {
    arrInt.push(parseInt(arr[i].textContent));
  }
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
  let arrInt = [];
  for (let i = 0; i < arr.length; i++) {
    arrInt.push(parseInt(arr[i].textContent));
  }
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

colorCol(valChng2020);
colorCol(val_noexpChng2020);
colorColInv(res_vacChng2020);
colorCol(valChng2021);
colorCol(val_noexpChng2021);
colorColInv(res_vacChng2021);


let valNowNod = document.querySelectorAll('.val-now'); 
let valNoexpNowNod = document.querySelectorAll('.val_noexp-now');
let resVacNowNod = document.querySelectorAll('.res_vac-now');

valNow = Array.from(valNowNod);
valNowSort = valNow.map((i) => parseInt(i.textContent)).sort((a,b) => a - b);

valNoexpNow = Array.from(valNoexpNowNod);
valNoexpNowSort = valNoexpNow.map((i) => parseInt(i.textContent)).sort((a,b) => a - b);

resVacNow = Array.from(resVacNowNod);
resVacNowSort = resVacNow.map((i) => parseFloat(i.textContent)).sort((a,b) => b - a);

let colorText = (nodeList, listSort) => {
  for (let i of nodeList) {
    if (parseInt(i.textContent) >= listSort[11]) {
      i.classList.add('text-success')
    } else if (parseInt(i.textContent) < listSort[5]) {
      i.classList.add('text-danger')
    }
  }
};

colorText(valNowNod, valNowSort);
colorText(valNoexpNowNod, valNoexpNowSort);

for (let i of resVacNow) {
  if (parseFloat(i.textContent) <= resVacNowSort[11]) {
    i.classList.add('text-success')
  } else if (parseFloat(i.textContent) > resVacNowSort[5]) {
    i.classList.add('text-danger')
  }
}


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

  for (let i = 0; i < received_data.length; i += 5) {
    date.push(received_data[i]['fields']['date_added']);
    cpp.push(received_data[i]['fields']['res_vac']);
    java.push(received_data[i + 1]['fields']['res_vac']);
    js.push(received_data[i + 2]['fields']['res_vac']);
    php.push(received_data[i + 3]['fields']['res_vac']);
    py.push(received_data[i + 4]['fields']['res_vac']);
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
          text: 'Количество резюме на вакансию'
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

let win = 7;
let radWin = document.getElementsByName('win');

graph(win);

for(let i = 0; i < radWin.length; i++){
  radWin[i].addEventListener("change", function(){
    win = parseInt(radWin[i].value);
    graph(win);
  })
}

