
// =============================================
// ENV VARS SETUP 
// =============================================
// const dotenv = require('dotenv');
// dotenv.config();

// =============================================
// process.env SETUP
// =============================================
const { 
  // ---------------------------- universal
  JWT_SECRET , 
  // CA_CERT , 
  
  // ---------------------------- polyscale
  POLYSCALE_AIVENDB_CONNECTION_URI , 
  POLYSCALE_AIVENDB_PORT , 
  POLYSCALE_AIVENDB_DATABASE , 
  POLYSCALE_AIVENDB_USERNAME , 
  POLYSCALE_AIVENDB_PASSWORD , 
  DB_URL , 
  
  // ---------------------------- aiven
  CUSTOM_AIVEN_CONNECTION_URI , 
  CUSTOM_AIVEN_DB_PORT , 
  CUSTOM_AIVEN_DB_NAME , 
  CUSTOM_AIVEN_DB_USER , 
  CUSTOM_AIVEN_DB_PDUB , 
  CUSTOM_AIVEN_DB_URL , 
} = process.env;

// =============================================
// process - EXTRA!!! EXTRA!!! 
// =============================================
// console.log('ABC123',process);

// =============================================
// BASE SETUP
// =============================================
const { Sequelize } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
// const mysql2 = require("mysql2"); 

// =============================================
// DATABASE SETUP AND CONFIG
// =============================================

// #1/4 WHEN .env is REMOVED... it PRODUCES >>> ConnectionError [SequelizeConnectionError]: connect ETIMEDOUT

/*
const configObjPolyscale1 = {
  
  // username: POLYSCALE_AIVENDB_USERNAME ,
  // password: POLYSCALE_AIVENDB_PASSWORD ,
  // database: POLYSCALE_AIVENDB_DATABASE ,

  ssl: (DB_URL !== 'localhost') ? true : undefined ,  // UNCOMMENTED
  dialect: 'mysql',   
  dialectModule: require("mysql2") ,
  
  // logging: false ,
  // logging: console.log , 
  
  dialectOptions: { // Your mysql2 options here
    
    host: DB_URL ,
    port: parseInt(POLYSCALE_AIVENDB_PORT, 10) , 

    // user: POLYSCALE_AIVENDB_USERNAME , 
    // password: POLYSCALE_AIVENDB_PASSWORD , 
    // database: POLYSCALE_AIVENDB_DATABASE , 

    // WHETHER options.ssl is undefined or set to true while options.dialectOptions.ssl is not configured,
    // then, the outcome MAY BE >>> AccessDeniedError [SequelizeAccessDeniedError]: Access denied for user '<username>'@'<some_ip_address>' (using password: YES)

    ssl: {

      // WHETHER --offline OR NOT, whether rejectUnauthorized set to either true or false has no impact
      rejectUnauthorized: (DB_URL !== 'localhost') ? true : false , // switchback to true!!!
      // rejectUnauthorized: false , 

      // ca PRODUCES >>> ConnectionError [SequelizeConnectionError]: unable to get local issuer certificate
      // ca: (DB_URL !== 'localhost') ? CA_CERT.replace(/\\n/g, "\n") : null , 
    } , 
    
  } , 
  define: {
    timestamps: false
  },
};
const sequelize = new Sequelize( POLYSCALE_AIVENDB_DATABASE, POLYSCALE_AIVENDB_USERNAME, POLYSCALE_AIVENDB_PASSWORD, configObjPolyscale1 ); 
*/

// #2/4 WHEN .env is REMOVED... it PRODUCES >>> ConnectionError [SequelizeConnectionError]: connect ETIMEDOUT

/*
const configObjPolyscale2 = {
  
  username: POLYSCALE_AIVENDB_USERNAME ,
  password: POLYSCALE_AIVENDB_PASSWORD ,
  database: POLYSCALE_AIVENDB_DATABASE ,
  
  ssl: (DB_URL !== 'localhost') ? true : undefined , // UNCOMMENTED
  dialect: 'mysql', 
  dialectModule: require("mysql2") , 

  // logging: false ,
  // logging: console.log , 

  dialectOptions: { // Your mysql2 options here

    host: DB_URL ,
    port: parseInt(POLYSCALE_AIVENDB_PORT, 10) , 
    
    user: POLYSCALE_AIVENDB_USERNAME , 
    password: POLYSCALE_AIVENDB_PASSWORD , 
    database: POLYSCALE_AIVENDB_DATABASE , 
    
    // WHETHER options.ssl is undefined or set to true while options.dialectOptions.ssl is not configured,
    // then, the outcome MAY BE >>> AccessDeniedError [SequelizeAccessDeniedError]: Access denied for user '<username>'@'<some_ip_address>' (using password: YES)

    ssl: {

      // WHETHER --offline OR NOT, whether rejectUnauthorized set to either true or false has no impact
      rejectUnauthorized: (DB_URL !== 'localhost') ? true : false , // switchback to true!!!
      // rejectUnauthorized: false , 
      
      // ca PRODUCES >>> ConnectionError [SequelizeConnectionError]: unable to get local issuer certificate
      // ca: (DB_URL !== 'localhost') ? CA_CERT.replace(/\\n/g, "\n") : null , 
    } , 

    // insecureAuth: true , // Default value is false    // UNCOMMENT, THEN, UTILIZE
    // connectTimeout: 30000 , // Default value is 10000 // BAD IDEA
  } , 
  define: {
    timestamps: false
  },
};
const sequelize = new Sequelize(POLYSCALE_AIVENDB_CONNECTION_URI, configObjPolyscale2 );
*/

// #3/4 (WINNER!!!) WITH REMOVED .env file and with lines 5 and 6 commented (E.G. - dotenv)

/*
const configObjAiven1 = {  
  
  // If CUSTOM_AIVEN_CONNECTION_URI = '.../defaultdb' or '.../defaultdb?ssl-mode=REQUIRED'
  // then options.database DOES NOT HAVE AN IMPACT 
  // BUT options.dialectOptions.database WILL HAVE AN IMPACT

  // database: CUSTOM_AIVEN_DB_NAME , 
  
  // WHETHER --offline OR NOT, ssl HAS NO impact whether on or off
  ssl: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? true : undefined ,  // UNCOMMENTED
  
  dialect: 'mysql', 

  // if NOT --offline , WHETHER OR NOT dialectModule IS SET at all, so far has NO IMPACT
  // in production, this line has to be uncommented
  dialectModule: require("mysql2") , 

  // logging: console.log , 
  // logging: false ,
  
  dialectOptions: { // Your mysql2 options here

    host: CUSTOM_AIVEN_DB_URL ,
    port: parseInt(CUSTOM_AIVEN_DB_PORT, 10) , // port: parseInt(DB_PORT, 10) , 
    
    // WHETHER these (3) are SET or UNSET... ACTUALLY IS YET TBD (originally uncommented)
    // user: CUSTOM_AIVEN_DB_USER , 
    // password: CUSTOM_AIVEN_DB_PDUB , 

    // If CUSTOM_AIVEN_CONNECTION_URI = '.../Cs50x_pos_dev' or '.../Cs50x_pos_dev?ssl-mode=REQUIRED'
    // then database CAN to be UNSET given that user\username and password are buried in CUSTOM_AIVEN_CONNECTION_URI

    // But, if CUSTOM_AIVEN_CONNECTION_URI = '.../defaultdb' or '.../defaultdb?ssl-mode=REQUIRED'
    // then database HAS to be SET given that user\username and password are buried in CUSTOM_AIVEN_CONNECTION_URI
    database: CUSTOM_AIVEN_DB_NAME , 
    
    ssl: {
      
      // WHETHER --offline OR NOT, if rejectUnauthorized IS NOT SET EXPLICITLY TO false, 
      // e.g. rejectUnauthorized: false 
      // PRODUCES >>> ConnectionError [SequelizeConnectionError]: self-signed certificate in certificate chain
      // rejectUnauthorized: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? true : false ,
      rejectUnauthorized: false , 

      // WHETHER ca is SET or UNSET HAS NO impact AT ALL
      // ca: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? CA_CERT.replace(/\\n/g, "\n") : null , 
      // ca: CA_CERT.replace(/\\n/g, "\n") ,
    } ,

    // insecureAuth: true , // Default value is false    // UNCOMMENT, THEN, UTILIZE
    // connectTimeout: 30000 , // Default value is 10000 // BAD IDEA
  } , 
  define: {
    timestamps: false
  },
};
const sequelize = new Sequelize(CUSTOM_AIVEN_CONNECTION_URI, configObjAiven1 );
*/

// #4/4 (WINNER!!!) WITH REMOVED .env file and with lines 5 and 6 commented (E.G. - dotenv)

const configObjAiven2 = {
  
  // WHETHER --offline OR NOT, ssl HAS NO impact whether on or off
  // ssl: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? true : undefined ,  // UNCOMMENTED

  dialect: 'mysql', 

  // if NOT --offline , WHETHER OR NOT dialectModule IS SET at all, so far has NO IMPACT
  // in production, this line has to be uncommented
  dialectModule: require("mysql2") , 

  // logging: console.log , 
  // logging: false ,
  
  dialectOptions: { // Your mysql2 options here

    host: CUSTOM_AIVEN_DB_URL ,
    port: parseInt(CUSTOM_AIVEN_DB_PORT, 10) , 
    
    // WHETHER these (3) are SET or UNSET... ACTUALLY IS YET TBD (originally uncommented)
    // user: CUSTOM_AIVEN_DB_USER , 
    // password: CUSTOM_AIVEN_DB_PDUB , 
    // database: CUSTOM_AIVEN_DB_NAME , 

    ssl: {
      
      // WHETHER --offline OR NOT, if rejectUnauthorized IS NOT SET EXPLICITLY TO false, 
      // e.g. rejectUnauthorized: false 
      // PRODUCES >>> ConnectionError [SequelizeConnectionError]: self-signed certificate in certificate chain
      // rejectUnauthorized: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? true : false ,
      rejectUnauthorized: false , 
      
      // WHETHER ca is SET or UNSET HAS NO impact AT ALL
      // ca: (CUSTOM_AIVEN_DB_URL !== 'localhost') ? CA_CERT.replace(/\\n/g, "\n") : null , 
      // ca: CA_CERT.replace(/\\n/g, "\n") ,
    } ,
  } , 
  define: {
    timestamps: false
  },
};
const sequelize = new Sequelize( CUSTOM_AIVEN_DB_NAME, CUSTOM_AIVEN_DB_USER, CUSTOM_AIVEN_DB_PDUB, configObjAiven2 );

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
// EXPORT SEQUELIZE CONNECTION
// =============================================
export { sequelize, JWT_SECRET };
