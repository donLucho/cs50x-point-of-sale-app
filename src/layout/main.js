import React from 'react';

import { Nav } from './nav';
import { Footer } from "./footer";

const Main = (props) => {

  // console.log( 'Main' , props );

  let element = (
    <>
      <div className="container">
        <Nav />
        <main>
          <div className="container py-4">
            {props.children}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
  return element;

};

export {Main};
