import React from 'react';
import { NavLink } from 'react-router-dom';

const LiveTransactions = (props) => {

  // console.log( "props", props );
  
  let element = (
    <>
      <tr className="total">
        <td className='col-md-2 text-center'>{ props.livetransaction.quantity }</td>
        <td className='col-md-2 text-center'>
          <NavLink to={`/product/${ props.livetransaction.id }`}>
            { props.livetransaction.name }
          </NavLink>
        </td>
        <td className='col-md-2 text-center'>
          <span>${ Number( parseFloat( props.livetransaction.price * props.livetransaction.quantity ).toFixed(2) ) }</span>
          <br />
          <small className='small-text'>
            <em>(${ props.livetransaction.price } each)</em>
          </small>
        </td>
      </tr>
    </>
  );
  return element;
};

export {LiveTransactions};