let TableStorage;
let IDB = indexedDB.open('IDB', 1);

const isDebug=false;

IDB.onupgradeneeded = (event) => {
  RequestStorage = event.target.result;
  RequestStorage.createObjectStore("TablesStorage", {keyPath:index});
}

IDB.onsuccess = (event) => {
  TableStorage = event.target.result;
}

IDB.onerror = (event) => {
  alert('Error opening database ' + event.target.errorCode);
}


const LoadTablesFromDB = () =>
{
  // Запустим транзакцию базы данных и получите хранилище объектов Notes
  let transaction = TableStorage.transaction(['TablesStorage'], 'readonly');
  let store = transaction.objectStore('TablesStorage');

  let Tables= [];
  //создаем курсор
  let req = store.openCursor();

  req.onsuccess = (event) => {
    // Результатом req.onsuccess в запросах openCursor является
     // IDBCursor
    let cursor = event.target.result;
    if (cursor != null) {
      // Если курсор не нулевой, мы получили элемент.
      Tables.push(cursor.value);
      cursor.continue();
    }
  }

  // Ожидаем завершения транзакции базы данных
  transaction.oncomplete = () => {
    if (isDebug) console.log('Load tables sucsessful!')
  }
  transaction.onerror = (event) => {
    alert('Error load tables:' + event.target.errorCode);
  }
  return Tables;
};

const StoreTables = (TablesArray) =>
{
  let transaction = TableStorage.transaction(['TablesStorage'], 'readwrite');
  let store = transaction.objectStore('TablesStorage');

  store.clear();
  let i=0;
  TablesArray.forEach(element => {
    store.add(element,i);
    i++;
  });

  transaction.onsuccess = (event) => {
    if (isDebug) console.log("Save tables!");
  }
 
  transaction.onerror = (event) => {
    alert('Error saving tables:' + event.target.errorCode);
  }

}