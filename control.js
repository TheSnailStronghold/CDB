"use strict";

let AppElements = {
    TablesManager    : new TablesManager(null),
    TableSpace      : new TableSpace(),
    FuncPanel       : new FuncPanel(),
    ContextMenu     : new ContextMenu(),
    TypesWindow     : new TypesWindow()
}

let Types ={
    varchar: "Короткий текст",
    text: "Длинный текст",
    bool: "Логический",
    bigint: "Bigint",
    int: "Целое",
    float: "Числовой",
    date: "Дата",
    serial: "Счетчик"
}

let CurrentState = {
    contextMenu_state   : false,
    tableId      : 0,
    strId        : 0,

    currentTile  : null,
    currentStr   : null,


}

/**
 * обработчики событий для боковой управляющей панели
 */
class FuncPanel_events {
    constructor() {
    }
    handleEvent(event) {
        switch(event.target.id){
            case 'newTableButton':
                this.createNewTable();
                break;
            case 'renameTableButton':
                this.renameTable(CurrentState.tableId, CurrentState.currentTile);
                break;
            case 'deleteTableButton':
                this.deleteTable(CurrentState.tableId, CurrentState.currentTile);
                break;
            case 'saveTablesButton':
                console.log("JSON: ");
                AppElements.TablesManager.parseObjToJSON();
                break;
            default:
                if (event.target.classList.contains('table')){
                    this.changeTile(event.target);
                }
        }
    }
    changeTile(newTile) {
        if(newTile !== CurrentState.currentTile){
            //this.cancelString(CurrentState.strId);
            //TODO this.checkCurrentString();

            AppElements.TableSpace.clearTableSpace();
            AppElements.FuncPanel.activeTable_off(CurrentState.currentTile);
            CurrentState.currentTile = newTile;
            CurrentState.tableId = newTile.getAttribute('data-tableListId');
            AppElements.FuncPanel.activeTable_on(CurrentState.currentTile);
            AppElements.TableSpace.fillTable(AppElements.TablesManager.tablesList[CurrentState.tableId], Types);
            this.currentString();
        }
    }
    cancelString(strId){
        if(strId == 0) return;
        let currentStr = AppElements.TableSpace.getString(strId);
        if(!currentStr.querySelector('input[type="text"]').value){
            AppElements.TablesManager.tablesList[CurrentState.tableId].cancelString();
            console.log('cancelStr: ' + CurrentState.tableId);
        }
    }
    createNewTable() {
        //this.cancelString(CurrentState.strId);
        //TODO this.checkCurrentString();
        AppElements.FuncPanel.activeTable_off(CurrentState.currentTile);
        AppElements.TableSpace.clearTableSpace();
        CurrentState.tableId = AppElements.TablesManager.createTable();
        CurrentState.currentTile = AppElements.FuncPanel.addTableTile(CurrentState.tableId);
        AppElements.FuncPanel.activeTable_on(CurrentState.currentTile);
        this.currentString();
        //AppElements.TableSpace.setFirstStringId(1);
        //TODO the function of clearing tablespace
    }
    checkCurrentString() {
        //TODO вызов функции сохранения строки, если текущая строка не пустая и не имеет конечного индентификатора(>= 1)
    }
    currentString() {
        AppElements.TableSpace.registerFreeString(CurrentState.tableId, 0.5, 0);
        CurrentState.strId = 0.5;
        /*let strId = AppElements.TablesManager.tablesList[tableId].get_useableStrId();
        AppElements.TableSpace.setFirstFreeString(strId);
        CurrentState.strId = strId;*/
        //let curStr = AppElements.TableSpace.getString(strId);
        //AppElements.TableSpace.activeString_on(curStr);
    }
    renameTable(tableId, currentTile) {
        let oldName = currentTile.innerText;
        let newName = prompt("Новое имя таблицы:", oldName);
        if(newName && newName!==oldName) {
            AppElements.TablesManager.renameTable(tableId, newName);
            currentTile.innerText = newName;
        }
    }
    deleteTable(tableId, currentTile) {
        if(confirm("Таблица будет удалена.")){
            AppElements.TablesManager.deleteTable(tableId);
            let newCurTile = currentTile.nextElementSibling;
            newCurTile = (newCurTile === null) ? currentTile.previousElementSibling : newCurTile;
            currentTile.remove();
            if (newCurTile === null) {
                this.createNewTable();
            }else{
                CurrentState.currentTile = newCurTile;
                CurrentState.tableId = newCurTile.dataset.tablelistid;
                AppElements.FuncPanel.activeTable_on(newCurTile);
                AppElements.TableSpace.fillTable(AppElements.TablesManager.tablesList[CurrentState.tableId], Types);
            }
            //todo light current tableTile
            //todo fill table with data of choosen table
        }
    }
    saveTables(){

    }
}

/**
 * обработчики событий для контекстного меню над рабочим пространством
 */
class TableSpaceContextMenu_events {
    handleEvent(event){
        console.log('CM' + event.type);
        switch(event.type){
            case 'click':
                this.clickEvent(event);
                break;
            case 'keyup':
                this.keyupEvent(event);
                break;
        }
    }
    clickEvent(event){
        console.log(event.target.id);
        switch(event.target.id){
            case 'saveStr_contextmenu':
                console.log(event.target.id);
                this.saveStr_event();
                this.closeContextMenu();
                break;
            case 'deleteStr_contextmenu':

                this.deleteRow();
                console.log('here!');
                this.closeContextMenu();
                break;
            case 'closeMenu_contextmenu':
                this.closeContextMenu();
                break;
        }
    }
    keyupEvent(event){
        console.log(event.code);
        switch(event.code){
            case 'Escape':
                this.closeContextMenu();
                //CurrentState.contextMenu_state = AppElements.ContextMenu.toggleContextMenu_off();
                break;
            case 'Delete':
                this.deleteRow();
                this.closeContextMenu();
                break;
            case 'Enter':
                this.saveStr_event();
                this.closeContextMenu();
                break;
        }
    }

    deleteRow() {
        console.log('point0');
        if(CurrentState.strId == 0.5) {
            AppElements.TableSpace.clearRow(AppElements.TableSpace.getString(CurrentState.strId));
        }else{
            AppElements.TablesManager.deleteRow(CurrentState.tableId, CurrentState.strId);
            CurrentState.strId = AppElements.TableSpace.deleteString(CurrentState.strId);
            AppElements.TableSpace.createString();
        }
    }

    saveStr_event() {
        let startStrId = CurrentState.strId;
        if(this.saveRow()){
            this.nextString(startStrId);
        }
    }

    /**
     * сохранение строки
     * @returns {boolean} при успешном сохранении возвращает true
     */
     saveRow() {
        let str = AppElements.TableSpace.getString(CurrentState.strId);
        // получаем ячейки таблицы
        let [pk_checkbox, columnName_input, type_td] = str.children;
        pk_checkbox = pk_checkbox.firstChild;
        columnName_input = columnName_input.firstChild;
        let columnName = columnName_input.value;
        if(columnName === '') {
            alert('Невозможно сохранить строку без ввода имени поля');
            return false;
        }
        let newStrId = AppElements.TablesManager.rememberColumnName(CurrentState.tableId, CurrentState.strId, columnName);
        if(CurrentState.strId == 0.5) {
            str.dataset.strId = newStrId;
            CurrentState.strId = newStrId;
            AppElements.TableSpace.registerFreeString(CurrentState.tableId, CurrentState.strId, 0.5);
        }
        if(type_td.textContent === '') {
            this.saveType(str, 'varchar(255)', Types.varchar);
        } else {
            AppElements.TablesManager.rememberType(CurrentState.tableId, CurrentState.strId, type_td.dataset.type);
        }
        AppElements.TablesManager.togglePrimaryKey(CurrentState.tableId, CurrentState.strId, pk_checkbox.checked);
        return true;

    }

    saveType(str, typeCode, typeText) {
        AppElements.TablesManager.rememberType(CurrentState.tableId, CurrentState.strId, typeCode);
        AppElements.TableSpace.set_stringType(str, typeCode, typeText);
    }
    changeStrCounters(dif) {
        //AppElements.TablesManager.tablesList[CurrentState.tableId]
    }

    //переход на следующую строку
    nextString(oldStrId) {
        if(oldStrId != 0.5) return;
        if(AppElements.TableSpace.strAmount < AppElements.TablesManager.tablesList[CurrentState.tableId].stringAmount) {
            AppElements.TableSpace.strAmount++;
            AppElements.TableSpace.createString();
        }
        AppElements.TableSpace.activeString_off();
        AppElements.TableSpace.registerFreeString(CurrentState.tableId,0.5, 0);
        CurrentState.strId = 0.5;
    }

    closeContextMenu() {
        CurrentState.contextMenu_state = AppElements.ContextMenu.toggleContextMenu_off(CurrentState.contextMenu_state);
        AppElements.TableSpace.getString(CurrentState.strId).querySelector('input[type="text"]').focus();
    }
}


/**
 * обработчики событий для меню типов
 */
class TypesWindow_events {
    type;
    limit;
    establishedStr;
    constructor() {
    }
    handleEvent(event) {
        let targetTagName = event.target.tagName;
        if(targetTagName === 'TD' || targetTagName === 'INPUT') {
            AppElements.TypesWindow.pressedTypeEffect_off(this.establishedStr);
            this.establishedStr = AppElements.TypesWindow.getTargetStr(event.target);
            AppElements.TypesWindow.pressedTypeEffect_on(this.establishedStr);
        }
        if(targetTagName === 'BUTTON') {
            if(event.target.id === 'applyButton') {
                let typeObj = AppElements.TypesWindow.buildTypeCode(this.establishedStr, Types);
                AppElements.TableSpace.set_stringType(AppElements.TableSpace.getString(CurrentState.strId), typeObj.typeCode, typeObj.typeText);
            }
            AppElements.TypesWindow.pressedTypeEffect_off(this.establishedStr);
            let eventSourceStr = AppElements.TableSpace.getString(CurrentState.strId);
            AppElements.TypesWindow.typesWindow_off(eventSourceStr);
        }
    }

    clearData() {
        this.type = null;
        this.limit = null;
    }

    parseTypeCode(typeCode) {
        let parseObj = {
            type    : null,
            limit   : null
        };
        let parseTypeCode = typeCode.split('(');
        parseObj.type = parseTypeCode[0];
        console.log('TD  ' + parseObj.type);
        if(parseTypeCode.length > 1) {
            parseObj.limit = parseTypeCode[1].split(')');
        }
        return parseObj;
    }
    openTypesWindow(typeCode) {
        console.log("OPENTYPESWINDOW  " + typeCode);
        let typeObj = typeCode ? this.parseTypeCode(typeCode) : { type  : 'varchar', limit  : 255 };
        AppElements.TypesWindow.typesWindow_on();
        this.establishedStr = AppElements.TypesWindow.firstStateType(typeObj.type, typeObj.limit);
    }
}


/**
 * обработчики событий для рабочего пространства(таблица)
 */
class TableSpace_events {
    contextMenu_events;
    typesWindow_events;
    constructor(){
        this.contextMenu_events = new TableSpaceContextMenu_events();
        AppElements.ContextMenu.contextMenu_dom.addEventListener('click', this.contextMenu_events);
        AppElements.ContextMenu.contextMenu_dom.addEventListener('keyup', this.contextMenu_events);

        this.typesWindow_events = new TypesWindow_events();
        AppElements.TypesWindow.typesWindow_dom.addEventListener('click', this.typesWindow_events);


    }
    handleEvent(event){
        console.log('!'+event.type);
        console.log('!'+event.target);
        switch(event.type){
            case 'click':
                //если активно контекстное меню
                CurrentState.contextMenu_state = AppElements.ContextMenu.toggleContextMenu_off(CurrentState.contextMenu_state);

                //клик на ячейку (клик может быть на: другой строке, ячейке выбора типа, чекбоксе - все проверить)

                this.clickEvent(event);

                break;
            case 'contextmenu':
                event.preventDefault();
                if(CurrentState.strId == AppElements.TableSpace.get_targetStringObj(event.target).strId){
                    console.log('done');
                    this.contextmenuEvent(event);
                }
                break;
            case 'keyup':

                this.keyupEvent(event);
                break;
            case 'input':
                console.log("it's work");
                if(event.target.type === 'text') {
                    this.saveInputValue();
                    console.log("it's work");
                }
                if(event.target.type === 'checkbox') {
                    //this.tablesObj[currentState.tableId];
                }
                break;
            case 'focusin':
                let targetStrObj = AppElements.TableSpace.get_targetStringObj(event.target);
                if(targetStrObj.strId == 0) event.target.blur();
                break;

        }

    }
    toggle_string(){

    }
    clickEvent(event){
        // объект содержит строку и идентификатор выбранной строки
        let targetStrObj = AppElements.TableSpace.get_targetStringObj(event.target);
        //содержимое текущей строки
        let curInputValue = AppElements.TableSpace.getInputValue(AppElements.TableSpace.getString(CurrentState.strId))
        if (!targetStrObj.strId) {
            if(targetStrObj.strId === 0) {
                if(event.target.type == 'checkbox') {
                    event.target.checked = false;
                };
                if(curInputValue !== '') {
                    // TODO исправить переход на строку
                    this.contextMenu_events.saveStr_event();
                };
            }
        }else{
            /*if(targetObj.strId >= 1) {
                // TODO переход на строку с индентификатором выбранной строки
                CurrentState.strId = AppElements.TableSpace.changeString(event.target);
            }*/

            CurrentState.strId = AppElements.TableSpace.changeString(event.target);
            if(event.target.tagName === 'TD') {
                targetStrObj.str.querySelector('input[type="text"]').blur();
                //если инпут пуст, то ничего
                if(curInputValue !== '') {
                    // TODO вызов меню для выбора типа
                    let typeCode = AppElements.TableSpace.get_stringType(targetStrObj.str);
                    this.typesWindow_events.openTypesWindow(typeCode);

                    //AppElements.TypesWindow.typesWindow_on(typeCode);
                }
            }

        }


        /*switch(event.target.tagName) {
            case 'INPUT':
                console.log('CHECK');
                alert(event.target.type);
                break;
            case 'TD':
                let strObj = AppElements.TableSpace.get_targetStringObj(event.target);
                if(strObj.strId != CurrentState.strId) return;
                //если инпут пуст, то ничего
                if(inputValue !== '') {
                    // TODO вызов меню для выбора типа
                }
                alert('td');
                break;
            case 'lI':
                alert('li');
                break;
        }*/
    }
    keyupEvent(event){
        console.log(event.code);
        switch(event.code){
            case 'Escape':
                console.log('ESCAPE');
                this.contextMenu_events.closeContextMenu();
                //CurrentState.contextMenu_state = AppElements.ContextMenu.toggleContextMenu_off(CurrentState.contextMenu_state);
            case 'Enter':
                this.contextMenu_events.saveStr_event();

        }
    }
    contextmenuEvent(event){
        alert(event.target.tagName);
        CurrentState.contextMenu_state = AppElements.ContextMenu.toggleContextMenu_on(CurrentState.contextMenu_state);
        AppElements.ContextMenu.positionContextMenu(event);
    }

    /** сохранение наименования поля
     */
    saveInputValue() {
        let str = AppElements.TableSpace.getString(CurrentState.strId);
        let inputData = AppElements.TableSpace.getInputValue(str);
        CurrentState.strId = AppElements.TablesManager.rememberColumnName(CurrentState.tableId, CurrentState.strId, inputData);
    }

}





//////////////////////////////////////////////////////////////////////////
let funcPanel_events = new FuncPanel_events();
AppElements.FuncPanel.funcContainer_dom.addEventListener('click', funcPanel_events);

let tableSpace_events = new TableSpace_events();
AppElements.TableSpace.tableSpace_dom.addEventListener('click', tableSpace_events);
AppElements.TableSpace.tableSpace_dom.addEventListener('contextmenu', tableSpace_events);
AppElements.TableSpace.tableSpace_dom.addEventListener('keyup', tableSpace_events);
AppElements.TableSpace.tableSpace_dom.addEventListener('focusin', tableSpace_events)

//AppElements.TableSpace.tableSpace_dom.addEventListener('input', tableSpace_events)


document.addEventListener('load', () => console.log('TEST'));