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
  dialectModule: require('mysql2'), 
  host: DB_URL , 
  port: parseInt(DB_PORT, 10) ,   
  define: {
    timestamps: false
  },
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

    // if dates are provided
    if( !!( await event.queryStringParameters.startdate && await event.queryStringParameters.startdate >= 0) && !!( await event.queryStringParameters.enddate && await event.queryStringParameters.enddate >= 0) ){ 
      
      // beginning of query date day
      var startNum = new Date( parseInt( await event.queryStringParameters.startdate , 10 ) ).setHours(0,0,0,0); // "typeof x.setHours(...) ... === number
      var startDate = new Date( await startNum );
      
      // end of query date day
      var endNum = new Date( parseInt( await event.queryStringParameters.enddate , 10 ) ).setHours(23,59,59,999); // "typeof x.setHours(...) ... === number
      var endDate = new Date( await endNum );
    }
    
    // await console.log("todaysnumbers startDate" , await startDate ); // 2023-11-06T06:00:00.000Z
    // await console.log("todaysnumbers endDate" , await endDate );     // 2023-11-09T05:59:59.999Z

    const customRangeOptions = await {
      attributes : {
        include: [ 
          [ fn( 'BIN_TO_UUID' , col('id'), ) , 'id' ] , 'date' , 'total', 'items', 'tax' 
        ] 
      } ,     
      raw: true , // NO MORE dataValues    
      where: {
        date: { 
          [Op.and]: {
            [Op.gte]: await startDate ,
            [Op.lte]: await endDate , 
          }
        }
      } 
    };

    const transactions = await Transaction.findAll( await customRangeOptions );
    // await console.log( 'await transactions: ', await transactions );

    if( await transactions.length === 0 ){
      // await console.log( '\n\n', "transactions.length === 0", await transactions);
      const netlifyresponseobject = {
        statusCode: 200 ,
        body: JSON.stringify( await transactions ) ,
        // body: JSON.stringify( { msg: await 'Konichiwa, baby!' } ) , 
      };
      simonsays = await netlifyresponseobject;
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

// 2020 - Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// 2023 - Docs on event and context - https://docs.netlify.com/functions/get-started/?fn-language=js#route-requests-2
// 2023 - Synchronous function format - https://docs.netlify.com/functions/lambda-compatibility/?fn-language=js
