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
} = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// const jwt = require('jsonwebtoken');

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
// START LAMBDA FUNCTION
// =============================================

exports.handler = async (event, context, callback) => {
  
  // console.log( "event", event );
  // console.log( "context", context ); // { clientContext: {} }
  // console.log( "callback", callback );

  if (event.httpMethod !== "POST") {
    
    const netlifyresponseerror = {
      statusCode: 405
      , body: JSON.stringify( { errormessage: "Method Not Allowed" } )
    };
    
    return netlifyresponseerror;

  }

  try{

    let { username , email , password } = await JSON.parse( event.body );
    
    await User.create( await { username , email , password } )
    .then( newuser => {
      // console.log( '>>>>>> New record added: ' , newuser );
    } )
    .catch( ( err ) => {
      // console.log( `There was derrpage: \n\n` , JSON.stringify( err, null, 2 ) ); 
    } );
    

    const netlifyresponseobject = {
      statusCode: 200 ,
      // headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify( { msg: "User has been added" } )
    };
    return netlifyresponseobject;
  }
  catch(err){
    // console.log( 'user register err catch: \n\n', JSON.stringify( err, null, 2 ) ); 
    // console.log( 'user register err catch: ', err );
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

// 2020 - Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// 2023 - Docs on event and context - https://docs.netlify.com/functions/get-started/?fn-language=js#route-requests-2
// 2023 - Synchronous function format - https://docs.netlify.com/functions/lambda-compatibility/?fn-language=js
