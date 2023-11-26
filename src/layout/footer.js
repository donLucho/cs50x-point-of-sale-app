import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {  
  
  const noOpLink = (event) => { event.preventDefault(); };

  const element = (
    <footer className="container">
      <div className="starter-template">
        <p>
          &copy; &nbsp;
          <NavLink to={"/"} onClick={ noOpLink }>GitHub repositories</NavLink>&nbsp;
           | &nbsp;
          <NavLink to={"/"} onClick={ noOpLink }>GitLab projects</NavLink>&nbsp;
        </p>
      </div>
    </footer>
  );
  return element;
};

export {Footer};
