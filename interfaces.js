"use strict";

class TableSpace {
    tableSpace_dom = document.querySelector('.workContainer').querySelector('tbody');
    strAmount = 35;
    constructor(){
        this.drawTable();
        //console.log(TableSpace.get_tableSpace());
    }
    //отрисовка таблицы
    drawTable(){
        //TODO написать функцию для генерации строк в зависимости от разрешения экрана
        for(let i=1; i < this.strAmount; i++){
            this.createString();
        }
    }
    setFirstStringId(id){
        this.tableSpace_dom.querySelector('tr[data-strId="0"]').setAttribute('data-strId', String(id));
    }
    //создание строки
    createString(){
        let newStr = document.createElement('tr');
        let newColumn = document.createElement('td');
        let newInput = document.createElement('input');
        newInput.setAttribute('type','checkbox');
        //newInput.addEventListener('change',primeKeyEvent);
        newColumn.append(newInput);
        newStr.append(newColumn);
        newColumn = document.createElement('td');
        newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        //newInput.addEventListener("change", rememberStr);
        newColumn.append(newInput);
        //newStr.setAttribute('id','str'+ index);
        newStr.setAttribute('data-strId','0');
        //SVO.strCounter++;
        newStr.append(newColumn);
        newColumn = document.createElement('td');
        newColumn.setAttribute('data-type','');
        //newColumn.addEventListener("click", typeWindow);
        newStr.append(newColumn);
        this.tableSpace_dom.append(newStr);
    }
    deleteString(strId) {
        let delStr = this.getString(strId);
        let newStr;
        if(delStr) {
            newStr = delStr.nextElementSibling;
            delStr.remove();
            this.activeString_on(newStr);
            return newStr.dataset.strid;
        }
    }

    clearTableSpace(){
        this.activeString_off();
        let str = this.tableSpace_dom.querySelector('tr').nextElementSibling;
        let strAmount = this.strAmount;
        console.log(Number(str.getAttribute('data-strId')));
        for(let ind = 0; ind < strAmount && Number(str.getAttribute('data-strId')) > 0; ind++){
            this.clearRow(str);
            str.dataset.strid = '0';
            str = str.nextElementSibling;
            console.log('flag');
        }
    }
    clearRow(str) {
        let elList = str.children;
        console.log(elList);
        elList[0].firstChild.checked = false;       //clean checkbox
        elList[1].firstChild.value = '';            //clean input
        elList[2].innerText = '';                   //clean type field
        elList[2].dataset.type = '';                //clean typeCode
    }
    addRows(amount) {
        for(let i=0; i<amount; i++) {
            this.createString();
        }
    }
    fillTable(tableEntity, Types) {
        this.clearTableSpace();
        if(this.strAmount < tableEntity.stringAmount) {
            let dif = tableEntity.stringAmount - this.strAmount;
            this.addRows(dif);
            this.strAmount += dif;
        }
        let columnsCollection = tableEntity.tableData.columns;
        let primaryKeys = tableEntity.tableData.primaryKeys;
        let str = this.getString(0);
        for(let strId in columnsCollection) {
            let [pk_pole, columnName_pole, type_pole] = str.children;
            let pk_checkbox = pk_pole.firstChild;
            let columnName_input = columnName_pole.firstChild;

            if(primaryKeys.has(Number(strId))){
                pk_checkbox.checked = true;
            }

            columnName_input.value = columnsCollection[strId].columnName;
            str.dataset.strid = strId;

            let type = columnsCollection[strId].type;
            type_pole.dataset.type = type;
            console.log(Types);
            console.log(type.split('(')[0]);
            type_pole.textContent = Types[type.split('(')[0]];

            str = str.nextElementSibling;
        }

    }
    getString(strId) {
        return this.tableSpace_dom.querySelector('tr[data-strId="' + strId + '"]');
    }
    /*getInputValue(strId) {
        return this.getString(strId).querySelector('input[type="text"]').value;
    }*/
    getInputValue(str) {
        return str.querySelector('input[type="text"]').value;
    }

    /** установка атрибута strId для первой строки в таблице с oldStrId
     * @param newStrId новый id строки
     * @param oldStrId старый id строки, по которому происходит поиск нужной строки таблицы
     */
    registerFreeString(tableId, newStrId, oldStrId){
       let firstFreeString = this.tableSpace_dom.querySelector('tr[data-strId="' + oldStrId + '"]');
       firstFreeString.setAttribute('data-strId', String(newStrId));
       this.activeString_on(firstFreeString);
    }


    activeString_on(str){
        str.classList.add('activeString');
        str.querySelector('input[type="text"]').focus();
    }

    activeString_off(){
        let activeStr = this.tableSpace_dom.querySelector('.activeString');
        if (activeStr) {
            activeStr.classList.remove('activeString');
        }
        //this.getString(strId).classList.remove('activeString');
    }
    /*activeString_on(strId){
        let curStr = this.getString(strId);
        curStr.classList.add('activeString');
        curStr.querySelector('input[type="text"]').focus();
    }*/

    get_targetStringObj(target) {                             //***
        let strid = '';
        let el = target;
        while(el.tagName !== 'TR'){
            el = el.parentNode;
        }
        strid = el.getAttribute('data-strId');
        console.log(strid);
        return {
            strId   : Number(strid),
            str     : el
        }
    }
    get_stringType(str) {
        let type = str.lastElementChild.dataset.type;
        console.log('get_stringType ' + type);
        return type.split('(')[0];
    }

    set_stringType(str, typeCode, typeText) {
        let td = str.lastChild;
        td.dataset.type = typeCode;
        td.textContent = typeText;
    }

    changeString(target) {
        this.activeString_off();
        let strObj = this.get_targetStringObj(target);
        let newStrId = strObj.strId;
        let curStr = strObj.str;
        this.activeString_on(curStr);
        return newStrId;
    }


}

class FuncPanel{
    funcContainer_dom;
    tablesContainer_dom;
    newTableButton_dom;
    renameTableButton_dom;
    deleteTableButton_dom;
    saveTablesButton_dom;
    
    constructor() {
        this.funcContainer_dom = document.querySelector('.funcContainer');
        this.tablesContainer_dom = document.querySelector('.tablesContainer');
        this.newTableButton_dom = this.tablesContainer_dom.querySelector('#newTableButton');
        this.renameTableButton_dom = this.tablesContainer_dom.querySelector('#renameTableButton');
        this.deleteTableButton_dom = this.tablesContainer_dom.querySelector('#deleteTableButton');
        this.saveTablesButton_dom = this.tablesContainer_dom.querySelector('#saveTablesButton');
    }
    addTableTile(tableId) {
        let p = document.createElement('p');
        //p.innerText = 'Таблица ' + tableId;
        let newEl = document.createElement('div');
        newEl.setAttribute('class','table');
        newEl.setAttribute('data-tableListId', String(tableId));
        newEl.innerText = 'Таблица ' + tableId;
        //newEl.append(p);
        newEl.classList.add("activeTable");
        this.tablesContainer_dom.append(newEl);
        return newEl;
    }
    deleteTableTile(currentTile) {
        currentTile.remove();
    }
    activeTable_on(currentTile){
        currentTile.classList.add("activeTable");
    }
    activeTable_off(currentTile){
        if(currentTile) {
            currentTile.classList.remove("activeTable");
        }
    }
    get_tableTile(tableId) {
        return this.tablesContainer_dom.querySelector('div[data-tablelistid="'+tableId+'"]');
    }

}

class ContextMenu {
    contextMenu_dom;
    constructor() {
        this.contextMenu_dom = document.querySelector('.context-menu');
    }
    positionContextMenu(event){
        this.contextMenu_dom.style.left = event.pageX + 'px';
        this.contextMenu_dom.style.top = event.pageY + 'px';
    }
    toggleContextMenu_on(state){
        let newState = false;
        if(!state) {
            this.contextMenu_dom.classList.add('context-menu--active');
            newState = true;
        }
        return newState;
    }
    toggleContextMenu_off(state){
        let newState = true;
        if (state){
            this.contextMenu_dom.classList.remove('context-menu--active');
            newState = false;
        }
        return newState;
    }
}

class TypesWindow {
    typesWindow_dom;
    substrate_dom;
    constructor() {
        this.typesWindow_dom = document.querySelector('#typeWindow');
        this.substrate_dom = document.querySelector('#substrate');
    }

    typesWindow_on() {
        this.typesWindow_dom.classList.add('overlay-on');
        this.substrate_dom.classList.add('substrate-on');
    }
    firstStateType(type, limit) {
        console.log('firstState   ' + type);
        let establishedTypeStr = this.typesWindow_dom.querySelector('tr[data-typeCode="' + type + '"]');
        console.log(establishedTypeStr);
        if(limit) {
            establishedTypeStr.lastElementChild.lastElementChild.value = Number(limit);
        }
        this.pressedTypeEffect_on(establishedTypeStr);
        //establishedTypeStr.classList.add('pressed');
        return establishedTypeStr;
    }
    pressedTypeEffect_on(str) {
        str.classList.add('pressed');
       /* let limitInput = str.lastElementChild.lastElementChild;
        if(limitInput) {
            limitInput.focus();
        }*/

        /*console.log('pressedTypeEff    ');
        let str = this.getTargetStr(target);
        str.classList.add('pressed');
        let limitInput = str.lastElementChild.lastElementChild;
        if(limitInput) {
            limitInput.focus();
        }*/
    }
    pressedTypeEffect_off(str) {
        str.classList.remove('pressed');
        /*let pressedStr = this.typesWindow_dom.querySelector('.pressed');
        if(pressedStr) {
            pressedStr.classList.remove('pressed');
            //pressedStr.lastElementChild.lastElementChild.value = '';
        }*/
    }
    typesWindow_off(eventSourceStr) {
        this.typesWindow_dom.classList.remove('overlay-on');
        this.substrate_dom.classList.remove('substrate-on');
        eventSourceStr.querySelector('input[type="text"]').focus();
        //this.pressedTypeEffect_off();
    }

    getTargetStr(target) {
        let str = target;
        while(str.tagName !== 'TR') {
            str = str.parentElement;
        }
        return str;
    }

    getLimit(str) {
        let input = str.lastElementChild.lastElementChild;
        if(input) {
            return input.value;
        }else{
            return null;
        }
    }
    buildTypeCode(str, Types) {
        let typeObj = {
            typeCode    : null,
            typeText    : null
        };
        let type = str.dataset.typecode;
        let limit = this.getLimit(str);
        typeObj.typeCode = type;

        if (limit) {
            typeObj.typeCode += `(${limit})`;
        }
        typeObj.typeText = Types[type];
        console.log('BUILDTYPECODE'+typeObj.typeCode + '  ' + typeObj.typeText);
        return typeObj;
    }
}
