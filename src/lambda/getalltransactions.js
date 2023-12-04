// =============================================
// IMPORT each CONNECTION OBJECT and MODEL(s)
// =============================================
const { Transaction } = require('../database-split-components/models/transaction.model');

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
          'date', 
          'total', 
          'items', 
          'tax', 
        ] ,
      } , 
    };

    const transactions = await Transaction.findAll( await findAllOptions );
    // await console.log( 'await transactions: ', await transactions );
    // await console.log("await transactions === undefined" , await transactions === undefined );
    // await console.log("await transactions !== undefined" , await transactions !== undefined );

    // #####################
    // if [transactions === undefined] / TRANSACTIONS NOT FOUND
    // #####################
    
    if( await transactions === undefined ){
      const netlifyresponseerror = {
        statusCode: await 400 ,
        body: JSON.stringify( { errormessage : await "Transactions SNAFU occurred!" } ) 
      };
      simonsays = await netlifyresponseerror; 
    }

    // #####################
    // if [transactions !== undefined] / TRANSACTIONS FOUND
    // #####################
    
    if( await transactions !== undefined ){
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await transactions ) ,
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
