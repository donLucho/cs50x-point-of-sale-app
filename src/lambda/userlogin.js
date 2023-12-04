// =============================================
// IMPORT each MODEL and CONNECTION OBJECT
// =============================================
const { User , JWT_SECRET , sequelize } = require('../database-split-components/models/user.model');

// =============================================
// BASE SETUP
// =============================================
const { Op } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// =============================================
// HELPER FUNCTIONS FOR USE WITH MAIN LAMBDA FUNCTION
// =============================================
async function getUser( email ){
  return Promise.resolve( await User.findOne(  { where: { email: { [Op.eq]: await email } } } ) );
}

async function getBcryptComparison( password, hash, bcrypt ){
  return Promise.resolve( bcrypt.compare( password , hash )  );
}

async function getJwtToken( jwt, secret , user ){
  let params = { user: await user };
  let finerdetails = await { expiresIn: '1h' };
  return Promise.resolve( await jwt.sign( await params, await secret, await finerdetails ) );
}

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
    sequelize.close();
    return simonsays;
  }

  try{
    
    let userData = JSON.parse( await event.body );
    // await console.log( 'await userData: ', await userData ); 

    let { email , password } = await userData; 
    // await console.log( 'await email: ', await email ); 
    // await console.log( 'await password: ', await password );

    const userpromise = await getUser( await email )
    .then( user => {
      // console.log( "user", user );
      return user;
    })
    .catch((error) => {
      console.error("error" , error );
    });
    // .finally(() => {
    //   sequelize.close();
    // });

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

      // await console.log("if userpromise...");
      // await console.log("await password", await password);
      // await console.log("await userpromise.password: " , await userpromise.password );
      
      let comparisonpromise = await getBcryptComparison( await password , await userpromise.password , await bcrypt )
      .then( comparison => {
        // console.log( "comparison", comparison );
        return comparison;
      })
      .catch((error) => {
        console.error("error" , error );
      });
      // .finally(() => {
      //   sequelize.close();
      // });
      
      // await console.log( "await comparisonpromise" , await comparisonpromise );

      if( await comparisonpromise === false ){
        const netlifyresponseerror = {
          statusCode: await 404, 
          body: JSON.stringify( { errormessage : await "Invalid Password. Try again!" } ) // Not found
        };
        simonsays = await netlifyresponseerror; 
      }

      if( await comparisonpromise === true ){
        
        // await console.log("In the process of getting a signed token >>>>> ");

        let token = await getJwtToken( await jwt, await JWT_SECRET, await userpromise )
        .then( token => {
          // console.log( "token", token );
          return token;
        })
        .catch((error) => {
          console.error("error" , error );
        });
        // .finally(() => {
        //   sequelize.close();
        // });

        if( await !token ){
          
          const netlifyresponseerror = {
            statusCode: await 400 , 
            body: JSON.stringify( { errormessage: await "jwt sign err" } )
          };
          simonsays = await netlifyresponseerror; 
        }

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
