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
  Op, 
  fn, 
  col, 
  where,
} = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const { v1 } = require("uuid");



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
  console.log("Connection has been successfully established.\n\n");
})
.catch((error) => {
  console.error("Unable to connect to DB: \n\n" , error );
});

// =============================================
// MODEL SCHEMA - EVENTS
// =============================================

// console.log( "Transaction model, standing-by!!!\n\n" );

const Transaction = sequelize.define( 
    
    "transaction" , 

    {
      id: {
        type: DataTypes.STRING.BINARY ,
        defaultValue: fn( 'UUID_TO_BIN' , v1() ) , 
        primaryKey: true ,
        allowNull: false ,
        unique: true ,
      } ,  

      date: {
        type: DataTypes.DATE , 
        allowNull: false ,  
        defaultValue: DataTypes.NOW ,  // This way the current date/time will be used to populate this column (at the moment of insertion)
      } , 
      
      total: {
        type: DataTypes.FLOAT(4) , 
        allowNull: true , 
        defaultValue: null , 
      } , 

      items: {
        type: DataTypes.TEXT , 
        allowNull: true , 
        defaultValue: null , 
      } , 
      
      tax: {
        type: DataTypes.FLOAT(4) , 
        allowNull: true , 
        defaultValue: null , 
      } , 

    }  , 
    
    { 
      tableName: "transactions" 
    }
);



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

  }

  try{
    
    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    const eventpath = await event.path; //  '/blablabla/5df7bb1df9fcd64c19442e95'
    const ar_new_eventpath = await eventpath.split( '/' ); 
    // await console.log( "ar_new_eventpath" , await ar_new_eventpath ); // Array(3) [ "", "getOneTodo", "5df7bb1df9fcd64c19442e95" ]
    const id = await ar_new_eventpath[ ar_new_eventpath.length-1 ];

    const findParam = {
      attributes : {
        include: [ [ fn( 'BIN_TO_UUID' , col('id'), ) , 'id' ] , 'date' , 'total', 'items', 'tax' ] 
      } ,     
      raw: true , // NO MORE dataValues
      where: {
        id: fn( 'UUID_TO_BIN' , await id )
      }
    };

    const rawTransaction = await Transaction.findOne( await findParam );
    // await console.log( 'await rawTransaction: ', await rawTransaction );

    if(await rawTransaction === null){

      const netlifyresponseerror = {
        statusCode: 404, 
        body: JSON.stringify( { errormessage : await "Product not found." } ) // Not found
      };
      
      simonsays = await netlifyresponseerror; 
    }
    else 
    if(await rawTransaction !== null){
      
      var shallowcopy = Object.assign( {} , await {...rawTransaction } , { items: await JSON.parse( rawTransaction.items ) } ); 

      const netlifyresponseobject = {
        statusCode: 200 ,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
        body: JSON.stringify( await shallowcopy ) ,
      };
      simonsays = await netlifyresponseobject;

    }

    return simonsays;
  }
  catch(err){
    // console.log( 'response err catch: \n\n', JSON.stringify( err, null, 2 ) ); // console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { message: err.message } )
    };
    return netlifyresponseerror;
  }
};

// =============================================
// END LAMBDA FUNCTION
// =============================================
