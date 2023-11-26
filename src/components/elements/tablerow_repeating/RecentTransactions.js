import React from 'react';
import { NavLink } from 'react-router-dom';

const RecentTransactions = (props) => {
  
  // console.log( "props", props );
  
  let element = (
    <>
      <tr className="total">
        <td className='col-md-2 text-center'>
          <NavLink to={`/transaction/${ props.transaction.id }`} role="button">
            { props.transaction.date }
          </NavLink>
        </td>
        <td className='col-md-2 text-center'>${ Number( parseFloat( props.transaction.total + props.transaction.tax ).toFixed(2) ) }</td>
      </tr>
    </>
  );
  return element;
};

export {RecentTransactions};