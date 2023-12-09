// =============================================
// IMPORT SEQUELIZE CONNECTION
// =============================================
const { sequelize } = require('../connection/sequelize.db');

// =============================================
// BASE SETUP
// =============================================
const { DataTypes , Op , fn } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");
const async = require("async");

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

Inventory.decrementInventory = function(arrItems){ // yeppers
  
  // console.log( "Inventory.decrementInventory arrItems", arrItems );

  async.forEachOf( 
    
    arrItems, 

    ( purchasedItem, idx, callback ) => { 
      
      // console.log( '\n\n' , "purchasedItem", purchasedItem );

      try {
        
        var queryPm = {
          where: {
            id: fn( 'UUID_TO_BIN' , purchasedItem.id )
          } 
        };

        // console.log( '\n\n' , "queryPm", queryPm );

        Inventory.findOne( queryPm )
        .then( itemInStock => {
          if (itemInStock === null) {
            console.log( '\n\n' , 'Not found!');
          } 
          else {
            return itemInStock;
          }
        } )
        .then( itemInStock => {
          try{
            
            // console.log( '\n\n' , 'itemInStock', itemInStock);

            if( itemInStock.quantity >= purchasedItem.quantity ){
              
              // console.log( '\n' , `Successfully purchased ${purchasedItem.quantity} ${purchasedItem.name}s!`);
              
              var optionsPm = {
                where: {
                  id: { 
                    [Op.eq]: fn( 'UUID_TO_BIN' , purchasedItem.id ) 
                  }
                } 
              };

              const updatedItem = {
                ...itemInStock,
                quantity: itemInStock.quantity - purchasedItem.quantity
              };

              return Inventory.update( updatedItem , optionsPm ); // correct!
              // Inventory.update( updatedItem , optionsPm );

            }
            else
            if( itemInStock.quantity < purchasedItem.quantity ){
              // console.error('\n' ,"Cannot complete this portion of transaction");
              // console.error(`Attempted to buy ${purchasedItem.quantity} ${purchasedItem.name}s but there are only ${itemInStock.quantity} available!`);
            }
          }
          catch(derrp){
            // console.log( '\n\n' , "try/catch derrp", derrp );
            return callback(derrp);
          }
          
        } )
        .catch( ( err ) => {
          // console.log( '\n\n' , `There was derrpage: ` , JSON.stringify( err, null, 2 ) );
          return callback(err);
        } );
        
      }
      catch(e){
        // console.log( '\n\n' , "try/catch e", e );
        return callback(e);
      }
    } , 

    err => {
      if (err) {
        console.error( '\n\n' , "err.message: " , err.message );
      }
    }

  ); // END async.forEachOf()
  

}; // END decrementInventory

// =============================================
// EXPORT MODEL ~~ and CONNECTION OBJECT ~~
// =============================================
export { Inventory , sequelize }; 
