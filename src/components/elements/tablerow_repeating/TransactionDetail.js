import React from 'react';

const TransactionDetail = (props) => {

  // console.log( "props", props );
  
  let element = (
    <>
      <tr>
        <td className='text-center'>
          { props.item.quantity }
        </td>
        <td className='text-center'>
          { props.item.name }
        </td>
        <td className='text-center'>
          <span>${ Number( parseFloat( props.item.price * props.item.quantity ).toFixed(2) ) }</span>
          <br />
          <small className='small-text'>
            @<em>{ props.item.price } EA.</em>
          </small>
        </td>
      </tr>
    </>
  );

  return element;
};

export {TransactionDetail};