import React from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { format } from 'date-fns'; 

import { TransactionDetail } from './TransactionDetail';

const CompleteTransactions = (props) => {

  // console.log( "props", props );

  let [ transactionModal, setTransactionModal ] = useState(false);

  const processRepeatedRowFormattedDate = () => {
    return format( new Date( props.transaction.date ),'M/dd/yyyy h:mm:ss a'); // 4/30/2023 4:39:44 PM
  };

  const processFormattedDate = () => {
    return format( new Date( props.transaction.date ),'LLL dd, y HH:mm:ss'); // "Dec 05, 2022 20:22:44"
  };

  const customHideTransactionModal = () => {
    setTransactionModal(false);
  };
  
  const customShowTransactionModal = () => {
    setTransactionModal(true);
  };

  const renderQuantity = (items) => {

    let totalquantity = 0;
    for( var i = 0; i < items.length; i++){
      totalquantity = totalquantity + items[i].quantity;
    }
    return totalquantity;
  };

  const mapTransactionDetail = ( item, idx, arr ) => {
    var newProps = {
      key: idx , 
      item: item , 
    };
    return <TransactionDetail { ...newProps } />;
  };

  const renderTransactionItems = () => {
    // return props.transaction.items.map( mapTransactionDetail );
    return JSON.parse(props.transaction.items).map( mapTransactionDetail );
  };
  
  // console.log( "props.transaction", props.transaction );

  let element = (
    <>
      <tr>
        <td>{props.transaction.id}</td>
        <td>{processRepeatedRowFormattedDate()}</td>
        <td>${props.transaction.total}</td>
        <td>${props.transaction.tax}</td>
        <td>{renderQuantity( JSON.parse( props.transaction.items ) )}</td>
        <td>
          <Button variant="info" onClick={customShowTransactionModal}>
            <i className="fas fa-window-restore"></i>
          </Button>
        </td>
        <td>
          <Modal show={ transactionModal } onHide={customHideTransactionModal}>
            <Modal.Header closeButton>
              <Modal.Title>Transaction Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="card text-white bg-primary mb-3">
                <div className="card-header text-center lead">{processFormattedDate()}</div>
                <div className="card-body">
                  <table className='receipt table table-responsive table-striped table-hover'>
                    <thead>
                      <tr className="small">
                        <th className='text-center'>Quantity</th>
                        <th className='text-center'>Product Name</th>
                        <th className='text-center'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { renderTransactionItems() }
                      <tr className="total">
                        <td colSpan={'3'} className='text-center' >Net Total: ${props.transaction.total} </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={customHideTransactionModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </td>
      </tr>
    </>
  );
  return element;
};


export {CompleteTransactions};