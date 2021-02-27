let tr = document.querySelectorAll('.color');
let tri = document.querySelectorAll('.color-inv');

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

let date = [];
let java = [];
let js = [];
let php = [];
let py = [];
let win = 7;

for (let i = 0; i < received_data.length; i += 4) {
  date.push(received_data[i]['fields']['date_added']);
  java.push(received_data[i]['fields']['res_vac']);
  js.push(received_data[i + 1]['fields']['res_vac']);
  php.push(received_data[i + 2]['fields']['res_vac']);
  py.push(received_data[i + 3]['fields']['res_vac']);
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

let chart = document.getElementById("line-chart");

new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: date,
    datasets: [{ 
        data: rollAvg(java),
        label: "Java",
        borderColor: "#3e95cd",
        fill: false,
        pointRadius: 0,
      }, { 
        data: rollAvg(js),
        label: "Javascript",
        borderColor: "#3cba9f",
        fill: false,
        pointRadius: 0,
      }, { 
        data: rollAvg(php),
        label: "php",
        borderColor: "#e8c3b9",
        fill: false,
        pointRadius: 0,
      }, { 
        data: rollAvg(py),
        label: "Python",
        borderColor: "#c45850",
        fill: false,
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
    title: {
        display: true,
        text: 'Количество резюме на вакансию'
      }
  }
});
