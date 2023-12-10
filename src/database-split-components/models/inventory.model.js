// =============================================
// IMPORT SEQUELIZE CONNECTION
// =============================================
const { sequelize } = require('../connection/sequelize.db');

// =============================================
// BASE SETUP
// =============================================
// const { DataTypes , Op , fn } = require("sequelize");
const { DataTypes , fn } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");
// const async = require("async");

// =============================================
// MODEL SCHEMA - INVENTORY
// =============================================

// console.log( "Inventory model, standing-by!!!\n\n" );

const Inventory = sequelize.define( 
    
    "inventory" , 

    {      
      
      id: {        
        type: DataTypes.STRING.BINARY , 
        defaultValue: fn( 'UUID_TO_BIN' , v1() ) , 
        primaryKey: true ,
        allowNull: false ,
        unique: true ,
      } , 

      name: {
        type: DataTypes.STRING({ length: 250 }) , 
        allowNull: true , 
        defaultValue: null , 
      } , 
      
      price: {
        type: DataTypes.FLOAT(4) , 
        allowNull: true , 
        defaultValue: null , 
      } , 

      quantity: {
        type: DataTypes.INTEGER , 
        allowNull: false , 
      } , 

    }  , 
    
    { 
      tableName: "inventory" ,
    }
);

// =============================================
// EXPORT MODEL ~~ and CONNECTION OBJECT ~~
// =============================================
export { Inventory , sequelize }; 
