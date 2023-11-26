import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; 

import { AuthService } from '../services/AuthService';

const withAuth = ( AuthComponent ) => {

  const Auth = new AuthService();

  return function AuthWrapped(){
    
    const [ profile, setProfile ] = useState( null );
  
    let navigate = useNavigate(); 
    // console.log( "navigate" , navigate );
  
    let innerFunction = useCallback( () => {
      if( !Auth.loggedIn() ){
        navigate('/login');
      }
      else
      if( Auth.loggedIn() ){
        try{
          const userprofile = Auth.getProfile();
          // console.log( "profile" , profile );
          setProfile( userprofile );
        }
        catch( error ){
          // console.log( "error" , error );
          Auth.logout();
          navigate('/login');
        }
      }
    } , [ navigate ] );
  
    useEffect( () => {
      innerFunction();
      return () => {};
    } , [ innerFunction ] );
  
    let element = (
      <AuthComponent history={ navigate } profile={ profile } />
    );
  
    if( profile ){
      return element;
    }
    else{
      return null;
    }
    
  };

};

export { withAuth };