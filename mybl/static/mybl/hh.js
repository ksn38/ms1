let valChng2020 = document.querySelectorAll('.val-cndg-2020');
let val_noexpChng2020 = document.querySelectorAll('.val_noexp-cndg-2020');
let res_vacChng2020 = document.querySelectorAll('.res_vac-cndg-2020');
let valChng2021 = document.querySelectorAll('.val-cndg-2021');
let val_noexpChng2021 = document.querySelectorAll('.val_noexp-cndg-2021');
let res_vacChng2021 = document.querySelectorAll('.res_vac-cndg-2021');
let rateToday = document.querySelectorAll('.rate-today');
let rateToMarch = document.querySelectorAll('.rate-to-march');
let button_lang = document.getElementById('button-lang');
let lang = document.getElementById('lang');
let radio1 = document.getElementsByName('year1');
let radio2 = document.getElementsByName('year2');
let table2021 = document.getElementById('table-2021');
let table2022 = document.getElementById('table-2022');
let table2023 = document.getElementById('table-2023');

//coloring tables
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
  if (minArr == 0) {
    minArr = 1
  };
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


//linecharts
let graph = (lang, receivedData, cavas, title) => {
  let date = Array.from(receivedData['date_added']);
  let java = Array.from(receivedData['Java']);
  let js = Array.from(receivedData[lang.value]);
  let php = Array.from(receivedData['php']);
  let py = Array.from(receivedData['Python']);
  let cpp = Array.from(receivedData['cpp']);
  let cs = Array.from(receivedData['cs']);

  new Chart(cavas, {
    type: 'line',
    data: {
      labels: date,
      datasets: [{ 
        data: js,
        label: lang.value,
        borderColor: "#299f45",
        fill: false,
        pointRadius: 0,
        borderWidth: 3,
        yAxisID: 'xLabel',
      }, { 
          data: java,
          label: "Java",
          borderColor: "#c53535",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
        }, { 
          data: php,
          label: "php",
          borderColor: "#df9c32",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
        }, { 
          data: py,
          label: "Python",
          borderColor: "#3579c5",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
        }, { 
          data: cpp,
          label: "C++",
          borderColor: "#5435c5",
          fill: false,
          pointRadius: 0,
          yAxisID: 'xLabel',
        }, { 
          data: cs,
          label: "C#",
          borderColor: "#903ba7",
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
          text: title
      },
      scales: {
        yAxes: [{
          id: 'xLabel',
          type: 'linear',
          position: 'left',
          scaleLabel: {
              display: false,
              //labelString: "C++, Python, C#"
            }
        }, /*{
          id: 'yLabel',
          type: 'linear',
          position: 'right',
          scaleLabel: {
              display: true,
              labelString: "Javascript, Java, php"
            }
          }*/],
        xAxes: [{
          ticks: {
            maxRotation: 45,
            minRotation: 45
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
          label: "Average percent for interns",
          borderColor: "#00af00",
          fill: false,
          pointRadius: 0,
          yAxisID: 'yLabel',
        }, { 
          data: rollAvg(avgRv),
          label: "Average resumes/vacancies",
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
          display: true,
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

let canvasVal = document.getElementById("line-chart-val");
let canvasValNoExp = document.getElementById("line-chart-val_noexp");
let canvasResVac = document.getElementById("line-chart-res");
graph(lang, receivedDataVal, canvasVal, 'Vacancies');
graph(lang, receivedDataValNoExp, canvasValNoExp, 'Percent vacancies for interns');
graph(lang, receivedDataResVac, canvasResVac, 'Resumes/vacancies');
graphAvg(28);

button_lang.onclick = () => {
  //graph[0].destroy();
  graph(lang, receivedDataVal, canvasVal, 'Vacancies');
  graph(lang, receivedDataValNoExp, canvasValNoExp, 'Percent vacancies for interns');
  graph(lang, receivedDataResVac, canvasResVac, 'Resumes/vacancies');
}

//bg-secondary for nonlang
let curRe = /[A-z]\w{0,}|\d/;
let nameLang = document.querySelectorAll('.name_lang');
let nonLang = new Set(['Data', 'Frontend', 'DevOps', 'iOS', 'Android']);

for (let i = 0; i < nameLang.length; i++) {
  //console.log(curRe.exec(nameLang[i].textContent));
  if (nonLang.has(curRe.exec(nameLang[i].textContent)[0])) {
    nameLang[i].classList.remove('bg-dark');
    nameLang[i].classList.add('bg-secondary')
  }
}

for(let i = 0; i < radio1.length; i++){
  radio1[i].addEventListener("change", function(){
    item = parseInt(radio1[i].value);
    if (item == 2022){
      radio1[i].checked = true;
      table2021.hidden = true;
      table2022.hidden = false;
      table2023.hidden = true;
    } else if (item == 2021){
      radio1[i].checked = true;
      table2021.hidden = false;
      table2022.hidden = true;
      table2023.hidden = true;
    } else if (item == 2023){
      radio1[i].checked = true;
      table2021.hidden = true;
      table2022.hidden = true;
      table2023.hidden = false;
    }
  });
}
