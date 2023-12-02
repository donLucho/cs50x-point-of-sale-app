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
  POLYSCALE_AIVENDB_CONNECTION_URI,
  DB_URL , 
  POLYSCALE_AIVENDB_PORT,   
  POLYSCALE_AIVENDB_DATABASE ,
  POLYSCALE_AIVENDB_USERNAME ,
  POLYSCALE_AIVENDB_PASSWORD ,
  DB_DIALECT , 
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

const configurationObj = {
  dialect: DB_DIALECT, 
  dialectModule: require('mysql2') ,
  logging: false ,
  dialectOptions: { // Your mysql2 options here
    host: DB_URL ,
    port: parseInt(POLYSCALE_AIVENDB_PORT, 10) ,     
    user: POLYSCALE_AIVENDB_USERNAME ,
    password: POLYSCALE_AIVENDB_PASSWORD ,
    database: POLYSCALE_AIVENDB_DATABASE ,
    ssl: {
      // rejectUnauthorized: true,
      rejectUnauthorized: (DB_URL !== 'localhost') ? true : false ,
    } ,
  } , 
  define: {
    timestamps: false
  },
};

const sequelize = new Sequelize(POLYSCALE_AIVENDB_CONNECTION_URI, configurationObj );

// =============================================
// DATABASE CONNECTION 
// =============================================
sequelize.authenticate()
.then(() => {
  console.log("\n\nConnection has been successfully established.\n\n");
})
.catch((error) => {
  console.error("Unable to connect to DB: \n\n" , error );
})
.finally(() => {
  sequelize.close();
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

  let simonsays;
  
  if (event.httpMethod !== "POST") { 
    
    const netlifyresponseobject = {
      statusCode: 405 , 
      body: JSON.stringify( { errormessage: "Method Not Allowed" } )
    };
    
    // return netlifyresponseobject;
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
    })
    .finally(() => {
      sequelize.close();
    });

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
      
      let comparisonpromise = await getBcryptComparison( await password , await userpromise.password , await bcrypt )
      .then( comparison => {
        // console.log( "comparison", comparison );
        return comparison;
      })
      .catch((error) => {
        console.error("error" , error );
      })
      .finally(() => {
        sequelize.close();
      });
      
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

        let token = await getJwtToken( await jwt, await JWT_SECRET, await userpromise )
        .then( token => {
          // console.log( "token", token );
          return token;
        })
        .catch((error) => {
          console.error("error" , error );
        })
        .finally(() => {
          sequelize.close();
        });

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
