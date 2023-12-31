// =============================================
// IMPORT each CONNECTION OBJECT and MODEL(s)
// =============================================
const { Transaction } = require('../database-split-components/models/transaction.model');

// =============================================
// BASE SETUP
// =============================================
const { Op , where , fn , col } = require("sequelize");

// =============================================
// LAMBDA FUNCTION
// =============================================
exports.handler = async (event, context, callback) => {

  let simonsays;
  
  if (event.httpMethod !== "GET") { // only GET
    const netlifyresponseobject = {
      statusCode: 405 , 
      body: JSON.stringify( { errormessage: "Method Not Allowed" } )
    };
    simonsays = netlifyresponseobject;
    return simonsays;
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
    // await console.log("await transactions === undefined" , await transactions === undefined );
    // await console.log("await transactions !== undefined" , await transactions !== undefined );

    // #####################
    // if [transactions === undefined] / TRANSACTIONS NOT FOUND
    // #####################
    if( await transactions === undefined ){
      const netlifyresponseerror = {
        statusCode: await 400 ,
        body: JSON.stringify( { errormessage : await "Custom Range SNAFU occurred!" } ) 
      };      
      simonsays = await netlifyresponseerror; 
    }

    // #####################
    // if [transactions !== undefined] / TRANSACTIONS FOUND
    // #####################
    if( await transactions !== undefined ){

      if( await transactions.length === 0 ){
        const netlifyresponseobject = {
          statusCode: 200 ,
          body: JSON.stringify( await transactions ) ,
        };
        simonsays = await netlifyresponseobject;
      }

      if( await transactions.length > 0 ){
        
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
    }

    return simonsays;
  }
  catch(err){
    // console.log( 'response err catch: ', err );
    const netlifyresponseerror = {
      statusCode: 500 , 
      body: JSON.stringify( { message: err.message } )
    };
    return netlifyresponseerror;
  }
};

// 2020 - Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
// 2023 - Docs on event and context - https://docs.netlify.com/functions/get-started/?fn-language=js#route-requests-2
// 2023 - Synchronous function format - https://docs.netlify.com/functions/lambda-compatibility/?fn-language=js