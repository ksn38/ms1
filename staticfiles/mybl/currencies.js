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


//parse from moex.com to Map
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

let inputDelta0 = document.getElementById('mytextbox0');
let inputDelta1 = document.getElementById('mytextbox1');
let inputDelta2 = document.getElementById('mytextbox2');
let inputDelta3 = document.getElementById('mytextbox3');
inputDelta0.value = delta0;
inputDelta1.value = delta1;
inputDelta2.value = delta2;
inputDelta3.value = delta3;


//creating and coloring table with moex socks
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
  dateDict2.textContent = await `(from ${dict(days.value)[1]})`;
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

//coloring table of currencies
let currencyPlus = document.querySelectorAll('.currency-plus');
let valuePlus = document.querySelectorAll('.value-plus');
let valuePlus1 = document.querySelectorAll('.value-plus1');
let valuePlus2 = document.querySelectorAll('.value-plus2');
let valuePlus3 = document.querySelectorAll('.value-plus3');
let curRe = /[A-Z]\w+/
let usdXdr = new Set(['USD', 'CNY', 'EUR']);
let EM = new Set(['TRY', 'ZAR', 'UAH', 'BRL', 'KZT', 'INR']);
let com = new Set(['NOK', 'ZAR', 'AUD', 'CAD', 'KZT', 'BRL']);
let mid = new Set(['KRW', 'PLN']);

let colorVal = (values) => {
  for (let i = 0; i < values.length; i++) {
    let val = parseFloat(values[i].textContent);
    if (val >= 0) {
      values[i].style.backgroundColor = 'rgba(40, 167, 69,'  + (val/(parseFloat(values[0].textContent)*2)) + ')';
    } else {
      values[i].style.backgroundColor = 'rgba(220, 53, 69,'  + (val/(parseFloat(values[values.length - 1].textContent)*1.5)) + ')'
    }
  }
}

colorVal(valuePlus);
colorVal(valuePlus1);
colorVal(valuePlus2);
colorVal(valuePlus3);

for (let i = 0; i < currencyPlus.length; i++) {
  if (usdXdr.has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.add('bg-info', 'text-dark', 'font-weight-bold')}
  if (EM.has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.add('bg-warning', 'font-weight-bold');}
  if (com.has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.add('text-light', 'font-weight-bold', 'font-italic', 'text-lowercase');}
    //currencyPlus[i].classList.add('font-weight-bold')}
  if (mid.has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.add('bg-secondary', 'text-warning');}
  if (new Set(['XDR']).has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.add('bg-primary', 'font-weight-lighter')}
  if (new Set(['CNY']).has(curRe.exec(currencyPlus[i].textContent)[0])) {
    currencyPlus[i].classList.remove('text-dark');
    currencyPlus[i].classList.add('text-warning')}
};




