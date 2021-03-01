let namesHigh = document.querySelectorAll('.name-high');
let namesLow = document.querySelectorAll('.name-low');
let changesHigh = document.querySelectorAll('.change-high');
let changesLow = document.querySelectorAll('.change-low');
let button = document.getElementById('stocks');
let text = document.querySelector('p');
let days = document.getElementById('days');


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
  return day;
};


button.onclick = function () {
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
  
  let date = new Date();
  if (date.getDay() == 1 && parseInt(days.value) < 4) {
    days.value = 4;
  } else if (date.getDay() == 0 && parseInt(days.value) < 3) {
    days.value = 3;
  };
  let dict1 = dict(1);
  dict1 = new Map([...dict1.entries()]);
  let dict2 = new Map([...dict(days.value).entries()]);
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
  outMapKeys = [...outMap.keys()].slice(0, 30);
  outMapValues = [...outMap.values()].slice(0, 30);
  outMapRevKeys = [...outMapRev.keys()].slice(0, 30);
  outMapRevValues = [...outMapRev.values()].slice(0, 30);
  let blue = new Set(['(SBER', '(GAZP', '(LKOH', '(YNDX', '(GMKN', '(NVTK', '(POLY', '(ROSN', '(PLZL', '(MGNT', '(MTSS', '(TATN', '(MAIL', '(FIVE', '(SNGS']);
  let myRe = /[(]\w+/;
  
  for (let i = 0; i < namesHigh.length; i++) {
    namesHigh[i].textContent = outMapKeys[i];
    if (blue.has(myRe.exec(namesHigh[i].textContent)[0])){
      namesHigh[i].classList.add('bg-primary')};
    changesHigh[i].textContent = outMapValues[i];
    namesLow[i].textContent = outMapRevKeys[i];
    if (blue.has(myRe.exec(namesLow[i].textContent)[0])){
      namesLow[i].classList.add('bg-primary')};
    changesLow[i].textContent = outMapRevValues[i];
  };
};

window.onload = function(){
  button.click();
}


