// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { User } = require('../database-split-components/models/user.model');

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
        include: [ 'id' , 'username' , 'email' , 'password' , ] ,
      } ,
    };

    const users = await User.findAll( await findAllOptions );
    // await console.log( 'await users: ', await users );
    // await console.log("await users === undefined" , await users === undefined );
    // await console.log("await users !== undefined" , await users !== undefined );

    // #####################
    // if [users === undefined] / USERS NOT FOUND
    // #####################
    
    if( await users === undefined ){
      const netlifyresponseerror = {
        statusCode: await 400 ,
        body: JSON.stringify( { errormessage : await "Users SNAFU occurred!" } ) 
      };
      simonsays = await netlifyresponseerror; 
    }

    // #####################
    // if [users !== undefined] / USERS FOUND
    // #####################
    
    if( await users !== undefined ){
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await users ) ,
      };
      simonsays = await netlifyresponseobject;
    }
    
    return simonsays;
  }
  catch(err){
    // console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { errormessage: err.message } ) ,
    };
    return netlifyresponseerror;
  }
};
