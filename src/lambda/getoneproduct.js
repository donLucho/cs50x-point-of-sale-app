// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { Inventory } = require('../database-split-components/models/inventory.model');

// =============================================
// BASE SETUP
// =============================================
const { where , fn , col } = require("sequelize");

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
    
    const eventpath = await event.path; 
    //  '/blablabla/5df7bb1df9fcd64c19442e95'
    
    const ar_new_eventpath = await eventpath.split( '/' ); 
    // await console.log( "ar_new_eventpath" , await ar_new_eventpath ); // Array(3) [ "", "getOneTodo", "5df7bb1df9fcd64c19442e95" ]
    
    const id = await ar_new_eventpath[ ar_new_eventpath.length-1 ];

    const findOneCurrentParam = {
      attributes : {
        include: [ [ fn( 'BIN_TO_UUID' , col('id'), ) , 'id' ] , 'name', 'price', 'quantity' ] 
      } ,     
      raw: true , // NO MORE dataValues
      where: {
        id: fn( 'UUID_TO_BIN' , await id )
      }
    };

    const product = await Inventory.findOne( await findOneCurrentParam );
    // await console.log( 'await product: ', await product );
    // await console.log("await product === null" , await product === null );
    // await console.log("await product !== null" , await product !== null );

    if(await product === null){
      const netlifyresponseerror = {
        statusCode: 200 , // statusCode: 404, 
        body: JSON.stringify( { errormessage : await "Product not found." } ) // Not found
      };      
      simonsays = await netlifyresponseerror;
    }
    else 
    if(await product !== null){
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await product ) ,
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
