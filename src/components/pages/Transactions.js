import React, { useCallback, useEffect, useState } from 'react';

import { ApiService } from '../../services/ApiService'; 
import { withAuth } from '../../hoc/withAuth';  

import { NoTransactionsDisclosure } from '../elements/tablerow_static/notransactionsdisclosure';
import { CompleteTransactions } from '../elements/tablerow_repeating/CompleteTransactions';

const Transactions = (props) => {

  // console.log( "props", props );

  const AServ = new ApiService(); 
  
  let [ transactions, setTransactions ] = useState([]);

  const getTransactions = async () => {

    const result = await AServ.getAllTransactions();
    // await console.log( "result", await result );

    try{
      if( transactions !== await result){
        // console.log( "result", result );
        const sortDesc = await result.sort( (a,b) => {
          return new Date( b.date ) - new Date( a.date );
        } );
        setTransactions( await sortDesc );
      }
    }
    catch(err){
      // console.log( "err", err );
    }
  }

  const fetchData = useCallback( async () => {
    await getTransactions();
    // eslint-disable-next-line
  } , [] );

  useEffect( () => {
    fetchData();
    // eslint-disable-next-line
  } , [] );

  const mapTransactions = (transaction, idx, arr) => {
    
    var newProps = {
      key: idx , 
      transaction: transaction , 
    };
    
    return <CompleteTransactions {...newProps } />;
  };

  const renderCompleteTransactions = () => {
    return transactions.map( mapTransactions );
  };
  
  let element = (
    <>
      <div className='container'>
        
        <div className="card-body">
          <h1 className="display-6">Welcome, { decodeURIComponent(props.profile.user.username) }!!!</h1>
          <div className="mb-2">
            This is the Transactions page!
          </div>
        </div>
        
        <table className='transactions table table-responsive table-striped table-hover'>
          <thead>
            <tr className='titles'>
              <th>Transaction ID</th>
              <th>Time</th>
              <th>Sub&#45;Total</th>
              <th>Sales Tax</th>
              <th>Items</th>
              <th>Show Items</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            { transactions.length > 0 ? renderCompleteTransactions() : (<NoTransactionsDisclosure />) } 
          </tbody>
        </table>
      </div>
    </>
  );

  return element;
};

const AdminTransactions = withAuth( Transactions );
export { AdminTransactions };
