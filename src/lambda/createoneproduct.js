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
  username: DB_USER ,
  password: DB_PDUB ,
  database: DB_NAME ,
  dialect: DB_DIALECT ,
  protocol: DB_PROTOCOL ,
  port: DB_PORT ,
  host: DB_URL ,
  define: {
    timestamps: false 
  },
};

const sequelize = new Sequelize( configurationObj );

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
  }

  try{
    
    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );
    
    let { id, name, quantity, price } = await JSON.parse( event.body );

    var newproduct = { 
      id: fn( 'UUID_TO_BIN' , await id ) , 
      name: await name , 
      quantity: await quantity ,
      price: await price ,
    };

    // await console.log("\n newproduct", await newproduct );

    await Inventory.create( await newproduct )
    .then( newuser => {
      // console.log( '>>>>>> New record added: ' , newuser );
    } )
    .catch( ( err ) => {
      // console.log( `There was derrpage: \n\n` , JSON.stringify( err, null, 2 ) ); 
    } );

    const netlifyresponseobject = {
      statusCode: 200 ,
      // headers: { 'Content-Type': 'application/json' }, 
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
