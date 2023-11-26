import React, { useCallback, useEffect, useState }  from 'react';
import { useParams } from 'react-router-dom'; // v6.4.5
import { format } from 'date-fns'; 

import { ApiService } from '../../services/ApiService'; 

import { withAuth } from '../../hoc/withAuth';  
import { RepeatingProductItemCard } from '../elements/card/RepeatingProductItemCard';

const ViewTransaction = () => {

  const AServ = new ApiService();  

  const { id } = useParams(); 
  // console.log( "id", id );
  
  const [ transactionId, setTransactionId ] = useState('');
  const [ tax, setTax ] = useState(0);
  const [ total, setTotal ] = useState(0);
  const [ date, setDate ] = useState('');
  const [ items, setItems ] = useState([]);

  let innerFunction = useCallback( async () => {
    
    const onetransactionpromise = await AServ.getOneTransaction(`${id}`).catch( (err) => {
      // console.log( "err", err );
    } ); 
    
    if( await onetransactionpromise !== undefined ){
      try{
        
        // await console.log( "onetransactionpromise", await onetransactionpromise );

        setTransactionId( await onetransactionpromise['id'] );
        setTax( await onetransactionpromise['tax'] );
        setTotal( await onetransactionpromise['total'] );
        setDate( await format( new Date( onetransactionpromise['date'] ),'LLL dd, y HH:mm:ss') ); 

        setItems( await onetransactionpromise['items'] );
      }
      catch( err ){
        // console.log( "err", err );
      }
    }
    
  // eslint-disable-next-line
  } , [id] );

  useEffect( () => {
    innerFunction();
    return () => {};
  } , [ innerFunction ]);

  const mapItems = (item, idx, arr) => { 
    var newProps = {
      key: idx , 
      item: item , 
    };    
    return <RepeatingProductItemCard {...newProps } />;
  };

  const renderItems = () => {
    return items.map( mapItems );
  };

  let element = (
    <>
      <div className="container">
        <main>
          <h2 className="display-6 text-center mb-2">Transaction ID -- { transactionId }</h2>
          <div className="pb-4">
            <div className="row">
              <div className="col-md-6 mx-auto">
                <h5 className="card-title">{ date }</h5>
                <div className="small">
                  Sub-total: ${ total }<br /> Tax: ${ tax } 
                </div>
              </div>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-3 mb-3 text-center">
            { renderItems() }
          </div>
        </main>
      </div>
    </>
  );
  return element;
};

const AdminViewTransaction = withAuth( ViewTransaction );
export { AdminViewTransaction };
