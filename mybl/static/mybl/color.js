let tr = document.querySelectorAll('.color');
let tri = document.querySelectorAll('.color_inv');

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

console.log(received_data);

let date = [];
let java = [];
let js = [];
let php = [];
let py = [];

for (let i = 0; i < received_data.length; i += 4) {
  date.push(received_data[i]['fields']['date_added']);
  java.push(received_data[i]['fields']['val']);
  js.push(received_data[i + 1]['fields']['val']);
  php.push(received_data[i + 2]['fields']['val']);
  py.push(received_data[i + 3]['fields']['val']);
}

console.log(date);

let chart = document.getElementById("line-chart");

new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: date,
    datasets: [{ 
        data: java,
        label: "Java",
        borderColor: "#3e95cd",
        fill: false
      }, { 
        data: js,
        label: "Javascript",
        borderColor: "#3cba9f",
        fill: false
      }, { 
        data: php,
        label: "php",
        borderColor: "#e8c3b9",
        fill: false
      }, { 
        data: py,
        label: "Python",
        borderColor: "#c45850",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: ''
    }
  }
});