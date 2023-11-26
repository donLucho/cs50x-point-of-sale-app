import React from 'react';
import { NavLink } from 'react-router-dom';

const DNEPage = () => {
  
  let element = (
    <>
      <div className="jumbotron">
        <div className="container">
          <h1 className="display-3">404, baby!!!</h1>   
          <p><NavLink className="btn btn-primary btn-lg" to={`/`} role="button">Go home &raquo;</NavLink></p>
        </div>
      </div>
      <div className="container">
        <p>Page Not Found.</p>
      </div>
    </>
  );
  return element;
};

export {DNEPage};