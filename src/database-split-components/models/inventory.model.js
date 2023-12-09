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

    async ( purchasedItem, idx, callback ) => { 
      
      // await console.log( '\n\n' , "await purchasedItem", await purchasedItem );

      try {

        var findParam = {
          where: {
            id: { 
              [Op.eq]: fn( 'UUID_TO_BIN' , await purchasedItem.id ) 
            }
          } 
        };

        // console.log( '\n\n' , "findParam", findParam );

        let itemInStock = await Inventory.findOne( await findParam );
        
        if (await itemInStock === null){
          console.log( '\n\n' , 'Not found!');
        }
        
        if (await itemInStock !== null) {
          
          try{
            
            await console.log( '\n\n' , 'await itemInStock', await itemInStock);
            
            // await console.log('typeof await itemInStock.quantity', typeof await itemInStock.quantity); // number
            // await console.log('typeof await purchasedItem.quantity', typeof await purchasedItem.quantity); // number

            if( await itemInStock.quantity >= await purchasedItem.quantity ){
              
              // await console.log( '\n' , `Successfully purchased ${await purchasedItem.quantity} ${await purchasedItem.name}s!`);
              
              var optionsPm = await {
                where: {
                  id: { 
                    [Op.eq]: fn( 'UUID_TO_BIN' , await purchasedItem.id ) 
                  }
                } 
              };

              // await console.log( 'await optionsPm', await optionsPm );

              var qtyDiff = await itemInStock.quantity - await purchasedItem.quantity; 

              const updatedQuantity = await {
                quantity: await qtyDiff
              };

              // let updatedinventory = await Inventory.update( await updatedQuantity , await optionsPm ); 
              
              let updatedinventory = await itemInStock.update( await updatedQuantity , await optionsPm ); 
              await console.log("await updatedinventory: " , await updatedinventory );
              
              // return await updatedinventory;
              // return updatedinventory;

            }
            else
            if( await itemInStock.quantity < await purchasedItem.quantity ){
              await console.error('\n' ,"Cannot complete this portion of transaction");
              await console.error(`Attempted to buy ${await purchasedItem.quantity} ${await purchasedItem.name}s but there are only ${await itemInStock.quantity} available!`);
            }
          }
          catch(derrp){
            console.log( '\n\n' , "try/catch derrp", derrp );
            return callback(derrp);
          }
        }
      }
      catch(e){
        console.log( '\n\n' , "try/catch e", e );
        return callback(e);
      }
    } , 

    err => {
      if (err) {
        console.error( '\n\n' , "err: " , err );
        // console.error( '\n\n' , "err.message: " , err.message );
      }
    }

  ); // END async.forEachOf()
  

}; // END decrementInventory

// =============================================
// EXPORT MODEL ~~ and CONNECTION OBJECT ~~
// =============================================
export { Inventory , sequelize }; 
