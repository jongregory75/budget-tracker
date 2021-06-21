let db;

//open indexDB
const request = window.indexedDB.open("budget", 1);

// create object store inside onupgradeneeded
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("budgetStore", { autoIncrement: true });
};

// function to determine if user is back online
request.onsuccess = function (event) {

  console.log(`Found result: ${event.target.result}`);
  db = event.target.result;

  if (navigator.onLine) {
    console.log("Backend Online");
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(`ERROR in event: ${event}`);
};

//creates transaction with readwrite ability
//accesses the budgetStore
//writes to budgetStore
function saveRecord(record) {
  const transaction = db.transaction(["budgetStore"], "readwrite");
  const save = transaction.objectStore("budgetStore");

  save.add(record);
}

//creates transaction with readwrite ability for budgetStore query
//accesses the budgetStore
//once the user is back online, DB will be updated with offline data
function checkDatabase() {
const transaction = db.transaction(["budgetStore"], "readwrite");
const save = transaction.objectStore("budgetStore");
const getAll = save.getAll();
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      //checks to see if data exists, if so will update via POST route in 
      //api.js
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const saveInfo = db.transaction("budgetStore", "readwrite");
          const store = saveInfo.objectStore("budgetStore");
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);