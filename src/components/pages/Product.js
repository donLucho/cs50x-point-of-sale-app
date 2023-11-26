import React from 'react';
import { ExistingProductEditorViewer } from '../facades/existingproducteditorviewer';

const Product = (props) => {

  // console.log( "props", props );
  
  const editFormProperties = { 
    product: props.product ,
    getProducts: props.supplementalProperties.getProducts ,
    handleSnackbar: props.supplementalProperties.handleSnackbar ,
    setSnackMessage: props.supplementalProperties.setSnackMessage ,
  };

  let element = (
    <>
      <tr>
        <td>{ props.product.id }</td>
        <td>{ props.product.name }</td>
        <td>${ props.product.price }</td>
        <td>{ props.product.quantity }</td>
        <ExistingProductEditorViewer { ...editFormProperties } />
      </tr>
    </>
  );
  return element;
};

export {Product};