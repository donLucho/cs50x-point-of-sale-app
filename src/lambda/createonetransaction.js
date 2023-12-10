// =============================================
// IMPORT each CONNECTION OBJECT and MODEL(s)
// =============================================
// const { Transaction , sequelize } = require('../database-split-components/models/transaction.model');
const { Transaction } = require('../database-split-components/models/transaction.model');
const { Inventory } = require('../database-split-components/models/inventory.model');

// =============================================
// BASE SETUP
// =============================================
// const { fn } = require("sequelize");
const { Op , fn } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
// const async = require("async");
const {forEachOf} = require("async");

// =============================================
// START LAMBDA FUNCTION
// =============================================

exports.handler = async (event, context, callback) => {

  let simonsays;
  
  if (event.httpMethod !== "POST") {
    const netlifyresponseobject = {
      statusCode: 405 , 
      body: JSON.stringify( { errormessage: "Method Not Allowed" } )
    };
    simonsays = netlifyresponseobject;
    return simonsays;
  }

  const decrementInventory = async (arrItems) => {
    
    await console.log( "decrementInventory arrItems", await arrItems );

    let cbFunk = async ( purchasedItem, idx, callback ) => { 
        
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
        
        // if (await itemInStock === null){
        //   console.log( '\n\n' , 'Not found!');
        // }
        
        if (await itemInStock !== null) {
          
          try{
            
            // await console.log( '\n\n' , 'await itemInStock', await itemInStock);
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

              let updatedinventory = await Inventory.update( await updatedQuantity , await optionsPm ); // on a lark...
              // let updatedinventory = await itemInStock.update( await updatedQuantity , await optionsPm ); // lkgc
              await console.log("await updatedinventory: " , await updatedinventory );
              
              return await updatedinventory;
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
    };
    
    let errorFunk = async (err) => {
      if (err) {
        console.error( '\n\n' , "err: " , err );
        // console.error( '\n\n' , "err.message: " , err.message );
      }
    };
    
    return await forEachOf( await arrItems, await cbFunk , await errorFunk ); // END async.forEachOf()

  }; // END decrementInventory
  

  try{
    
    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    let { id, date, total, items, tax } = await JSON.parse( event.body );

    const newTransaction = { 
      id: fn( 'UUID_TO_BIN' , await id ) , 
      date: await date , 
      total: await total , 
      items: await items , 
      tax: await tax , 
    };    
    // await console.log("\n newTransaction", await newTransaction );

    // const transaction = await Transaction.create( await newTransaction );

    const transaction = await Transaction.create( await newTransaction )
    .then( record => {
      // console.log( "record", record );
      return record;
    })
    .catch((error) => {
      console.error("error" , error );
    });
    // .finally(() => {
    //   sequelize.close();
    // });

    // await console.log("await transaction: " , await transaction );
    // await console.log("await transaction instanceof Transaction" , await transaction instanceof Transaction );
    
    // NEW
    if( await transaction.items !== undefined ){
      await decrementInventory( await JSON.parse( transaction.items ) );
    }

    const netlifyresponseobject = {
      statusCode: 200 ,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
      body: JSON.stringify( { msg: await "New record has been added" } )
    };
    simonsays = await netlifyresponseobject;

    return simonsays;
  }
  catch(err){
    console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { message: err.message } )
    };
    return netlifyresponseerror;
  }
};

// =============================================
// END LAMBDA FUNCTION
// =============================================
