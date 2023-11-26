import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {AuthService} from '../../services/AuthService';

const RegisterPage = () => {

  const Auth = new AuthService();
  const navigate = useNavigate();
  // console.log( "navigate" , navigate );

  const [ username, setUsername ] = useState('');
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ confirmpassword, setConfirmPassword ] = useState('');
  const [ error, setError ] = useState(false);

  const onChangeUsername = (event) => { setUsername( event.target.value) };
  const onChangeEmail = (event) => { setEmail( event.target.value) };
  const onChangePassword = (event) => { setPassword( event.target.value) };
  const onChangeConfirmPassword = (event) => { setConfirmPassword( event.target.value) };

  const handleSubmit = async (event) => {
    
    event.preventDefault();

    // console.log(`Form submitted - ${ username }`);
    // console.log(`Form submitted - ${ email }`);
    // console.log(`Form submitted - ${ password }`);

    const alluserspromise = await Auth.getAllUsers()
    .then( data => {
      // console.log( "data" , data );
      return data;
    } )
    .catch( (err) => {
      setError( err.message );
    } );

    // console.log( "alluserspromise" , alluserspromise );

    if( alluserspromise !== undefined ){

      setError( false );

      let pdubconfirmed;
      const doPdubsMatch = confirmpassword === password;
      
      if( doPdubsMatch === true ){
        pdubconfirmed = await true;
      }
      if( doPdubsMatch === false ){
        pdubconfirmed = await false;
      }

      if(pdubconfirmed === false){
        setError("Passwords do not match. Try again!");
      }

      let value;
      const doesUsernameExist = await alluserspromise.some( user => decodeURIComponent(user.username) === username );
      const doesEmailExist = await alluserspromise.some( user => user.email === email );
      if( doesUsernameExist || doesEmailExist ){
        value = await true;
      }
      if( !doesUsernameExist && !doesEmailExist ){
        value = await false;
      }

      if( value === true ){
        setError("Username or email exist. Try again!");
      }

      if( value === false && pdubconfirmed === true ){
        
        Auth.registerNewUser( { username: encodeURIComponent(username), email: email, password: password } )
        .then( (data) => {
          // console.log( "data" , data );
          if( !!data.errormessage ){
            setError( data.errormessage );
          }
          else 
          if( !data.errormessage ){
            navigate('/login');
          }
        } )
        .catch( (err) => {
          // console.log( "err.message", err.message );
          setError( err.message );
        } );

      }
    }

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
            <span className="anchor" id="formRegister"></span>
            
            <div className="card rounded-0">
              <div className="card-header">
                <h3 className="mb-0">Register</h3>
              </div>

              <div className="card-body">
                <form className="form" onSubmit={handleSubmit}>
                  
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" className="form-control rounded-0" placeholder="johndoe" required value={ username } onChange={ onChangeUsername } autoFocus />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" name="email" id="email" className="form-control rounded-0" placeholder="john@doe.com" required value={ email } onChange={ onChangeEmail }/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" className="form-control rounded-0" placeholder="password" required value={ password } onChange={ onChangePassword } />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmpassword">Confirm Password</label>
                    <input type="password" name="confirmpassword" id="confirmpassword" className="form-control rounded-0" placeholder="password" required value={ confirmpassword } onChange={ onChangeConfirmPassword } />
                  </div>

                  <button type="submit" disabled={ username === '' || email === '' || password === '' || confirmpassword === '' } className="btn btn-primary float-right" >Register</button>

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

export {RegisterPage};
