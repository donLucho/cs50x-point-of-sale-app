import React from 'react';
import { useRef } from 'react';
import Button from 'react-bootstrap/Button';

import { ApiService } from '../../services/ApiService'; 
import SharedModal from '../shared/shared-modal';
import { EditProductForm } from '../elements/form/edit-product-form';

const ExistingProductEditorViewer = ( props ) => {

  // console.log( "props", props );

  const AServ = new ApiService();  

  const editModalRef = useRef(null);

  const editFormHiddenIdField = useRef(null);
  const editFormNameInput = useRef(null);
  const editFormPriceInput = useRef(null);
  const editFormQuantityInput = useRef(null);

  const editModalProperties = { 
    ref: editModalRef , 
    custommodalscope: "editproduct" , 
  }; 

  // #################
  const openEditModalHandler = () => editModalRef.current.exportedShowEditModal();
  const closeEditModalHandler = () => editModalRef.current.exportedCloseEditModal();

  // #################
  const handleEditProduct = async (event) => { 

    event.preventDefault(); 

    // console.log("KONICHIWA!!!");
    
    const editFormData = new FormData();
    editFormData.append("id", await editFormHiddenIdField.current.value );
    editFormData.append("name", await editFormNameInput.current.value );
    editFormData.append("quantity", await editFormQuantityInput.current.value );
    editFormData.append("price", await editFormPriceInput.current.value );    
    
    var editedProduct = {
      name: await editFormData.get("name") ,
      quantity: await parseInt( editFormData.get("quantity") , 10 ) ,
      price: await Number( parseFloat( editFormData.get("price") ).toFixed(2) ) ,
      id: await editFormData.get("id") ,
    }; 
    
    // console.log( "editedProduct", editedProduct ); 
    
    await AServ.updateOneProduct(editedProduct)
    .then( (response) => {
      // console.log( "response", response );
      props.setSnackMessage( "PRODUCT UPDATE SUCCESSFUL."); 
      props.handleSnackbar(); 
      props.getProducts(); 
      closeEditModalHandler();
    } )
    .catch( (error) => {
      // console.log( "error", error );
      props.setSnackMessage( "PRODUCT NOT UPDATED."); 
      props.handleSnackbar(); 
      closeEditModalHandler();
    } );
  }; 

  // #################
  const editFormProperties = { 
    product: props.product ,
    editFormHiddenIdField: editFormHiddenIdField ,
    editFormNameInput: editFormNameInput , 
    editFormPriceInput: editFormPriceInput , 
    editFormQuantityInput: editFormQuantityInput , 
    handleEditProduct: handleEditProduct , 
  };

  let element = (
    <>
      <td>
        <Button variant="info" onClick={ () => openEditModalHandler() }><i className="fas fa-pencil"></i></Button>
      </td>
      <td>
        <SharedModal { ...editModalProperties }><EditProductForm {...editFormProperties} /></SharedModal>
      </td>
    </>
  );
  return element;
};

export {ExistingProductEditorViewer};
