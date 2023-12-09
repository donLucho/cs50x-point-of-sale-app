// =============================================
// IMPORT each CONNECTION OBJECT and MODEL(s)
// =============================================
const { Transaction , sequelize } = require('../database-split-components/models/transaction.model');
const { Inventory } = require('../database-split-components/models/inventory.model');

// =============================================
// BASE SETUP
// =============================================
const { fn } = require("sequelize");

// =============================================
// LAMBDA FUNCTION
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

    const transaction = await Transaction.create( await newTransaction )
    .then( record => {
      // console.log( "record", record );
      return record;
    })
    .catch((error) => {
      // console.error("error" , error );
    });

    // await console.log("await transaction: " , await transaction );
    // await console.log("await transaction instanceof Transaction" , await transaction instanceof Transaction );
    
    if( await transaction.items !== undefined ){
      await Inventory.decrementInventory( JSON.parse( await transaction.items ) ); 
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
    // console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { message: err.message } )
    };
    return netlifyresponseerror;
  }
};
