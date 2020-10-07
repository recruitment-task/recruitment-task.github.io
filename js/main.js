/* Utils and mock */
let personList = [];
let selectedPersonId = null;
fetch("./mock/person-list.json")
  .then((file) => file.text())
  .then((json) => (personList = JSON.parse(json)));

function loadTasksMock() {
  [1, 2, 3]
    .map((num) => createTask(`Zadanie ${num}`, 2124 + num * num))
    .forEach((el) => {
      $("table")[0].onchange(el);
    });
}

const $ = (selector) => document.querySelectorAll(selector);

const euroPrice = 4.8282;

function createTask(taskName, amountPLN) {
  return {
    taskName,
    amountPLN: round(amountPLN),
    amountEURO: round(amountPLN / euroPrice),
  };
}

const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const stringToHTML = (str) => {
  return document.createRange().createContextualFragment(str);
};

const loadHtmlAsString = async (url) => {
  let result = await fetch(url);
  return await result.text();
};

/* Business && Logic */
$("#euro_price")[0].innerText = euroPrice;

/*  Adds dynamic  labels and errors for inputs  */
$(".input-js").forEach((element) => {
  element.onfocus = function () {
    this.previousElementSibling.classList.add("primary-color");
    this.classList.remove("form__input__error");
    this.nextElementSibling.classList.remove("show");
  };
  element.onblur = function () {
    this.previousElementSibling.classList.remove("primary-color");
  };
  element.oninput = function () {
    if (this.value === "") {
      this.previousElementSibling.classList.remove("show");
    } else {
      this.previousElementSibling.classList.add("show");
    }
  };
});

$("form")[0].onsubmit = function (event) {
  event.preventDefault();
  const isCompanyValid = inputValidator(this.company_name, (value) => {
    return value.trim() !== "";
  });
  const isPersonValid = inputValidator(this.person, (value) => {
    return value.trim() !== "";
  });
  const isTaskValid = inputValidator(this.task, (value) => {
    return value.trim().length >= 5;
  });
  const isAmountValid = inputValidator(this.amount, (value) => {
    return value.trim() !== "" && !!value.match("^[0-9]*$");
  });
  if (isCompanyValid && isPersonValid && isTaskValid && isAmountValid) {
    $("table")[0].onchange(
      createTask(this.task.value, parseFloat(this.amount.value))
    );
  }
};
const inputValidator = (input, isValid) => {
  if (isValid(input.value)) {
    input.classList.remove("form__input__error");
    input.nextElementSibling.classList.remove("show");
    return true;
  } else {
    input.classList.add("form__input__error");
    input.nextElementSibling.classList.add("show");
    return false;
  }
};
/* search component */
let isSearchOpen = false;
const searchSection = $("#search")[0];
$("#form_select")[0].onclick = () => {
  searchSection.classList.toggle("show");
  searchSection.querySelector("input").focus();
  isSearchOpen = !isSearchOpen;
  if (isSearchOpen) {
    loadPersonList(personList);
  }
};
document.onmousedown = (e) => {
  if (e.target.isEqualNode($("main")[0]) && isSearchOpen) {
    searchSection.classList.remove("show");
    isSearchOpen = false;
  }
};
$("#search_input")[0].oninput = function () {
  const list = personList.filter((val) =>
    val.name.toLowerCase().includes(this.value.toLowerCase())
  );
  loadPersonList(list);
};

const onCilckListItem = function () {
  const name = this.querySelector("span").innerHTML;
  selectListItem(this);
  selectedPersonId = parseInt(this.id);
  $("#person")[0].value = name;
};

const selectListItem = (htmlElement) => {
  $(".list-icon-js").forEach((element) => element.classList.remove("show"));
  $(".person-name-js").forEach((el) => el.classList.remove("selected"));
  htmlElement.querySelector(".list-icon-js").classList.add("show");
  htmlElement.querySelector(".person-name-js").classList.add("selected");
};

searchSection.onkeydown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (e.target.id === "search_input") {
      searchSection.querySelector("li").focus();
      return;
    }
    if (e.target.nextElementSibling) {
      e.target.nextElementSibling.focus();
    } else {
      searchSection.querySelector("li").focus();
    }
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (e.target.previousElementSibling) {
      e.target.previousElementSibling.focus();
    } else {
      searchSection.querySelector("li").focus();
    }
  }
};
const loadPersonList = async (list) => {
  const searchList = $("#search_list")[0];
  searchList.innerHTML = "";
  const htmlString = await loadHtmlAsString("./content/list-element.html");
  const htmlList = list.map((person) =>
    conectPersonWithHtmlListItem(person, htmlString)
  );
  htmlList.forEach((element) => searchList.appendChild(element));
};
const conectPersonWithHtmlListItem = (person, htmlString) => {
  const htmlListItem = stringToHTML(htmlString);
  const li = htmlListItem.querySelector("li");
  li.onclick = onCilckListItem;
  li.onkeydown = (e) => {
    if (e.key === "Enter") {
      onCilckListItem.bind(e.target)();
      isSearchOpen = false;
      searchSection.classList.remove("show");
    }
  };
  li.id = person.id;
  if (person.id === selectedPersonId) {
    selectListItem(htmlListItem);
  }
  htmlListItem.querySelector("span").innerText = person.name;
  htmlListItem.querySelector("img").src = person.img;
  return htmlListItem;
};

/* table component */

function convertNumberToStringWithSpace(x) {
  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " "); // adds white space after every third digit
  return parts.join(".");
}
const htmlTable = $("table")[0];
let taskList = [];

function deleteTask(id) {
  console.log("Delte task id ", id);
  htmlTable.querySelector(`#id_${id}`).remove();
  taskList = taskList.filter((task) => task.id !== id);
  addAmountSum();
}
function addTask(task) {
  task = { ...task, id: taskList.length };
  taskList.push(task);
  insertRow(task);
  addAmountSum();
}
function addAmountSum() {
  let sumPLN = taskList.reduce((acc, task) => acc + task.amountPLN, 0);
  sumPLN = convertNumberToStringWithSpace(round(sumPLN));
  let sumEURO = taskList.reduce((acc, task) => acc + task.amountEURO, 0);
  sumEURO = convertNumberToStringWithSpace(round(sumEURO));
  $(".amount-sum-js")[0].innerText = `${sumPLN} PLN (${sumEURO} Euro)`;
}
function insertRow(task) {
  const row = htmlTable.insertRow(taskList.length);
  row.id = `id_${task.id}`;
  row.insertCell(0).innerText = task.taskName;
  row.insertCell(1).innerText =
    convertNumberToStringWithSpace(task.amountPLN) + " PLN";
  row.insertCell(2).innerText =
    convertNumberToStringWithSpace(task.amountEURO) + " EUR";
  row.insertCell(
    3
  ).innerHTML = `<span onclick=deleteTask(${task.id})><img alt="Trash can icon" src="./assets/union.svg" /> Usuń</span>`;
}
function updateList(list) {
  list.forEach((task) => {
    htmlTable.querySelector(`#id_${task.id}`).remove();
    this.insertRow(task);
  });
  console.log(taskList);
}
htmlTable.onchange = addTask;

htmlTable.querySelector("#sort_asc_name").onclick = () => {
  taskList = taskList.sort((el1, el2) =>
    el1.taskName.localeCompare(el2.taskName)
  );
  updateList(taskList);
};
htmlTable.querySelector("#sort_desc_name").onclick = () => {
  taskList = taskList.sort((el1, el2) =>
    el2.taskName.localeCompare(el1.taskName)
  );
  updateList(taskList);
};
htmlTable.querySelector("#sort_asc_pln").onclick = () => {
  taskList = taskList.sort((el1, el2) => el2.amountPLN - el1.amountPLN);
  updateList(taskList);
};
htmlTable.querySelector("#sort_desc_pln").onclick = () => {
  taskList = taskList.sort((el1, el2) => el1.amountPLN - el2.amountPLN);
  updateList(taskList);
};
htmlTable.querySelector("#sort_asc_euro").onclick = () => {
  taskList = taskList.sort((el1, el2) => el2.amountEURO - el1.amountEURO);
  updateList(taskList);
};
htmlTable.querySelector("#sort_desc_euro").onclick = () => {
  taskList = taskList.sort((el1, el2) => el1.amountEURO - el2.amountEURO);
  updateList(taskList);
};

loadTasksMock();
