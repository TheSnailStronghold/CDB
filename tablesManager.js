"use strict";

class TableEntity {
    //storage for table
    tableData;

    tableID;
    tableName;
    stringAmount;
    //maxFilledStringId;
    useableStrId;


    constructor(id){
        this.tableData = {};
        this.tableID = id;
        this.stringAmount = 0;
        this.tableName = 'Таблица ' + id;
        this.tableData.columns = {};
        //this.tableData.primaryKeys = {};
        this.tableData.primaryKeys = new Set();
        this.tableData.foreignKeys = [];

        //this.maxFilledStringId = 1;
        this.useableStrId = 1;
    }
    strAccounting() {
        console.log('getuseablestrid');
        let strId = this.useableStrId;
        this.useableStrId++;
        this.stringAmount++;
        return strId;
    }
    cancelString(){
        this.useableStrId--;
        this.stringAmount--;
    }
    //
    // TODO данная функция каждый раз перезаписывает значение и тип. Добавить отслеживание изменений в строке при работе и
    //и функции для изменения конкретного параметра
    rememberString(strId, data, type){
        if(this.tableData.columns.hasOwnProperty(strId)){
            this.tableData.columns[strId].columnName = data
            this.tableData.columns[strId].type = type;
        }else{
            let obj = {};
            obj.columnName = data;
            obj.type = 'varchar(255)';              //default value
            this.tableData.columns[strId] = obj;
        }

    }

    /**
     * удаление или добавление ключа
     * @param strId идентификатор ключа
     * @param flag  сигнал к удалению или добавлению ключа
     */
    togglePrimaryKey(strId, flag) {
        if(flag){
            this.tableData.primaryKeys.add(Number(strId));
        }else{
            this.tableData.primaryKeys.delete(strId);
        }
    }

    rememberColumnName(strId, data) {
        let newStrId = strId;
        if(strId == 0.5) {
            newStrId = this.strAccounting();
            let obj = {};
            obj.columnName = data;
            this.tableData.columns[newStrId] = obj;
        }else{
            if(this.tableData.columns[strId].columnName !== data){
                this.tableData.columns[strId].columnName = data;
            }
        }
        return newStrId;
    }
    rememberType(strId, data) {
        this.tableData.columns[strId].type = data;
    }

    /**
     * удаление строки из таблицы
     * @param strId идентификатор строки на удаление
     */
    deleteRow(strId) {
        if(strId in this.tableData.columns) {
            delete this.tableData.columns[strId];
            this.stringAmount--;
            if(this.tableData.primaryKeys.has(Number(strId))) {
                this.tableData.primaryKeys.delete(strId);
            }
        }
    }

}

class TablesManager {
    //storage for tables contains specimens of TableEntity
    tablesList;

    tablesAmount;
    currentTableId;
    useableTableId;

    constructor(json) {
        if(json) {

        }else{
            this.tablesList = {};
            this.tablesAmount = 0
            this.currentTableId = 0;
            this.useableTableId = 1;
        }
    }
    createTable() {
        //TODO add call function - clean tablespace and fill tablespace
        let table  = new TableEntity(this.useableTableId);
        this.currentTableId = this.useableTableId;
        this.useableTableId++;
        this.tablesList[this.currentTableId] = table;
        //move in event onload
        //this.addElToTableList();
        //TableSpace.setFirstStringId(1);
        //CurrentState.strId = 1;
        //CurrentState.activeString_on(1);
        this.tablesAmount++;
        return this.currentTableId;
    }
    deleteTable(tableId) {
        delete this.tablesList[tableId];
        this.tablesAmount--;
    }
    renameTable(tableId, newName) {
        this.tablesList[tableId].tableName = newName;
    }
    rememberColumnName(tableId, strId, data) {
        return this.tablesList[tableId].rememberColumnName(strId, data);
    }
    rememberType(tableId, strId, data) {
        this.tablesList[tableId].rememberType(strId, data);
    }
    togglePrimaryKey(tableId, strId, flag) {
        this.tablesList[tableId].togglePrimaryKey(strId, flag);
    }
    deleteRow(tableId, strId) {
        this.tablesList[tableId].deleteRow(strId);
    }

    deleteSpaces(str) {
        return str.replace(new RegExp(" ",'g'),"_");
    }

    parseObjToJSON() {
        let res_json = '[';
        let json;
        let IndexedDbTables = new Array();
        for(let tableId in this.tablesList) {
            let curTable = this.tablesList[tableId];
            if(res_json!='[') res_json += ',';
            let tableObj = {};
            tableObj.columns = [];
            tableObj.primaryKeys = [];
            //tableObj.foreignKeys = [];
            tableObj.name = this.deleteSpaces(curTable.tableName);
            tableObj.tableId = curTable.tableID;
            for(let strId in curTable.tableData.columns) {
                let columnObj = {};
                columnObj.columnName = this.deleteSpaces(curTable.tableData.columns[strId].columnName);
                columnObj.type = curTable.tableData.columns[strId].type;
                tableObj.columns.push(columnObj);
            }
            for(let pkId of curTable.tableData.primaryKeys) {
                let pkObj = {};
                pkObj.key = this.deleteSpaces(curTable.tableData.columns[pkId].columnName);
                tableObj.primaryKeys.push(pkObj);
            }
            //TODO parse foreign keys
            json = JSON.stringify(tableObj);
            IndexedDbTables.push(json);
            res_json = res_json + json;
        }
        res_json += ']';
        StoreTables(IndexedDbTables);
        console.log(res_json);
        return res_json;
    }

}
