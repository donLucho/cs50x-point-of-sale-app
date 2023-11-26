import { jwtDecode as decode } from 'jwt-decode'; // NEW

class AuthService {
  
  constructor(){
    this.tokenKey = 'id_token';
    this.customfetch = this.customfetch.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.registerNewUser = this.registerNewUser.bind(this);
    this.loggedIn = this.loggedIn.bind(this);
    this.isTokenExpired = this.isTokenExpired.bind(this);
    this.setToken = this.setToken.bind(this);
    this.getToken = this.getToken.bind(this);
    this.logout = this.logout.bind(this);
  }

  customfetch( url, options ){

    let myRequest = new Request( url );
    
    let myHeaders = new Headers();
    myHeaders.append( "Content-type" , "application/json; charset=UTF-8" );
    myHeaders.append( "Accept", "application/json" );
    if( this.loggedIn() ){
      myHeaders.append( "Authorization", `Bearer ${this.getToken() }` );
    }
    
    let optionsobject = {
      headers: myHeaders ,
      ...options
    };

    return fetch( myRequest, optionsobject )
    .then( this.checkStatus )
    .then( response => response.json() );
  };

  checkStatus(response){
    if( response.status >= 200 && response.status < 300 ){
      return Promise.resolve( response ); 
    }
    else {
      let error = new Error( response.statusText );
      error.response = response;
      return Promise.reject( error );
    }
  };

  login(userobj){
    
    let myRequest = new Request(`/api/userlogin`);
    // let myRequest = new Request(`/api/auth/userlogin`);
    // let myRequest = new Request(`/.netlify/functions/userlogin`);

    let optionsobject = {
      method: 'POST' , 
      body: JSON.stringify(userobj)
    };

    return this.customfetch( myRequest, optionsobject )
    .then( (data) => {

      // console.log( "THIS IS AUTH SERVICE LOGIN data" , data ); // console.log( "data" , data );
      // console.log( "typeof data" , typeof data ); 
      // console.log( "typeof data.token" , typeof data.token );
      
      this.setToken( data.token );
      // this.setToken( JSON.parse(data.token) );

      return Promise.resolve(data);
    } );
  };


  getAllUsers(){
    
    let usersRequest = new Request(`/api/getallusers`);
    // let usersRequest = new Request(`/api/auth/getallusers`);
    // let usersRequest = new Request(`/.netlify/functions/getallusers`);
    
    let usersOptions = {};

    return this.customfetch( usersRequest, usersOptions)
    .then( (data) => {
      // console.log( "getAllUsers... data" , data );
      return Promise.resolve(data);
    } );
  };


  registerNewUser(newuserobj){
    
    let registerRequest = new Request(`/api/userregister`);
    // let registerRequest = new Request(`/api/auth/userregister`);
    // let registerRequest = new Request(`/.netlify/functions/userregister`);

    let registerOptions = {
      method: 'POST',
      body: JSON.stringify( newuserobj )
    };

    return this.customfetch( registerRequest, registerOptions )
    .then( (data) => {
      // console.log( "registerNewUser... data" , data );
      return Promise.resolve(data);
    } );
  };

  getProfile(){
    // console.log( "decode( this.getToken() )" , decode( this.getToken() ) );
    return decode( this.getToken() );
  };

  loggedIn(){
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  };

  isTokenExpired(token){
    try{
      const decoded = decode(token); // console.log( "decoded" , decoded );
      if(decoded.exp < Date.now() / 1000 ){
        return true;
      }
      else{
        return false;
      }
    }
    catch(err){
      // console.log( "err" , err );
      return false;
    }
  };

  setToken(token){
    localStorage.setItem( this.tokenKey, token );
  };

  getToken(){
    return localStorage.getItem( this.tokenKey );
  };

  logout(){
    localStorage.removeItem( this.tokenKey );
  };

};

export { AuthService };
