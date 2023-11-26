class ApiService{

  constructor(){
    this.getAllProducts = this.getAllProducts.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.getOneProduct = this.getOneProduct.bind(this);
    this.updateOneProduct = this.updateOneProduct.bind(this);
    
    this.getAllTransactions = this.getAllTransactions.bind(this);
    this.getTodaysNumbers = this.getTodaysNumbers.bind(this);
    this.getCustomRange = this.getCustomRange.bind(this);
    this.createTransaction = this.createTransaction.bind(this);
    this.getOneTransaction = this.getOneTransaction.bind(this);
  }

  customfetch( url, options ){
    
    let myRequest = new Request( url );

    let myHeaders = new Headers();
    myHeaders.append( 'Content-type' , 'application/json; charset=UTF-8' ); 
    myHeaders.append( "Accept" , "application/json" );
    
    let optionsobject = { headers: myHeaders, ...options };
    // console.log( "optionsobject" , optionsobject );

    return fetch( myRequest, optionsobject )
    .then( this.checkStatus )
    .then( response => response.json() );
  };

  checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    } 
    else {
      let error = new Error( response.statusText );
      error.response = response;
      return Promise.reject( error );
    }
  };

  getAllProducts(){ 
    
    let productsRequest = new Request(`/api/getallproducts`);
    // let productsRequest = new Request(`/api/inventory/getallproducts`);
    // let productsRequest = new Request(`/.netlify/functions/getallproducts`);
    
    let productsOptions = {};

    return this.customfetch( productsRequest, productsOptions )
    .then( (data) => { 
      // console.log( "getAllProducts... data" , data );
      return Promise.resolve( data );
    } );
  };

  createProduct( newproductobj ){
    
    let createRequest = new Request(`/api/createoneproduct`);
    // let createRequest = new Request(`/api/inventory/createoneproduct`);
    // let createRequest = new Request(`/.netlify/functions/createoneproduct`);

    let createOptions = {
      method: 'POST'
      , body: JSON.stringify( newproductobj )
    };

    return this.customfetch( createRequest, createOptions )
    .then( (data) => { 
      // console.log( "createProduct... data" , data );
      return Promise.resolve( data );
    } );

  };
  
  getOneProduct( id ){
    
    let getOneRequest = new Request(`/api/getoneproduct/${id}`);
    // let getOneRequest = new Request(`/api/inventory/getoneproduct/${id}`);
    // let getOneRequest = new Request(`/.netlify/functions/getoneproduct/${id}`);

    let getOneOptions = {};

    return this.customfetch( getOneRequest, getOneOptions )
    .then( (data) => { 
      // console.log( "getOneProduct... data" , data );
      return Promise.resolve( data );
    } );
  };

  updateOneProduct( pm ){
    
    let editOneRequest = new Request(`/api/updateoneproduct`);
    // let editOneRequest = new Request(`/api/inventory/updateoneproduct`);
    // let editOneRequest = new Request(`/.netlify/functions/updateoneproduct`);

    let editOneOptions = {
      method: 'POST'
      , body: JSON.stringify( pm )
    };

    return this.customfetch( editOneRequest, editOneOptions )
    .then( (data) => {
      // console.log( "updateOneProduct... data" , data );
      return Promise.resolve( data );
    } );
  };

  getAllTransactions(){ 
    
    let transactionsRequest = new Request(`/api/getalltransactions`);
    // let transactionsRequest = new Request(`/api/transactions/getalltransactions`);
    // let transactionsRequest = new Request(`/.netlify/functions/getalltransactions`);

    let transactionsOptions = {};

    return this.customfetch( transactionsRequest, transactionsOptions )
    .then( (data) => { 
      // console.log( "getAllTransactions... data" , data );
      return Promise.resolve( data );
    } );
  };

  
  getTodaysNumbers(date_param){ 
    
    let todaysNumbersRequest = new Request(`/api/gettodaysnumbers?date=${date_param}`);
    // let todaysNumbersRequest = new Request(`/api/transactions/gettodaysnumbers?date=${date_param}`);
    // let todaysNumbersRequest = new Request(`/.netlify/functions/gettodaysnumbers?date=${date_param}`);

    let todaysNumbersOptions = {};

    return this.customfetch( todaysNumbersRequest, todaysNumbersOptions )
    .then( (data) => { 
      // console.log( "getTodaysNumbers... data" , data );
      return Promise.resolve( data );
    } );
  };

  getCustomRange(startdate_param, enddate_param){ 
    
    let customRangeRequest = new Request(`/api/getcustomrange?startdate=${startdate_param}&enddate=${enddate_param}`);
    // let customRangeRequest = new Request(`/api/transactions/getcustomrange?startdate=${startdate_param}&enddate=${enddate_param}`);
    // let customRangeRequest = new Request(`/.netlify/functions/getcustomrange?startdate=${startdate_param}&enddate=${enddate_param}`);
    
    let customRangeOptions = {};

    return this.customfetch( customRangeRequest, customRangeOptions )
    .then( (data) => { 
      // console.log( "getCustomRange... data" , data );
      return Promise.resolve( data );
    } );
  };

  createTransaction( newtransactionobj ){
    
    let createRequest = new Request(`/api/createonetransaction`);
    // let createRequest = new Request(`/api/transactions/createonetransaction`);
    // let createRequest = new Request(`/.netlify/functions/createonetransaction`);

    let createOptions = {
      method: 'POST'
      , body: JSON.stringify( newtransactionobj )
    };

    return this.customfetch( createRequest, createOptions )
    .then( (data) => { 
      // console.log( "createTransaction... data" , data );
      return Promise.resolve( data );
    } );
  };


  getOneTransaction( id ){
    
    let getOneRequest = new Request(`/api/getonetransaction/${id}`);
    // let getOneRequest = new Request(`/api/transactions/getonetransaction/${id}`);
    // let getOneRequest = new Request(`/.netlify/functions/getonetransaction/${id}`);

    let getOneOptions = {};

    return this.customfetch( getOneRequest, getOneOptions )
    .then( (data) => { 
      // console.log( "getOneTransaction... data" , data );
      return Promise.resolve( data );
    } );
  };
  
  massageThePhrase( str ){ // custom string helper function
    let offthefrontandback = str.trim();
    let newstring = offthefrontandback.replace(/  +/g, ' '); 
    const firstChar = newstring.slice(0,1).toUpperCase();
    const otherChars = newstring.slice(1);
    newstring = firstChar + otherChars;
    return newstring;
  };

}

export { ApiService };
