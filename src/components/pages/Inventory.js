import React, { useState, useRef } from 'react';
import { ProductViewer } from '../facades/productviewer'; 

import { withAuth } from '../../hoc/withAuth';  

const Inventory = (props) => { 

  let snackbar = useRef(null);

  const [ products, setProducts ] = useState( [] );
  const [ snackMessage, setSnackMessage ] = useState( "" );

  const productViewerProperties = {
    
    productsProperties : {
      products: products , 
      setProducts: setProducts , 
      authProps: props
    } ,

    snackbarProperties: {
      snackbar: snackbar , 
      snackMessage: snackMessage , 
      setSnackMessage: setSnackMessage ,
    } ,
  };

  let element = ( <ProductViewer { ...productViewerProperties } /> );
  return element;
};

const AdminInventory = withAuth( Inventory );
export { AdminInventory };
