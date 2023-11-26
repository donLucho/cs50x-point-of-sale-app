import React from "react";

const OptionProduct = ( {product} ) => {
  
  let element = (
    <>
      <option value={ JSON.stringify( product) }>{ product.name }</option>
    </>
  );
  return element;
  
};

export { OptionProduct }; 
