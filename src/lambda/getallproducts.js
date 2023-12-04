// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { Inventory } = require('../database-split-components/models/inventory.model');

// =============================================
// BASE SETUP
// =============================================
const { fn , col } = require("sequelize");

// =============================================
// LAMBDA FUNCTION
// =============================================
exports.handler = async (event, context, callback) => {

  let simonsays;
  
  if (event.httpMethod !== "GET") { // only GET
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
    
    const findAllOptions = { 
      attributes: {
        include: [ 
          [ fn( 'BIN_TO_UUID' , col('id'), ) , 'id' ] ,
          'name', 
          'price', 
          'quantity', 
        ] ,
      } , 
    };

    const products = await Inventory.findAll( await findAllOptions );
    // await console.log( 'await products: ', await products );
    // await console.log("await products === undefined" , await products === undefined );
    // await console.log("await products !== undefined" , await products !== undefined );

    // #####################
    // if [products === undefined] / PRODUCTS NOT FOUND
    // #####################

    if( await products === undefined ){
      const netlifyresponseerror = {
        statusCode: await 400 ,
        body: JSON.stringify( { errormessage : await "Inventory SNAFU occurred!" } ) 
      };
      simonsays = await netlifyresponseerror; 
    }

    // #####################
    // if [products !== undefined] / PRODUCTS FOUND
    // #####################

    if( await products !== undefined ){
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await products ) ,
      };
      simonsays = await netlifyresponseobject;
    }

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
