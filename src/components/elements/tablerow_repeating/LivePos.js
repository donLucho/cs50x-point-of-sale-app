import React from 'react';

const LivePos = (props) => {

  // console.log( "props", props );

  let { item , newTaxRateOne } = props;
  let { id, name, price, quantity } = item;
  let subTotal = quantity * price;
  let appliedTax = subTotal * newTaxRateOne;
  
  // console.log( "typeof quantity" , typeof quantity );
  // console.log( "typeof price" , typeof price );
  // console.log( "typeof props.newTaxRateOne" , typeof props.newTaxRateOne ); 
  // console.log( "typeof appliedTax" , typeof appliedTax );
  
  let element = (
    <>
      <tr>
        <td className='col-md-3'>{name}</td>
        <td className='col-md-1'>${Number( parseFloat( price ).toFixed(2) )}</td>
        <td className='col-md-2'>{quantity}</td>
        <td className='col-md-2'>${Number( parseFloat( subTotal ).toFixed(2) )}</td>
        <td className='col-md-2'>${Number( parseFloat( appliedTax ).toFixed(2) )}</td>
        <td className='col-md-1'>
          <button className='btn btn-danger' onClick={ () => { props.handleDelete( id ) } }>
            <i className="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    </>
  );

  return element;
};

export {LivePos};