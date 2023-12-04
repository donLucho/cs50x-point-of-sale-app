// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { Inventory , sequelize } = require('../database-split-components/models/inventory.model');

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
    sequelize.close();
    return simonsays;
  }

  try{
    
    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    let { id, name, quantity, price } = await JSON.parse( event.body );

    var newproduct = { 
      id: fn( 'UUID_TO_BIN' , await id ) , 
      name: await name , 
      quantity: await quantity ,
      price: await price ,
    };

    // await console.log("\n newproduct", await newproduct );

    const product = await Inventory.create( await newproduct )
    .then( record => {
      // console.log( "record", record );
      return record;
    } )
    .catch( ( error ) => {
      // console.error("error" , error );
    } )
    .finally(() => {
      sequelize.close();
    });

    // await console.log("await product: " , await product );
    // await console.log("await product instanceof Inventory" , await product instanceof Inventory );

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
