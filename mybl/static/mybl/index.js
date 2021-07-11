let button = document.getElementById('stocks');
let text = document.querySelector('p');
let days = document.getElementById('days');
let rowTable = document.querySelector('row-table');
let maxValRows = 76;
let minValRows = 21;


function deleteRow(row) {
  let moexTable = document.getElementById('moex');
  let i = 0;
  while (moexTable.rows.length > minValRows) {
    moexTable.deleteRow(-1);
  }
}


function insRow() {
  let moexTable = document.getElementById('moex');
  let i = 0;
  while (i < maxValRows) {
    let newRow = moexTable.rows[19].cloneNode(true);
    moexTable.appendChild(newRow);
    i += 1;
  }
  button.onclick();
}


let dict = function (dif) {
  let day = new Map();
  let dateLast = new Date();
  dateLast.setDate(dateLast.getDate() - dif);
    if (dateLast.getDay() == 6) {
    dateLast.setDate(dateLast.getDate() - 1);
  } else if (dateLast.getDay() == 0) {
    dateLast.setDate(dateLast.getDate() - 2);
  };
  dateLast = dateLast.toISOString().slice(0, 10);
  //console.log(`dateLast slice ${dateLast}`);
  for (let i = 0; i < 201; i += 100) {
    let url = 'https://iss.moex.com/iss/history/engines/stock/markets/shares/boards/tqbr/securities.json?date=' + dateLast + '&start=' + i;
    $.ajax({
    url: url,
    async: false,
    dataType: 'json',
    success: function (data) {
      let rows = data.history.data;
      for (let row = 0; row < rows.length; row++) {
        /*day.set('<a href="https://www.moex.com/ru/issue.aspx?board=TQBR&code=' + rows[row][3] + '">' + rows[row][2] + '</a>', rows[row][9]);*/
        day.set(rows[row][2] + ' (' + rows[row][3] + ')', rows[row][9]);
      };
    }});
  };
  //console.log(day);
  return [day, dateLast];
};

button.onclick = async function () {
  let namesHigh = document.querySelectorAll('.name-high');
  let namesLow = document.querySelectorAll('.name-low');
  let changesHigh = document.querySelectorAll('.change-high');
  let changesLow = document.querySelectorAll('.change-low');
  let dateDict2 = document.querySelector('.date-dict2');
  
  for (let i of namesHigh) {
    if (i.classList.length > 1){
    i.classList.remove('bg-primary');
    };
  };
  
  for (let i of namesLow) {
    if (i.classList.length > 1){
    i.classList.remove('bg-primary');
    };
  };
  
  for (let i of changesHigh) {
    if (i.classList.length > 1){
    i.classList.remove('bg-success');
    };
  };
  
  for (let i of changesLow) {
    if (i.classList.length > 1){
    i.classList.remove('bg-danger');
    };
  };
  
  let date = new Date();
  
  if (date.getDay() == 1 && parseInt(days.value) < 4) {
    days.value = 4;
  } else if (date.getDay() == 0 && parseInt(days.value) < 3) {
    days.value = 3;
  };
  
  let dict1 = await dict(1)[0];
  //console.log(dict1);
  let dict2 = await dict(days.value)[0];
  //console.log(dict2);
  dateDict2.textContent = await `(от ${dict(days.value)[1]})`;
  //console.log(dateDict2);
  let listKeys = [...dict1.keys()];
  let outMap = new Map();
  
  for (let key = 0; key < listKeys.length; key++) {
    let val = ((dict1.get(listKeys[key])/dict2.get(listKeys[key])) - 1) * 10000;
    if (!Number.isNaN(val)) {
      val = Math.round(val);
      val = val/100;
      outMap.set(listKeys[key], val);
    };
  };
  
  outMapRev = new Map([...outMap.entries()].sort((a,b) => a[1] - b[1]));
  outMap = new Map([...outMap.entries()].sort((a,b) => b[1] - a[1]));
  outMapKeys = [...outMap.keys()].slice(0, 100);
  outMapValues = [...outMap.values()].slice(0, 100);
  outMapRevKeys = [...outMapRev.keys()].slice(0, 100);
  outMapRevValues = [...outMapRev.values()].slice(0, 100);
  
  let blue = new Set(['(SBER', '(GAZP', '(LKOH', '(YNDX', '(GMKN', '(NVTK', '(POLY', '(ROSN', '(PLZL', '(MGNT', '(MTSS', '(TATN', '(MAIL', '(FIVE', '(SNGS']);
  let myRe = /[(]\w+/;
  
  for (let i = 0; i < namesHigh.length; i++) {
    namesHigh[i].textContent = outMapKeys[i];
    if (blue.has(myRe.exec(namesHigh[i].textContent)[0])){
      namesHigh[i].classList.add('bg-primary')
    };
    changesHigh[i].textContent = outMapValues[i];
    
    namesLow[i].textContent = outMapRevKeys[i];
    if (blue.has(myRe.exec(namesLow[i].textContent)[0])){
      namesLow[i].classList.add('bg-primary')
    };
    changesLow[i].textContent = outMapRevValues[i];
    
    if (changesHigh[0].textContent != 'Infinity') {
      changesHigh[i].style.backgroundColor = 'rgba(40, 167, 69,'  + (parseFloat(changesHigh[i].textContent)/parseFloat(changesHigh[0].textContent)) + ')';
    } else{
      changesHigh[i].style.backgroundColor = 'rgba(40, 167, 69,'  + (parseFloat(changesHigh[i].textContent)/parseFloat(changesHigh[1].textContent)) + ')';
    };
    changesLow[i].style.backgroundColor = 'rgba(220, 53, 69,'  + (parseFloat(changesLow[i].textContent)/parseFloat(changesLow[0].textContent)) + ')';
  };
};

window.onload = function(){
  button.click();
}


let currency_plus = document.querySelectorAll('.currency_plus');
let currency_minus = document.querySelectorAll('.currency_minus');
let value_plus = document.querySelectorAll('.value_plus');
let value_minus = document.querySelectorAll('.value_minus');
let curRe = /[A-Z]\w+/
let usdXdr = new Set(['USD', 'XDR']);

for (let i = 0; i < value_plus.length; i++) {
  value_plus[i].style.backgroundColor = 'rgba(255, 255, 255,'  + (1 - parseFloat(value_plus[i].textContent)/parseFloat(value_plus[0].textContent)) + ')';
  if (usdXdr.has(curRe.exec(currency_plus[i].textContent)[0])) {
    currency_plus[i].classList.add('bg-primary')}
};

for (let i = 0; i < value_minus.length; i++) {
  value_minus[i].style.backgroundColor = 'rgba(255, 255, 255,'  + (1 - parseFloat(value_minus[i].textContent)/parseFloat(value_minus[0].textContent)) + ')';
  if (usdXdr.has(curRe.exec(currency_minus[i].textContent)[0])) {
    currency_minus[i].classList.add('bg-primary')}
};


