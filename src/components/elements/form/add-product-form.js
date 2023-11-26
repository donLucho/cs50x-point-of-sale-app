import React from 'react';
import Button from 'react-bootstrap/Button';

const AddProductForm = (props) => {

  // console.log( "props", props );
  
  let element = (
    <>
      <form className="form-horizontal" name="newProductForm" id="newProductForm" onSubmit={ props.handleNewProduct } >
        
        <div className='form-group'>
          <label className='col-md-4 control-label' htmlFor='name'>Name</label>
          <div className='col-md-12'>
            <input className='form-control' name='name' id='name' placeholder='Name' type={'text'} ref={ props.addFormNameInput } />
          </div>
        </div>

        <div className='form-group'>
          <label className='col-md-6 control-label' htmlFor='price'>Price</label>
          <div className='col-md-6'>
            <input className='form-control' name='price' id='price' placeholder='1.99' type={'number'} step={'.01'} min={'0'} inputMode={'decimal'} ref={ props.addFormPriceInput } />
          </div>
        </div>

        <div className='form-group'>
          <label className='col-md-6 control-label' htmlFor='quantity'>Quantity on Hand</label>
          <div className='col-md-6'>
            <input className='form-control' name='quantity' id='quantity' placeholder='Quantity on hand' type={'number'} step={'any'} min={'0'} ref={ props.addFormQuantityInput } />
          </div>
        </div>

        <div className='form-group'>
          <div className='col-md-6'>
            <Button 
              type='submit' 
              className='btn btn-primary btn-lg lead'
            >Add New Product</Button>
          </div>
        </div>

      </form>
    </>
  );
  return element;
};

export {AddProductForm};