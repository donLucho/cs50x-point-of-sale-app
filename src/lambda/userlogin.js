// =============================================
// LOCAL DEVELOPMENT ENV VARS SETUP 
// if( process.env.NODE_ENV !== 'production' ){const dotenv = require('dotenv'); dotenv.config();} // overkill
// --
// UNCOMMENT FOR LOCAL TESTING
// COMMENT FOR SHIPPING 
// =============================================
const dotenv = require('dotenv');
dotenv.config();

// =============================================
// process.env SETUP
// =============================================
const { 
  JWT_SECRET ,
  DB_URL , 
  DB_PORT ,
  DB_NAME , 
  DB_USER , 
  DB_PDUB , 
  DB_DIALECT ,
  DB_PROTOCOL ,
} = process.env;

// =============================================
// BASE SETUP
// =============================================
const { 
  Sequelize ,
  DataTypes ,
  fn, 
  Op,
} = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const jwt = require('jsonwebtoken');

// =============================================
// DATABASE SETUP AND CONFIG
// "sequelize createdAt + updatedAt"
// https://stackoverflow.com/questions/20386402/sequelize-unknown-column-createdat-in-field-list
// https://sequelize.org/docs/v6/getting-started/#connecting-to-a-database
// https://sequelize.org/docs/v6/getting-started/#logging
// https://sequelize.org/docs/v6/getting-started/#tip-for-reading-the-docs
// https://sequelize.org/api/v6/class/src/sequelize.js~sequelize#instance-constructor-constructor
// =============================================

/*
// original

const configurationObj = { 
  username: DB_USER ,
  password: DB_PDUB ,
  database: DB_NAME ,
  dialect: DB_DIALECT ,
  protocol: DB_PROTOCOL ,
  port: DB_PORT ,
  host: DB_URL ,
  define: {
    timestamps: false ,
  },
};

const sequelize = new Sequelize( configurationObj );
*/

// contingency code

const configurationObj = { 
  "dialect": DB_DIALECT , 
  "protocol": DB_PROTOCOL ,
  "port": DB_PORT ,
  "host": DB_URL ,
  "define": {
    "timestamps": false
  },
  // "dialectOptions": {
  //   "multipleStatements": true
  // } // c/o https://stackoverflow.com/questions/26062532/how-can-i-run-multiple-raw-queries-with-sequelize-in-mysql
};

const sequelize = new Sequelize( DB_NAME, DB_USER, DB_PDUB, configurationObj );


// =============================================
// DATABASE CONNECTION 
// =============================================
sequelize.authenticate()
.then(() => {
  console.log("Connection has been successfully established.\n\n");
})
.catch((error) => {
  console.error("Unable to connect to DB: \n\n" , error );
});

// =============================================
// MODEL SCHEMA - USERS
// =============================================

// console.log( "User model, standing-by!!!\n\n" );

const User = sequelize.define( 
    
    "users" , 

    {
      
      id: {
        type: DataTypes.STRING.BINARY ,
        defaultValue: fn( 'UUID_TO_BIN' , v1() ) , 
        primaryKey: true , 
        allowNull: false , 
        unique: true , 
      } , 

      username: {
        type: DataTypes.STRING({ length: 150 }) , 
        allowNull: false , 
      } , 
      
      email: {
        type: DataTypes.STRING({ length: 150 }) , 
        allowNull: false , 
      } , 

      password: {
        type: DataTypes.STRING({ length: 150 }) , 
        allowNull: false , 
      } , 

    }  , 
    
    { 
      tableName: "users" , 

      hooks: {
        beforeCreate: async (user, options) => {
          if ( await user.password) {
            // console.log( "options\n\n" , await options , "\n\n" );
            // console.log( 'beforeCreate: this\n\n' , await this + '\n\n' ); // [object Object]
            // console.log( `username is: ${ await user.username}` + `\n\n`);
            const salt = await bcrypt.genSalt( await SALT_ROUNDS );
            user.password = await bcrypt.hash( await user.password , await salt );
          }
        } ,
        beforeUpdate: async (user, options) => {
          if ( await user.password) {
            const salt = await bcrypt.genSalt( await SALT_ROUNDS );
            user.password = await bcrypt.hash( await user.password , await salt );
          }
        } , 
      } , 
    } , 
);

User.prototype.comparePdub = function( plntxtpdub, cb ){
  bcrypt.compare( plntxtpdub, this.password, function( err, isMatch ){
    if( err ){ return cb(err); }    
    // cb( err, isMatch ); // generate the generic status text error from here
    cb( null, isMatch ); // generate the specific error text from the route
  } );
};
// LUCHO END

// =============================================
// HELPER FUNCTIONS FOR USE WITH MAIN LAMBDA FUNCTION
// =============================================

async function getUser( email ){
  // return Promise.resolve( User.findOne( { email: email } ) );
  return Promise.resolve( await User.findOne(  { where: { email: { [Op.eq]: await email } } } ) );
}

async function getBcryptComparison( password, hash, bcrypt ){
  // return Promise.resolve( await bcrypt.compare( await password , await hash )  );
  return Promise.resolve( bcrypt.compare( password , hash )  );
}

async function getJwtToken( jwt, secret , user ){
  let params = { user: await user };
  let finerdetails = await { expiresIn: '1h' };
  return Promise.resolve( await jwt.sign( await params, await secret, await finerdetails ) );
}

// =============================================
// START LAMBDA FUNCTION
// =============================================

exports.handler = async (event, context, callback) => {

  // console.log( "event", event );
  // console.log( "context", context ); // { clientContext: {} }
  // console.log( "callback", callback );

  let simonsays = undefined;
  
  // if (event.httpMethod !== "POST") { 
    
  //   const netlifyresponseobject = {
  //     statusCode: 405 , 
  //     body: JSON.stringify( { errormessage: "Method Not Allowed" } )
  //   };
    
  //   // return netlifyresponseobject;
  //   simonsays = netlifyresponseobject;

  // }

  try{
    
    let userData = JSON.parse( await event.body );
    // await console.log( 'await userData: ', await userData ); 

    let { email , password } = await userData; 
    // await console.log( 'await email: ', await email ); 
    // await console.log( 'await password: ', await password );

    const userpromise = await getUser( await email );
    // let userpromise = await getUser( await email );
    // await console.log("await userpromise: " , await userpromise );
    // await console.log("await userpromise instanceof User" , await userpromise instanceof User );

    // #####################
    // if [userpromise === null] / USER NOT FOUND
    // #####################
    
    if( await userpromise === null && await userpromise instanceof User === false ){

      // await console.log("if not userpromise...");

      const netlifyresponseerror = {
        statusCode: 401 ,
        body: JSON.stringify( { errormessage : await "Invalid Email. Go register!" } ) // Unauthorized
      }; 
      
      simonsays = await netlifyresponseerror; // return netlifyresponseerror;

    }


    // #####################
    // if [userpromise !== null] / USER FOUND
    // #####################

    if( await userpromise !== null && await userpromise instanceof User === true ){

      // await console.log("if userpromise...");
      // await console.log("await password", await password);
      // await console.log("await userpromise.password: " , await userpromise.password );
      
      let comparisonpromise = await getBcryptComparison( await password , await userpromise.password , await bcrypt );
      // await console.log( "await comparisonpromise" , await comparisonpromise );

      if( await comparisonpromise === false ){
        
        // await console.log("if await comparisonpromise === false...");

        const netlifyresponseerror = {
          statusCode: 404, 
          body: JSON.stringify( { errormessage : await "Invalid Password. Try again!" } ) // Not found
        };

        simonsays = await netlifyresponseerror; 
      }

      if( await comparisonpromise === true ){
        
        // await console.log("In the process of getting a signed token >>>>> ");

        let token = await getJwtToken( await jwt, await JWT_SECRET, await userpromise );
        // await console.log( "await token" , await token );

        if( await !token ){
          
          // await console.log( "jwt sign err" );

          const netlifyresponseerror = {
            statusCode: 500 , 
            body: JSON.stringify( { errormessage: await "jwt sign err" } )
          };
          
          simonsays = await netlifyresponseerror; 
        }

        const netlifyresponseobject = {
          statusCode: 200 ,
          // headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify( { token: await token } ) ,
        };

        // await console.log( "await netlifyresponseobject" , await netlifyresponseobject );

        simonsays = await netlifyresponseobject;
      }
    }
    return simonsays;

  }
  catch(err){
    // console.log( 'user login err catch: \n\n', JSON.stringify( err, null, 2 ) ); 
    // console.log( 'user login err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { errormessage : "Internal Error -- problem in posting data."} ) , 
    };
    return netlifyresponseerror;
  }
};

// =============================================
// END LAMBDA FUNCTION
// =============================================
