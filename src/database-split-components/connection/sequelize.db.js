// SCRUBBED IN THREE (3) AREAS 
// =============================================
// ENV VARS SETUP 
// =============================================
const dotenv = require('dotenv');
dotenv.config();

// =============================================
// process.env SETUP - scrubbed (1/3)
// =============================================
const { 
  JWT_SECRET ,
  DB_URL , 
  DB_PORT , 
  DB_NAME , 
  DB_USER , 
  DB_PDUB , 
  DB_DIALECT , 
} = process.env;

// =============================================
// BASE SETUP
// =============================================
const { Sequelize } = require("sequelize");

// =============================================
// ADDITIONAL SETUP AND RELATED VARIABLES
// =============================================
const mysql2 = require("mysql2");

// =============================================
// DATABASE SETUP AND CONFIG - scrubbed (2/3)
// =============================================

const configurationObj = {
  dialect: DB_DIALECT, 
  dialectModule: mysql2 ,
  logging: false ,
  dialectOptions: { // Your mysql2 options here
    host: DB_URL ,
    port: parseInt(DB_PORT, 10) , 
    user: DB_USER ,
    password: DB_PDUB ,
    database: DB_NAME ,
  } , 
  define: {
    timestamps: false
  },
};

const sequelize = new Sequelize( DB_NAME, DB_USER, DB_PDUB, configurationObj );

// =============================================
// DATABASE CONNECTION - scrubbed (3/3)
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
