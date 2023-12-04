// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { Inventory } = require('../database-split-components/models/inventory.model');

// =============================================
// BASE SETUP
// =============================================
const { Op, fn } = require("sequelize");

// =============================================
// LAMBDA FUNCTION
// =============================================
exports.handler = async (event, context, callback) => {

  let simonsays;
  
  if (event.httpMethod !== "PUT") { // only PUT
    const netlifyresponseobject = {
      statusCode: 405 , 
      body: JSON.stringify( { errormessage: "Method Not Allowed" } )
    };
    simonsays = netlifyresponseobject;
  }

  try{

    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    let { id, name, quantity, price } = await JSON.parse( event.body );

    const existingproduct = { 
      name: await name , 
      quantity: await quantity ,
      price: await price ,
    };
    // await console.log("\n existingproduct", await existingproduct );

    const findParam = {
      where: {
        id: fn( 'UUID_TO_BIN' , await id )
      }
    };

    let product = await Inventory.findOne( await findParam );

    if(await product === null){
      const netlifyresponseerror = {
        statusCode: 200 , // statusCode: 404, 
        body: JSON.stringify( { errormessage : await "Product not found." } ) // Not found
      };      
      simonsays = await netlifyresponseerror; 
    }
    else 
    if(await product !== null){

      var optionsPm = {
        where: {
          id: { 
            [Op.eq]: fn( 'UUID_TO_BIN' , await product.id ) 
          }
        } 
      };
      
      let updatedproduct = product.update( await existingproduct , await optionsPm );
      // await console.log("await updatedproduct: " , await updatedproduct );
      // await console.log("await updatedproduct instanceof Inventory" , await updatedproduct instanceof Inventory );

      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await updatedproduct ) ,
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
