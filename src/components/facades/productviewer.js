import React, { useRef, useCallback, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { v1 as uuidv1 } from 'uuid';

import { ApiService } from '../../services/ApiService'; 

import { Product } from '../pages/Product';
import { NoProductDisclosure } from '../elements/tablerow_static/noproductsdisclosure';
import { ProductsTable } from '../elements/table/products-table';
import { AddProductForm } from '../elements/form/add-product-form';
import SharedModal from '../shared/shared-modal';

const ProductViewer = ( props ) => {

  // console.log( "props", props );

  const AServ = new ApiService(); 

  const addModalRef = useRef(null);

  const addFormNameInput = useRef(null);
  const addFormPriceInput = useRef(null);
  const addFormQuantityInput = useRef(null);

  const getProducts = async () => { 
    
    const result = await AServ.getAllProducts();
    // await console.log( "result", await result );

    if( props.productsProperties.products !== await result ){
      props.productsProperties.setProducts( await result );
    }

  };

  const handleSnackbar = ()=>{
    var $snackbar = props.snackbarProperties.snackbar.current;
    $snackbar.className = "show";
    setTimeout( function(){
      $snackbar.className = $snackbar.className.replace("show", "");
    }, 2812.5);
  };

  const fetchData = useCallback( async () => {
    await getProducts();
    // eslint-disable-next-line
  } , [ ] );

  useEffect( () => {
    fetchData();
    // eslint-disable-next-line
  } , [ ] );

  const handleNewProduct = async (event) => {

    event.preventDefault(); 
    
    // console.log("KONICHIWA!!!");

    const addFormData = new FormData();
    addFormData.append("name", await addFormNameInput.current.value );
    addFormData.append("quantity", await addFormQuantityInput.current.value );
    addFormData.append("price", await addFormPriceInput.current.value );

    var newProduct = {
      id: uuidv1() ,
      name: await addFormData.get("name") ,
      quantity: await parseInt( addFormData.get("quantity") , 10 ) ,
      price: await Number( parseFloat( addFormData.get("price") ).toFixed(2) )
    }; 

    // console.log( "newProduct", newProduct );

    await AServ.createProduct(newProduct)
    .then( (response) => { 
      // console.log( "response", response );
      props.snackbarProperties.setSnackMessage("PRODUCT ADDED SUCCESSFULLY.");
      handleSnackbar();
      getProducts(); 
      addModalRef.current.exportedCloseAddModal();
    } )
    .catch( (error) => { 
      // console.log( "error", error );
      props.snackbarProperties.setSnackMessage("PRODUCT COULD NOT BE SAVED.");
      handleSnackbar();
      addModalRef.current.exportedCloseAddModal();
    } );
    /**/

  }; 

  // #################
  const mapProducts = (product, idx, arr) => {
    
    const productProperties = {
      key: idx , 
      product: product , 
    };

    const additionalProductProperties = {
      supplementalProperties: {
        getProducts: getProducts ,
        handleSnackbar: handleSnackbar ,
        setSnackMessage: props.snackbarProperties.setSnackMessage ,
      }
    };
    
    return <Product { ...productProperties } { ...additionalProductProperties } />
  };

  const productsList = () => {
    return props.productsProperties.products.map( mapProducts );
  };

  // #################
  const openAddModalHandler = () => addModalRef.current.exportedShowAddModal();

  // #################  
  const addFormProperties = {
    addFormNameInput: addFormNameInput ,
    addFormQuantityInput: addFormQuantityInput , 
    addFormPriceInput: addFormPriceInput , 
    handleNewProduct: handleNewProduct , 
  };

  // #################
  const addModalProperties = {
    ref: addModalRef ,
    custommodalscope: "addproduct",
  };

  // #################  

  let element = (
    <>
      <div className="container">
        
        <div className="card-body">
          <h1 className="display-6">Welcome, { decodeURIComponent(props.productsProperties.authProps.profile.user.username) }!!!</h1>
          <div className="mb-2">
            This is the Inventory page!
          </div>
        </div>

        <div>
          <Button variant="info" className={'btn btn-success float-end'} onClick={ () => openAddModalHandler() }>
            <i className="fas fa-plus"></i>&nbsp; Add New Item
          </Button>
          <br />
          <br />
          <ProductsTable>
            { props.productsProperties.products.length > 0 ? productsList() : (<NoProductDisclosure />) }
          </ProductsTable>
          <SharedModal { ...addModalProperties }>
            <AddProductForm { ...addFormProperties } />
          </SharedModal>
          <div id='snackbar' ref={ props.snackbarProperties.snackbar }>{ props.snackbarProperties.snackMessage }</div>
        </div>
      </div>
    </>
  );
  return element;
};

export {ProductViewer}; 