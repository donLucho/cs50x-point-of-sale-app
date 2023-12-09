// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { User , JWT_SECRET , sequelize } = require('../database-split-components/models/user.model');

// =============================================
// BASE SETUP
// =============================================
const { Op , where } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// =============================================
// LAMBDA FUNCTION
// =============================================
exports.handler = async (event, context, callback) => {

  // console.log( "event", event );
  // console.log( "context", context ); // { clientContext: {} }
  // console.log( "callback", callback );

  // await console.log( 'await User', await User); // users

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
    
    let userData = JSON.parse( await event.body );
    // await console.log( 'await userData: ', await userData ); 

    let { email , password } = await userData; 
    // await console.log( 'await email: ', await email ); 
    // await console.log( 'await password: ', await password );

    const userpromise = await User.findOne( { where: { email: { [Op.eq]: await email } } } );

    // await console.log("await userpromise: " , await userpromise );
    // await console.log("await userpromise instanceof User" , await userpromise instanceof User );

    // #####################
    // if [userpromise === null] / USER NOT FOUND
    // #####################
    
    if( await userpromise === null && await userpromise instanceof User === false ){

      const netlifyresponseerror = {
        statusCode: await 401 ,
        body: JSON.stringify( { errormessage : await "Invalid Email. Go register!" } ) // Unauthorized
      }; 
      simonsays = await netlifyresponseerror; 
    }


    // #####################
    // if [userpromise !== null] / USER FOUND
    // #####################

    if( await userpromise !== null && await userpromise instanceof User === true ){

      // await console.log("await password", await password);
      // await console.log("await userpromise.password: " , await userpromise.password );
      
      let comparisonpromise = await bcrypt.compare( await password , await userpromise.password );
      // await console.log( "await comparisonpromise" , await comparisonpromise );

      if( await comparisonpromise === false ){
        const netlifyresponseerror = {
          statusCode: await 404, 
          body: JSON.stringify( { errormessage : await "Invalid Password. Try again!" } ) // Not found
        };
        simonsays = await netlifyresponseerror; 
      }

      if( await comparisonpromise === true ){
        
        let params = { user: await userpromise };
        let finerdetails = await { expiresIn: '1h' };
        let token = await jwt.sign( await params, await JWT_SECRET, await finerdetails );

        if( await !token ){
          const netlifyresponseerror = {
            statusCode: await 400 , 
            body: JSON.stringify( { errormessage: await "jwt sign err" } )
          };
          simonsays = await netlifyresponseerror; 
        }

        // if( await !!token ){
        //   await console.log( "await token", await token );
        // }

        const netlifyresponseobject = {
          statusCode: 200 ,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
          body: JSON.stringify( { token: await token } ) ,
        };

        // await console.log( "await netlifyresponseobject" , await netlifyresponseobject );
        simonsays = await netlifyresponseobject;
      }
    }
    return simonsays;

  }
  catch(err){
    // console.log( 'user login err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { errormessage : "Internal Error -- problem in posting data."} ) , 
    };
    return netlifyresponseerror;
  }
};
