import React from "react";
import { NavLink , useNavigate } from 'react-router-dom';

import { AuthService } from '../services/AuthService';

const Nav = () => {

  const Auth = new AuthService();  
  const navigate = useNavigate();  
  const noOpLink = (event) => { event.preventDefault(); };

  const handleLogout = (event) => {
    event.preventDefault();
    Auth.logout();
    navigate('/login');
  };

  let element = (

    <nav className="navbar navbar-expand-md navbar-dark bg-dark" aria-label="Fourth navbar example">
      <div className="container-fluid">

        <NavLink className="navbar-brand" to="/" onClick={ noOpLink }>CS50x Point-of-Sale System</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample04" aria-controls="navbarsExample04" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarsExample04">

          <ul className="navbar-nav me-auto mb-2 mb-md-0">

            { Auth.loggedIn() && <> <li className="nav-item">
              <NavLink className="nav-link" to={"/"} activeclassname={"active"} end>
                Index (POS)
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to={"/inventory"} activeclassname={"active"} end>
                Inventory
              </NavLink>
            </li>

             <li className="nav-item">
              <NavLink className="nav-link" to={"/transactions"} activeclassname={"active"} end>
                Transactions
              </NavLink>
            </li> 

             <li className="nav-item">
              <NavLink className="nav-link" to={"/livecart"} activeclassname={"active"} end>
                Search Checkout Items {/* LiveCart */}
              </NavLink>
            </li> </> }
            
          </ul>

          <ul className="navbar-nav">
            
            { !Auth.loggedIn() && <> <li className="nav-item">
              <NavLink className="nav-link btn btn-outline-success my-2 my-sm-0 mr-sm-2" to={"/login"} activeclassname={"active"} exact="true">
                Login
              </NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link btn btn-outline-primary my-2 my-sm-0 mr-sm-2" to={"/register"} activeclassname={"active"} exact="true">
                Register
              </NavLink>
            </li> </> }
            
            { Auth.loggedIn() && <> <li className="nav-item">
              <NavLink className="nav-link btn btn-outline-danger my-2 my-sm-0 mr-sm-2" to={""} activeclassname={"active"} exact="true" onClick={ handleLogout }>
                Logout
              </NavLink>
            </li> </> }
            
          </ul>
          
        </div>
      </div>
    </nav>

  );
  return element;
};

export {Nav};
