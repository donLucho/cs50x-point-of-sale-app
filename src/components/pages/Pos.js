import React, { createRef, useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { format } from 'date-fns'; 
import { v1 as uuidv1 } from 'uuid';

import { ApiService } from '../../services/ApiService'; 
import { withAuth } from '../../hoc/withAuth';
import { LivePos } from '../elements/tablerow_repeating/LivePos';
import { NoDataDisclosure } from '../elements/tablerow_static/nodatadisclosure';
import { OptionProduct } from '../elements/option/OptionProduct';

const Pos = (props) => {

  // console.log("props", props);

  const AServ = new ApiService();

  // REFERENCE ATTRIBUTES
  let productIdRef = createRef(null);
  let productPriceRef = createRef(null);
  let productQuantityRef = createRef(null);
  let productNameRef = createRef(null);
  let productSelectRef = createRef(null);
  let paymentAmountRef = createRef(null);

  // STATEFUL VARIABLES
  
  // select element options  
  let [ selectedvalue, setSelectedvalue ] = useState(""); 
  let [ products, setProducts ] = useState( [] );

  // purchase ITEMS details
  let [ ordinal, setOrdinal ] = useState(0);
  let [ 
    newTaxRateOne , 
    // eslint-disable-next-line
    setNewTaxRateOne , 
  ] = useState( .045 );

  // transaction details
  let [ items, setItems ] = useState([]); 
  let [ grandTotal, setGrandTotal] = useState( 0 );
  let [ salesTax, setSalesTax ] = useState( 0 );

  // payment details
  let [ totalPayment , setTotalPayment ] = useState(0);
  let [ changeDue, setChangeDue] = useState(0);

  // modal booleans
  let [ addItemModal, setAddItemModal ] = useState(false);
  let [ checkOutModal, setCheckOutModal ] = useState(false);
  let [ amountDueModal, setAmountDueModal ] = useState(false);
  let [ receiptModal, setReceiptModal ] = useState(false);

  // ###################################  
  
  const setUpProductsOptions = async () => {
    
    const result = await AServ.getAllProducts();
    // await console.log( "result", await result );

    try{
      if( products !== await result ){
        setProducts( await result );
      }
    }
    catch(err){
      // console.log( "err", err );
    }
  };

  const fetchOptionsData = useCallback( async () => {
    await setUpProductsOptions();
    // eslint-disable-next-line
  } , [] );
  
  // ###################################
  useEffect( () => {
    fetchOptionsData();
    // eslint-disable-next-line
  } , [] );

  // ###################################
  
  const canBeSubmitted = () => { // console.log("selectedvalue" , selectedvalue );
    return selectedvalue.length > 0;
  };

  const paymentCanBeMade = () => { // console.log("totalPayment" , totalPayment );
    return totalPayment > 0;
  }; 

  const canCheckOut = () => {
    return grandTotal > 0;
  };

  const handleProductChange = (event) => {
    
    productQuantityRef.current.value = "1";
    setSelectedvalue( event.target.value );

    let productselection = (productSelectRef.current !== null && productSelectRef.current.value !== "") ? JSON.parse(productSelectRef.current.value) : productSelectRef.current.value;  
    // console.log( "productselection", productselection ); 

    productIdRef.current.value = productselection.id !== undefined ? productselection.id : "";
    productPriceRef.current.value = productselection.price !== undefined ? productselection.price : "";
    productNameRef.current.value = productselection.name !== undefined ? productselection.name : "";
    
    // console.log("productQuantityRef.current" , productQuantityRef.current);
    productQuantityRef.current.max = productselection.quantity !== undefined ? String( productselection.quantity ) : null;
    if( productselection === "" ){
      productQuantityRef.current.value = "1";
    }

  };

  const handleNewItemSubmission = (event) => {
    
    event.preventDefault(); 

    let { id, name, price } = JSON.parse(selectedvalue);
    
    var currentItem = Object.assign( 
      {} , 
      { "ordinal": ordinal } , 
      { "id": id } , 
      { "name": name } , 
      { "price": price } , 
      { "quantity": parseInt(productQuantityRef.current.value, 10) } , 
    ); 

    // console.log( "currentItem", currentItem ); 

    let updateditems = items.concat(currentItem);
    setItems( updateditems ); 
    setOrdinal( ordinal + 1 );
    setSelectedvalue( "" );
    customSetSubtotals(updateditems);
    customHideAddItemModal();
  };

  const customSetSubtotals = (updateditems) => {
    
    var totalSalesTax = 0; 
    var totalCost = 0;
    
    for( var i=0; i < updateditems.length; i++ ){
      // console.log( "updateditems[i].price" , updateditems[i].price );
      // console.log( "updateditems[i].quantity" , updateditems[i].quantity );
      var priceQuotient = updateditems[i].price * updateditems[i].quantity;
      var price = Number( parseFloat( priceQuotient ).toFixed(2) );
      var tax = Number( parseFloat( priceQuotient * newTaxRateOne ).toFixed(2) );
      totalCost = Number( parseFloat( totalCost + price ).toFixed(2) ); 
      totalSalesTax = Number( parseFloat( totalSalesTax + tax ).toFixed(2) ); 
      // console.log( "totalCost" , totalCost );
      // console.log( "totalSalesTax" , totalSalesTax );
    }
  
    setSalesTax( totalSalesTax );
    setGrandTotal( totalCost );
    
  };

  const handlePaymentSubmission = (event) => {
    
    event.preventDefault(); // console.log( "event", event );

    customHideCheckoutModal();
    
    // console.log( "grandTotal", grandTotal );
    // console.log( "salesTax", salesTax );
    // console.log( "totalPayment", totalPayment );

    var amountDifference = Number( parseFloat( (grandTotal + salesTax) - totalPayment).toFixed(2) );
    if( (grandTotal + salesTax) <= totalPayment ){
      setChangeDue( amountDifference );
      customShowReceiptModal(); 
      handleSaveToDB();
      setItems( [] );
    }
    else{
      setChangeDue( amountDifference );
      customShowAmountDueModal();
    }
  };

  const handleSaveToDB = async () => {

    let newTransaction = { 
      id: await uuidv1() ,
      date: await format( new Date(),'dd LLL y HH:mm:ss') , 
      total: await grandTotal, 
      items: JSON.stringify( await items ) , 
      tax: await salesTax , 
    };
    
    // await console.log( "newTransaction", await newTransaction ); 

    const result = await AServ.createTransaction(newTransaction);

    try{
      if( await result) {
        // await console.log( "New transaction successfully completed!" );
        // await console.log( "result", await result );
      }
    }
    catch(err){
      // console.log( "Transaction not completed!" );
      // console.log( "err", err);
    }
    
  };

  const handleDelete = (id) => {
    
    // console.log( "id", id ); 

    const objectToCull = items.find( el => el.id === id ); // console.log( "objectToCull" , objectToCull );

    let totalPrice = objectToCull.price * objectToCull.quantity;
    
    let priceDiff = Number( parseFloat( totalPrice ).toFixed(2) ); // console.log( "priceDiff", priceDiff );
    let adjustedTotal = Number( parseFloat( grandTotal - priceDiff ).toFixed(2) ); // console.log( "adjustedTotal", adjustedTotal );

    setGrandTotal( adjustedTotal ); 
    
    let taxDiff = Number( parseFloat( totalPrice * newTaxRateOne ).toFixed(2) ); // console.log( "taxDiff" , taxDiff );
    let adjustedTax = Number( parseFloat( salesTax - taxDiff ).toFixed(2) ); // console.log( "adjustedTax" , adjustedTax );

    setSalesTax( adjustedTax );
    
    let newitems = items.filter( (el) => {
      return el.id !== id;
    } );
    
    setItems( newitems );
    
  };

  const handleCheckOut = (event) => {
    event.preventDefault();
    customShowCheckoutModal();
  };

  const cleanSlate = () => {
    setSalesTax(0);
    setGrandTotal(0);
    setTotalPayment(0);
    setOrdinal(0);
    setChangeDue(0);
  };
  
  const customTransactionFinalizeAll = () => {
    customHideReceiptModal();
    cleanSlate();
  };

  const customTransactionResetAll = () => {
    setTotalPayment(0);
    customHideAmountDueModal();
  }

  const customUpdatePayment = (event) => { setTotalPayment( Number( parseFloat( event.target.value ) ) ); }; 

  const customHideCheckoutModal = () => { setCheckOutModal(false); };
  const customShowCheckoutModal = () => { setCheckOutModal(true); };

  const customHideAddItemModal = () => { setAddItemModal(false); };
  const customShowAddItemModal = () => { setAddItemModal(true); };

  const customHideReceiptModal = () => { setReceiptModal(false); };
  const customShowReceiptModal = () => { setReceiptModal(true); };
  
  const customHideAmountDueModal = () => { setAmountDueModal(false); };
  const customShowAmountDueModal = () => { setAmountDueModal(true); };

  // ###################################

  const mapProductOptions = ( product, idx ) => {
    const productProperties = {
      key: idx ,
      product: product ,
    };
    return <OptionProduct { ...productProperties } />;
  };

  const productOptionsList = () => {
    return products.map( mapProductOptions );
  };

  const mapItems = (item, idx, arr) => {
    
    var newProps = {
      key: idx , 
      item: item , 
      newTaxRateOne: newTaxRateOne ,
      handleDelete: handleDelete ,
    };
    
    return <LivePos {...newProps } />;
  };

  const renderLivePos = () => {
    return items.map( mapItems );
  };

  // ###################################
  // additional modal to be exported/imported

  var renderAmountDue = () => {
    let element = (
      <>
        <Modal show={ amountDueModal } onHide={customTransactionResetAll}>
          <Modal.Header closeButton>
            <Modal.Title>Amount Due</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>
              Amount Due:
              <span className='text-danger'>${changeDue} </span>
            </h3>
            <p>Customer payment incomplete. Correct and try again</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={customTransactionResetAll}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
    return element;
  };
  // ###################################

  // ###################################
  // additional modal to be exported/imported

  var renderReceipt = () => {
    let element = (
      <>
        <Modal show={ receiptModal } onHide={customTransactionFinalizeAll}>
          <Modal.Header closeButton>
            <Modal.Title>Receipt</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>
              Total: 
              <span className='text-danger'>${totalPayment} </span>
            </h3>
            <h3>
              Change Due: 
              <span className='text-success'>${changeDue} </span>
            </h3>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={customTransactionFinalizeAll}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
    return element;
  };
  // ###################################

  let element = (
    <>
      <div className='container'>
        <div className='text-center'>
          
          <div className="card-body">
            <h1 className="display-6">Welcome, { decodeURIComponent(props.profile.user.username) }!!!</h1>
            <div className="mb-2">
              This is the Point&#45;of&#45;sales page!
            </div>
          </div>

          <span className='lead'>
            Checkout Sub-Total
            <br />
            <span className='text-success checkout-total-price'>
              ${ grandTotal }
            </span>
          </span>
          <div>
            <Button variant='success' id='checkoutButton' onClick={ handleCheckOut } disabled={ !canCheckOut() } >
              <i className="fas fa-shopping-cart"></i>&nbsp;Checkout
            </Button>
            <div className='modal-body'>
              <Modal show={ checkOutModal } onHide={ customHideCheckoutModal }>
                <Modal.Header closeButton>
                  <Modal.Title>Checkout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className='lead'>
                    
                    <h3>
                      Total (incl. tax):
                      <span className='text-danger'>
                        &nbsp;${Number( parseFloat( grandTotal + salesTax ).toFixed(2) )}&nbsp;
                      </span>
                    </h3>
                    
                    <form className="form-horizontal" name="checkoutForm" id="checkoutForm" onSubmit={handlePaymentSubmission}>
                      
                      <div className='form-group'>
                        <div className='input-group'>
                          <div className='input-group-text'>$</div>
                          <input id='payment' className='form-control input-lg' name='payment' placeholder='1.99' type={'number'} step={'.01'} min={'0'} inputMode={'decimal'} onChange={ customUpdatePayment } ref={ paymentAmountRef } />
                        </div>
                      </div>

                      <div className='lead'>
                        <p className='text-danger'>Enter payment amount.</p>
                      </div>

                      <Button type='submit' disabled={ !paymentCanBeMade() } className='btn btn-primary btn-lg lead'>
                        Print Receipt
                      </Button>

                    </form>

                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" onClick={ customHideCheckoutModal }>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
        
        { renderAmountDue() }
        { renderReceipt() }

        <table className='pos table table-responsive table-striped table-hover'>
          <thead>
            <tr>
              <td colSpan={'6'} className='text-center'>
                <span className='float-start'>
                  <Button variant='default' onClick={ customShowAddItemModal }>
                    <i className="fas fa-plus"></i>&nbsp;Add Item
                  </Button>
                </span>
                <Modal show={ addItemModal } onHide={customHideAddItemModal}>
                  <Modal.Header closeButton>
                    <Modal.Title>Add Item(Product)</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    
                    <form onSubmit={ handleNewItemSubmission }>
                      <div className="mb-3">

                        <label htmlFor="disabledSelect" className="form-label">Select Your Product</label>
                        
                        <select onChange={handleProductChange} value={selectedvalue} ref={ productSelectRef } id="disabledSelect" className="form-select" >

                          <option value={''} defaultValue={''} >Select a Product</option>
                          
                          { productOptionsList() }
                          
                        </select>

                      </div>
                      
                      <p className="form-text">Select a product above</p>

                      <div className="input-group mb-3">
                        
                        <span className="input-group-text" id="Productname">Product</span>
                        
                        <input type={'text'} className="form-control" aria-label="name" aria-describedby="Productname" name='name' id='name' defaultValue={''} placeholder={'Tennis Shoes'} ref={productNameRef} readOnly />

                        <input type={'hidden'} name='id' id='id' defaultValue={''} ref={productIdRef} readOnly />
                        
                        <input type={'hidden'} name='price' id='price' defaultValue={''} ref={productPriceRef} readOnly />

                      </div>

                      <div className="input-group mb-3">
                        <span className="input-group-text" id="Quantity">Quantity</span>
                        <input className='form-control' name='quantity' id='quantity' placeholder='Quantity on hand' defaultValue={'1'} type={'number'} step={'any'} min={'1'} max={null} ref={ productQuantityRef } />
                      </div>
                      
                      <Button variant="primary" type='submit' disabled={ !canBeSubmitted() }>Add</Button>
                      
                    </form>
                    
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={customHideAddItemModal}>
                      Cancel
                    </Button>
                  </Modal.Footer>
                </Modal>
              </td>
            </tr>
            <tr className='titles'>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Sub&#45;Total</th>
              <th>Sales Tax</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            { items.length > 0 ? renderLivePos() : (<NoDataDisclosure />) } 
          </tbody>
        </table>
      </div>
    </>
  );
  return element;
};

const AdminPos = withAuth( Pos );
export { AdminPos };
