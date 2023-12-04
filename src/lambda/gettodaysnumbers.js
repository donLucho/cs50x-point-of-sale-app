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
    sequelize.close();
    return simonsays;

  }

  try{
    
    // console.log( "event", event );
    // console.log( "context", context ); // { clientContext: {} }
    // console.log( "callback", callback );

    // beginning of query date day
    var startNum = new Date( await event.queryStringParameters.date).setHours(0,0,0,0); // "typeof x.setHours(...) ... === number
    // var startDate = new Date( await startNum ); 
    // await console.log("todaysnumbers startDate" , await startDate ); // todaysnumbers startDate 2023-11-08T06:00:00.000Z
    
    // end of query date day
    var endNum = new Date( await event.queryStringParameters.date).setHours(23,59,59,999); // "typeof x.setHours(...) ... === number
    // var endDate = new Date( await endNum ); 
    // await console.log("todaysnumbers endDate" , await endDate ); // todaysnumbers endDate 2023-11-09T05:59:59.999Z

    // return all items with date in question

    const findTodayOptions = await {
      attributes : {
        include: [ [ fn( 'BIN_TO_UUID' , col('id'), ) , 'id' ] , 'date' , 'total', 'items', 'tax' ] 
      } ,     
      raw: true , // NO MORE dataValues
      where: {
        date: { 
          [Op.and]: {
            [Op.gte]: await startNum ,
            [Op.lte]: await endNum , 
          }
        }
      } 
    };

    // const transactions = await Transaction.findAll( await findTodayOptions );

    const transactions = await Transaction.findAll( await findTodayOptions )
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


    // await console.log( 'await transactions: ', await transactions );
    // await console.log("await transactions === undefined" , await transactions === undefined );
    // await console.log("await transactions !== undefined" , await transactions !== undefined );

    // #####################
    // if [transactions === undefined] / TRANSACTIONS NOT FOUND
    // #####################
    if( await transactions === undefined ){
      
      const netlifyresponseerror = {
        statusCode: 405 ,
        body: JSON.stringify( { errormessage : await "Today's Numbers SNAFU occurred!" } ) 
      }; 
      
      simonsays = await netlifyresponseerror; // return netlifyresponseerror;
      // sequelize.close(); // buuu!!!
    }

    // #####################
    // if [transactions !== undefined] / TRANSACTIONS FOUND
    // #####################
    if( await transactions !== undefined ){

      if( await transactions.length === 0 ){
        
        // await console.log( '\n\n', "transactions.length === 0", await transactions);
        const netlifyresponseobject = {
          statusCode: 200 ,
          body: JSON.stringify( await transactions ) ,
        };

        simonsays = await netlifyresponseobject;
        // sequelize.close(); // buuu!!!
      }
      
      if( await transactions.length > 0 ){
        
        // await console.log( '\n\n', "transactions.length > 0", await transactions);
        
        let shallowcopy = [ ...transactions ]; 
        // await console.log( "shallowcopy", await shallowcopy );

        const mappedTransactions = await shallowcopy.map( (el, idx, arr) => {
          return { ...el, date: new Date(el.date) }; 
        } ); 
        // await console.log( "mappedTransactions", await mappedTransactions );

        const sortDesc = await mappedTransactions.sort( (a,b) => {
          return new Date( b.date ) - new Date( a.date );
        } ); 
        // await console.log( "sortDesc", await sortDesc );

        const reducedSumOfAllSales = await sortDesc.reduce( ( accumulator, el, idx, arr ) => {
          return accumulator + el.total;
        } , 0 ); 
        // await console.log( "reducedSumOfAllSales", await reducedSumOfAllSales ); // 93.98

        
        const presentableTransactions = await sortDesc.map( (el, idx, arr) => { 
          return { ...el, date: `${el.date.toLocaleDateString()} ${el.date.toLocaleTimeString()}` }; 
        } ); 
        // await console.log("presentableTransactions", await presentableTransactions );      

        const responseObject = {
          docs: await presentableTransactions ,
          numbers: await reducedSumOfAllSales 
        };

        const netlifyresponseobject = {
          statusCode: 200 ,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' }, 
          body: JSON.stringify( await responseObject )
        };

        simonsays = await netlifyresponseobject;
        // sequelize.close(); // buuu!!!
      }      
    }

    // sequelize.close(); // buuu!!!
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
  // finally{
    // sequelize.close();
    // sequelize.connectionManager.close().then(() => console.log('shut down gracefully'));
  // }
};

// =============================================
// END LAMBDA FUNCTION
// =============================================

// 2020 - Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// 2023 - Docs on event and context - https://docs.netlify.com/functions/get-started/?fn-language=js#route-requests-2
// 2023 - Synchronous function format - https://docs.netlify.com/functions/lambda-compatibility/?fn-language=js
