let date = [];
let vix = [];

for (let i of received_data) {
  date.push(i['fields']['date_added']);
  vix.push(i['fields']['vix']);
}
console.log(date);


new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: date,
    datasets: [{ 
        data: vix,
        label: "VIX",
        borderColor: "#3e95cd",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'VIX'
    }
  }
});



