import React, { createRef, useCallback, useEffect, useState } from 'react';

// import axios from 'axios';
import { ApiService } from '../../services/ApiService'; 
import { withAuth } from '../../hoc/withAuth';  

import { format } from 'date-fns'; // import moment from 'moment'; 

// inventory/product -- http://127.0.0.1:5000/api/inventory/product/4LnOGa7VTkiyZnWP
// transaction -- http://127.0.0.1:5000/api/transactions/CndtdwsoPonJv9T5

// import { NoAddedItems } from '../elements/tablerow_static/livecart_noaddeditems';
import { NoRecentTransactions } from '../elements/tablerow_static/livecart_norecenttransactions';
import { RecentTransactions } from '../elements/tablerow_repeating/RecentTransactions';
// import { LiveTransactions } from '../elements/tablerow_repeating/LiveTransactions';

import Button from 'react-bootstrap/esm/Button';
import Modal from 'react-bootstrap/Modal';

const LiveCart = (props) => {

  const AServ = new ApiService();  

  const today = new Date();

  let startDateRef = createRef(null);
  let endDateRef = createRef(null);

  let [ startdate, setStartdate ] = useState(0);
  let [ enddate, setEnddate ] = useState(0);
  
  let [ customsalesfigures, setCustomSalesfigures ] = useState(0);
  let [ customtransactions, setCustomTransactions ] = useState([]); 

  let [ salesfigures, setSalesfigures ] = useState(0);
  let [ transactions, setTransactions ] = useState([]);
  
  // eslint-disable-next-line
  let [ liveTransactions, setLiveTransactions ] = useState([]);

  let [ clock, setClock ] = useState( new Date() );
  let [ searchByDateModal, setSearchByDateModal ] = useState(false);

  const getTransactions = async () => {
    
    const result = await AServ.getTodaysNumbers(`${new Date().toLocaleDateString()}`).catch( (err) => {
      // console.log( "getTodaysNumbers err", err );
    } );     
    
    if( await result !== undefined ){

      try{

        // await console.log( "result", await result );

        let { docs, numbers } = await result;

        if( transactions !== await docs ){
          // await console.log( "docs", await docs );
          setTransactions( await docs );
        }
        if( salesfigures !== await numbers ){
          // await console.log( "numbers", await numbers );
          setSalesfigures( await Number( parseFloat( numbers ).toFixed(2) ) );
        }
      }
      catch(err){
        // console.log( "err", err );
      }
    }

  };

  const fetchTransactionData = useCallback( async () => {
    await getTransactions();
    // eslint-disable-next-line
  } , [] );

  const realtimeclock = useCallback( async () => {
    let timerId = await setInterval( () => {
      return customTick();
    } , 60000 );     
    return () => { 
      clearInterval(timerId); 
    };
  } , [] );

  // ###################################

  useEffect( () => {
    fetchTransactionData();
    realtimeclock();
    // eslint-disable-next-line
  } , [] );

  // ###################################

  const processFormattedTime = () => {
    return format( clock ,' h:mm a'); // "1:45 AM"
  };
  
  const processCalendarDateString = () => {
    return format( today ,'EEEE, MMMM do, yyyy'); // "Wednesday, December 5th, 2022"
  }; 

  const processGreetingString = () => {
    let greeting = `Good ${ (today.getHours() < 12 && 'Morning') || (today.getHours() < 17 && 'Afternoon') || 'Evening' }!`;
    return greeting; 
  };

  const customTick = () => {
    setClock( new Date() );
  };

  const customHideSearchByDateModal = () => setSearchByDateModal(false);
  const customShowSearchByDateModal = () => setSearchByDateModal(true);

  const handleSearchSubmission = async (event) => {

    event.preventDefault();

    setStartdate( parseInt( startDateRef.current.valueAsNumber , 10 ) )
    setEnddate( parseInt( endDateRef.current.valueAsNumber , 10 ) );

    const searchFormData = new FormData();
    searchFormData.append("startdate", startDateRef.current.valueAsNumber ); 
    searchFormData.append("enddate", endDateRef.current.valueAsNumber ); 
    var startdate = searchFormData.get("startdate"); // console.log( "startdate", startdate ); 
    var enddate = searchFormData.get("enddate"); // console.log( "enddate", enddate ); 

    await AServ.getCustomRange(`${startdate}`,`${enddate}`)
    .then( (result) => {
      
      let { docs, numbers } = result;

      if( customtransactions !== docs ){
        setCustomTransactions( docs );
      }
      if( customsalesfigures !== numbers ){
        setCustomSalesfigures( Number( parseFloat( numbers ).toFixed(2) ) );
      }
      customHideSearchByDateModal(); 
      
    } )
    .catch( (err) => {
      console.log("err", err );
    } );

  };

  // ###################################

  const mapTransactions = (transaction, idx, arr) => {
    
    var newProps = {
      key: idx , 
      transaction: transaction , 
    };
    
    return <RecentTransactions {...newProps } />;
  };

  const renderTransactions = () => {

    return transactions.map( mapTransactions );
  };

  const mapLimitedTransactions = (transaction, idx, arr) => {
    
    var newProps = {
      key: idx , 
      transaction: transaction , 
    };
    
    return <RecentTransactions {...newProps } />;
  };

  const renderLimitedTransactions = () => {

    return customtransactions.map( mapLimitedTransactions );
  };
  
  let element = (
    <>
      <div className="container">

        <div className="clearfix">

          <div className='row'>

            <div className="col-md col-sm">
              
              <div className="card text-bg-light mb-3" >

                <div className="card-header text-center lead">
                  <h1 className="display-6">Welcome, { decodeURIComponent(props.profile.user.username) }!!!</h1>
                  <span>Checkout Items</span><br />
                  <span>{ processCalendarDateString() }</span><br />
                  <span>
                    { processFormattedTime() }
                  </span>
                </div>

              </div>
              
            </div> {/* .col-md-5.float-end */}

          </div> {/* .row */}

          <div className='row'>

            <div className="col-md-5 col-sm">
              
              <div className="card text-bg-light mb-3" >
                
                <div className="card-header text-center lead">
                  <span>{processGreetingString()}</span><br />
                  <span>Sales (last 24 hours)</span>: <span className="text-success checkout-total-price">&nbsp;{salesfigures>0 ?`$${salesfigures}`:'$0'}</span>
                </div>

                <div className="card-body">
                  <table className='table table-responsive table-striped table-hover'>
                    <thead>
                      <tr className="small">
                        <th className='text-center'>Date and Time</th>
                        <th className='text-center'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { ( transactions !== undefined && transactions.length > 0) ? renderTransactions() : (<NoRecentTransactions />) } 
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div> {/* .col-md-5.float-end */} 

            <div className="col-md-7 col-sm ">
              <div className="card text-bg-light mb-3" >
                

                <div className="card-header text-center lead">
                  <span>Search By Date(s)</span><br />
                   <span>From:</span>&nbsp; <span>{ ( startdate > 0 ) ? new Date(startdate).toLocaleDateString() : "--" }</span><br /> 
                   <span>To:</span>&nbsp; <span>{ ( enddate > 0 ) ? new Date(enddate).toLocaleDateString() : "--" }</span><br /> 
                   <span>Total Sales</span>: <span className="text-success checkout-total-price">&nbsp;{customsalesfigures>0 ?`$${customsalesfigures}`:'$0'}</span> 
                </div>

                <div className="card-body">
                <Button variant="info" className={'btn btn-warning float-end'} onClick={ () => customShowSearchByDateModal() }>
                  <i className="fas fa-search"></i>&nbsp; Search
                </Button>
                  <br />
                  <br />
                  <table className='table table-responsive table-striped table-hover'>
                    <thead>
                      <tr className="small">
                        <th className='text-center'>Date and Time</th>
                        <th className='text-center'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      { ( customtransactions !== undefined && customtransactions.length > 0) ? renderLimitedTransactions() : (<NoRecentTransactions />) }
                    </tbody>
                  </table>

                  <Modal show={searchByDateModal} onHide={customHideSearchByDateModal}>
                    <Modal.Header closeButton>
                      <Modal.Title>Enter dates to search</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      
                      <form className="form-horizontal" name="searchForm" id="searchForm" onSubmit={handleSearchSubmission}>
                        
                        <div className='form-group'>
                          <label htmlFor="from-date">
                            Start Date
                          </label>
                          <input className="form-control" type="date" name="from-date" id="from-date" ref={ startDateRef } required />
                        </div>

                        <div className='form-group'>
                          <label htmlFor="to-date">
                            End Date
                          </label>
                          <input className="form-control" type="date" name="to-date" id="to-date" ref={ endDateRef } required />
                        </div>

                        <Button type='submit' className='btn btn-primary btn-lg lead'>
                          Search Now
                        </Button>

                      </form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={customHideSearchByDateModal}>
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>

                </div>
              </div>
              
            </div> {/* .col-md-5.float-start */} 

          </div>

        </div> {/* .clearfix */}
      </div> {/* .container */}
    </>
  ); 
  return element;
};

const AdminLiveCart = withAuth( LiveCart );
export { AdminLiveCart };
