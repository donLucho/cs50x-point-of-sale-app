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
} = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;



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
  username: POLYSCALE_AIVENDB_USERNAME ,
  password: POLYSCALE_AIVENDB_PASSWORD ,
  database: POLYSCALE_AIVENDB_DATABASE ,
  ssl: (DB_URL !== 'localhost') ? true : false ,  
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
  console.log("Connection has been successfully established.\n\n");
})
.catch((error) => {
  console.error("Unable to connect to DB: \n\n" , error );
});
// .finally(() => {
//   sequelize.close();
// });

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


// =============================================
// START LAMBDA FUNCTION
// =============================================

exports.handler = async (event, context, callback) => {
  
  let simonsays;
  
  if (event.httpMethod !== "GET") { // only GET
    
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

    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    const findAllOptions = { 
      attributes: {
        include: [ 'id' , 'username' , 'email' , 'password' , ] ,
      } ,
    };

    // const users = await User.findAll( await findAllOptions );

    const users = await User.findAll( await findAllOptions )
    .then( records => {
      console.log( '>>>>>> records: ' , records );
      return records;
    } )
    .catch( ( err ) => {
      // console.log( `There was derrpage: \n\n` , JSON.stringify( err, null, 2 ) ); 
      console.log( `There was derrpage: \n\n` , err ); 
    } );
    // .finally(() => {
    //   console.log( "sequelize", sequelize );
    // });
    // .finally(() => {
    //   sequelize.close();
    // });

    // await console.log( 'await users: ', await users );
    // await console.log("await users === undefined" , await users === undefined );
    // await console.log("await users !== undefined" , await users !== undefined );

    // #####################
    // if [users === undefined] / USERS NOT FOUND
    // #####################
    if( await users === undefined ){
      
      const netlifyresponseerror = {
        statusCode: 405 ,
        body: JSON.stringify( { errormessage : await "Users SNAFU occurred!" } ) 
      }; 
      
      simonsays = await netlifyresponseerror; // return netlifyresponseerror;
      // sequelize.close(); // buuu!!!
    }

    // #####################
    // if [users !== undefined] / USERS FOUND
    // #####################
    if( await users !== undefined ){
      
      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await users ) ,
        // body: JSON.stringify( await [] ) ,
      };

      simonsays = await netlifyresponseobject;
      // sequelize.close(); // buuu!!!

    }

    // sequelize.close(); // buuu!!!
    return simonsays;
  }
  catch(err){
    // console.log( 'response err catch: \n\n', JSON.stringify( err, null, 2 ) ); // console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { errormessage: err.message } ) ,
    };
    return netlifyresponseerror;
  }
  // finally{
    // sequelize.close();
    // sequelize.connectionManager.close().then(() => console.log('shut down gracefully'));
  // }
};

// =============================================
// END LAMBDA FUNCTION
// =============================================
