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
const async = require("async");



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
})
.finally(() => {
  sequelize.close();
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
// MODEL SCHEMA - EVENTS
// =============================================

// console.log( "Inventory model, standing-by!!!\n\n" );

const Inventory = sequelize.define( 
    
    "inventory" , 

    {      
      
      id: {        
        type: DataTypes.STRING.BINARY , 
        defaultValue: fn( 'UUID_TO_BIN' , v1() ) , 
        primaryKey: true ,
        allowNull: false ,
        unique: true ,
      } , 

      name: {
        type: DataTypes.STRING({ length: 250 }) , 
        allowNull: true , 
        defaultValue: null , 
      } , 
      
      price: {
        type: DataTypes.FLOAT(4) , 
        allowNull: true , 
        defaultValue: null , 
      } , 

      quantity: {
        type: DataTypes.INTEGER , 
        allowNull: false , 
      } , 

    }  , 
    
    { 
      tableName: "inventory" ,
    }
);

// Inventory.prototype.decrementInventory = function(arrItems){ // nope
Inventory.decrementInventory = function(arrItems){ // yeppers
  
  // console.log( "Inventory.decrementInventory arrItems", arrItems );

  async.forEachOf( 
    
    arrItems, 

    ( purchasedItem, idx, callback ) => { 
      
      // console.log( '\n\n' , "purchasedItem", purchasedItem );

      try {
        
        var queryPm = {
          where: {
            id: { 
              [Op.eq]: fn( 'UUID_TO_BIN' , purchasedItem.id ) 
            }
          } 
        };
        // console.log( '\n\n' , "queryPm", queryPm );

        Inventory.findOne( queryPm )
        .then( itemInStock => {
          if (itemInStock === null) {
            // console.log( '\n\n' , 'Not found!');
          } 
          else {
            return itemInStock;
          }
        } )
        .then( itemInStock => {
          try{
            if( itemInStock.quantity >= purchasedItem.quantity ){
              
              // console.log( '\n' , `Successfully purchased ${purchasedItem.quantity} ${purchasedItem.name}s!`);
              
              var optionsPm = {
                where: {
                  id: { 
                    [Op.eq]: fn( 'UUID_TO_BIN' , purchasedItem.id ) 
                  }
                } 
              };

              const updatedItem = {
                ...itemInStock,
                quantity: itemInStock.quantity - purchasedItem.quantity
              };

              Inventory.update( updatedItem , optionsPm );

            }
            else
            if( itemInStock.quantity < purchasedItem.quantity ){
              // console.error('\n' ,"Cannot complete this portion of transaction");
              // console.error(`Attempted to buy ${purchasedItem.quantity} ${purchasedItem.name}s but there are only ${itemInStock.quantity} available!`);
            }
          }
          catch(derrp){
            // console.log( '\n\n' , "try/catch derrp", derrp );
            return callback(derrp);
          }
          
        } )
        .catch( ( err ) => {
          // console.log( '\n\n' , `There was derrpage: ` , JSON.stringify( err, null, 2 ) );
          return callback(err);
        } );
        
      }
      catch(e){
        // console.log( '\n\n' , "try/catch e", e );
        return callback(e);
      }
    } , 

    err => {
      if (err) {
        // console.error( '\n\n' , "err.message: " , err.message );
      }
    }

  ); // END async.forEachOf()
  

}; // END decrementInventory


// =============================================
// START LAMBDA FUNCTION
// =============================================

exports.handler = async (event, context, callback) => {

  let simonsays;
  
  if (event.httpMethod !== "POST") { // only POST
    
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
    
    let { id, date, total, items, tax } = await JSON.parse( event.body );

    const newTransaction = { 
      id: fn( 'UUID_TO_BIN' , await id ) , 
      date: await date , 
      total: await total , 
      items: await items , 
      tax: await tax , 
    };
    
    // await console.log("\n newTransaction", await newTransaction );

    // const transaction = await Transaction.create( await newTransaction );

    const transaction = await Transaction.create( await newTransaction )
    .then( record => {
      console.log( "record", record );
      return record;
    })
    .catch((error) => {
      console.error("error" , error );
    })
    .finally(() => {
      sequelize.close();
    });

    await console.log("await transaction: " , await transaction );
    await console.log("await transaction instanceof Transaction" , await transaction instanceof Transaction );
    
    if( await transaction.items !== undefined ){
      // await console.log( "transaction.items", await transaction.items );
      // await Inventory.decrementInventory( JSON.parse( await transaction.items ) ); 
      await Inventory.decrementInventory( await JSON.parse( transaction.items ) ); 
    }

    const netlifyresponseobject = {
      statusCode: 200 ,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
      body: JSON.stringify( { msg: await "New record has been added" } )
    };

    simonsays = await netlifyresponseobject;

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
