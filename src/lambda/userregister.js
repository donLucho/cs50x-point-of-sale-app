// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { User , sequelize } = require('../database-split-components/models/user.model');

// =============================================
// LAMBDA FUNCTION
// =============================================
exports.handler = async (event, context, callback) => {
  
  // console.log( "event", event );
  // console.log( "context", context ); // { clientContext: {} }
  // console.log( "callback", callback );

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

    let { username , email , password } = await JSON.parse( event.body );
    const newuserpromise = await User.create( await { username , email , password } );
    // await console.log("await newuserpromise: " , await newuserpromise );
    // await console.log("await newuserpromise instanceof User" , await newuserpromise instanceof User );

    // #####################
    // if [newuserpromise instanceof User === false] / NEWUSER NOT CREATED
    // #####################

    if( await newuserpromise === undefined || await newuserpromise instanceof User === false ){
      const netlifyresponseerror = {
        statusCode: await 400 ,
        body: JSON.stringify( { errormessage : await "Registration SNAFU occurred!" } ) 
      };
      simonsays = await netlifyresponseerror; 
    }

    // #####################
    // if [newuserpromise instanceof User === true ] / NEWUSER CREATED
    // #####################

    if( await newuserpromise !== undefined && await newuserpromise instanceof User === true ){
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( { msg: "User has been added" } )
      };
      // await console.log( "await netlifyresponseobject" , await netlifyresponseobject );
      simonsays = await netlifyresponseobject; 
    }
    return simonsays;
  }
  catch(err){
    // console.log( 'user register err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { errormessage : "Internal Error -- problem in posting data."} ) , 
    };
    return netlifyresponseerror;
  }
  // finally{
  //   sequelize.close();
  // }
};

// 2020 - Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// 2023 - Docs on event and context - https://docs.netlify.com/functions/get-started/?fn-language=js#route-requests-2
// 2023 - Synchronous function format - https://docs.netlify.com/functions/lambda-compatibility/?fn-language=js