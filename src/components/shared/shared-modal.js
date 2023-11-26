import React , { useState, forwardRef, useImperativeHandle } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

const SharedModal = ( props , ref ) => {

  // console.log( "props", props );
  
  const [ editProductFormModal, setEditProductFormModal ] = useState(false);
  const handleCloseEditProductFormModal = () => setEditProductFormModal(false);
  const handleShowEditProductFormModal = () => setEditProductFormModal(true);

  const [ addProductFormModal, setAddProductFormModal ] = useState( false ); 
  const handleCloseAddProductFormModal = () => setAddProductFormModal(false);
  const handleShowAddProductFormModal = () => setAddProductFormModal(true);

  const exportedShowEditModal = () => handleShowEditProductFormModal();
  const exportedCloseEditModal = () => handleCloseEditProductFormModal();
  const exportedShowAddModal = () => handleShowAddProductFormModal();
  const exportedCloseAddModal = () => handleCloseAddProductFormModal();

  useImperativeHandle( ref, () => ( { exportedShowEditModal , exportedCloseEditModal, exportedShowAddModal, exportedCloseAddModal } ) );

  if( props.custommodalscope === "addproduct" ){
    let element = (
      <>
        <Modal show={addProductFormModal} onHide={handleCloseAddProductFormModal} >
          <Modal.Header closeButton>
            <Modal.Title>Add New Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { props.children }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddProductFormModal} >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
    return element;
  }
  if( props.custommodalscope === "editproduct" ){
    let element = (
      <>
        <Modal show={editProductFormModal} onHide={handleCloseEditProductFormModal} >
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            { props.children }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditProductFormModal} >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );    
    return element;
  }
};

export default forwardRef( SharedModal );