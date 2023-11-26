import React from 'react';
import Button from 'react-bootstrap/Button';

const EditProductForm = (props) => {

  // console.log( "props", props );
  
  let element = (
    <>
      <form className="form-horizontal" name="editProductForm" id="editProductForm" onSubmit={ props.handleEditProduct } >
        
        { props.product.id !== undefined && (<>
          <input type="hidden" name="id" id="id" value={ props.product.id } ref={ props.editFormHiddenIdField } />
        </>) }
        
        <div className='form-group'>
          <label className='col-md-4 control-label' htmlFor='name'>Name</label>
          <div className='col-md-12'>
            <input className='form-control' name='name' id='name' placeholder='Name' defaultValue={ props.product.name } type={'text'} ref={ props.editFormNameInput } />
          </div>
        </div>

        <div className='form-group'>
          <label className='col-md-6 control-label' htmlFor='price'>Price</label>
          <div className='col-md-6'>
            <input className='form-control' name='price' id='price' placeholder='1.99' defaultValue={ props.product.price } type={'number'} step={'.01'} min={'0'} inputMode={'decimal'} ref={ props.editFormPriceInput } />
          </div>
        </div>

        <div className='form-group'>
          <label className='col-md-6 control-label' htmlFor='quantity'>Quantity on Hand</label>
          <div className='col-md-6'>
            <input className='form-control' name='quantity' id='quantity' placeholder='Quantity on hand' defaultValue={ props.product.quantity } type={'number'} step={'any'} min={'0'} ref={ props.editFormQuantityInput } />
          </div>
        </div>

        <div className='form-group'>
          <div className='col-md-6'>
            <Button 
              type='submit' 
              className='btn btn-primary btn-lg lead' 
            >
              Apply Update(s)
            </Button>
          </div>
        </div>

      </form>
    </>
  );
  return element;
};

export {EditProductForm};