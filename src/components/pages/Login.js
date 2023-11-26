import React from "react";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {AuthService} from '../../services/AuthService';

const LoginPage = () => {

  const Auth = new AuthService();

  const navigate = useNavigate();
  // console.log( "navigate" , navigate );

  const [ logged, setLogged ] = useState( Auth.loggedIn() );

  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState(false);

  const innerFunction = useCallback( () => {
    if( logged === true ){
      setLogged( true );
      navigate('/');
    }
  } , [ logged, navigate] );

  useEffect( () => {
    innerFunction();
    return () => {};
  } , [ innerFunction ] );

  const onChangeEmail = (event) => { setEmail( event.target.value) };
  const onChangePassword = (event) => { setPassword( event.target.value) };

  // const handleSubmit = async (event) => {
  const handleSubmit = (event) => {
    
    event.preventDefault();

    // await console.log(`Form submitted - ${ await email }`);
    // await console.log(`Form submitted - ${ await password }`);

    setError(false);

    // let param = { email: await email, password: await password };
    // let strungout = await JSON.stringify(await param);
    // const loginpromise = await Auth.login( await strungout )

    /* const loginpromise = await Auth.login( { email: await email, password: await password } )
    .then( data => {
      console.log( "data" , data );
      return data;
    } )
    .catch( (err) => {
      console.log( "err.message" , err.message );
      console.log( "err" , err );
      setError( err.message );
    } );

    if( await loginpromise !== undefined ){
      
      // await console.log( "loginpromise" , await loginpromise );
      if( await !!loginpromise.errormessage ){
        setError( await loginpromise.errormessage );
      }
      
      // else
      // if( await !loginpromise.errormessage ){
      //   // await console.log( "loginpromise" , await loginpromise );
      //   navigate('/');
      // }

      // if( await !!loginpromise.token ){
      //   // await console.log( "loginpromise" , await loginpromise );
      //   navigate('/');
      // }

      if( await !loginpromise.errormessage ){
        
        await console.log( "await loginpromise.token" , await loginpromise.token );
        await console.log( "await Auth.loggedIn()", await Auth.loggedIn() ); // true(dev)
        await console.log( "await logged", await logged ); // false(dev)
        await console.log( "HOLD IT!!!" );

        if(await logged === false){
          await console.log( "logged is equal to false" ); // false(dev)
          await console.log( "await Auth.getToken()", await Auth.getToken() ); 
        }

        // await Auth.setToken( await loginpromise.token );
        // await navigate('/');

      }

    }*/

    Auth.login( { email: email, password: password } )
    .then( (data) => {
      // console.log( "data" , data );
      if( !!data.errormessage ){
        setError( data.errormessage );
      }
      else
      if( !data.errormessage ){
        navigate('/');
      }
    } )
    .catch( (err) => {
      // console.log( "err.message" , err.message );
      // console.log( "err" , err );
      setError( err.message );
    } ); 

  };

  let errormessage = (
    <>
      <div className="row">
        <div className="col-md-6 mx-auto">
          <h2>An error has occurred</h2>
          <p>{error}</p>
        </div>
      </div>
    </>
  );

  let element = (
    <>
      <div className="py-5">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <span className="anchor" id="formLogin"></span>
            
            <div className="card rounded-0">
              <div className="card-header">
                <h3 className="mb-0">Login</h3>
              </div>

              <div className="card-body">
                <form className="form" onSubmit={handleSubmit}>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" className="form-control rounded-0" placeholder="john@doe.com" required value={ email } onChange={ onChangeEmail } autoFocus />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    
                    <input type="password" name="password" id="password" className="form-control rounded-0" placeholder="password" required value={ password } onChange={ onChangePassword } />

                  </div>

                  <button type="submit" disabled={ email === '' || password === '' } className="btn btn-primary float-right" >Login</button>
                  
                </form>
              </div>

            </div>

          </div>
        </div>
        { !!error && errormessage }
      </div>
    </>
  );
  return element;
};

export {LoginPage};
