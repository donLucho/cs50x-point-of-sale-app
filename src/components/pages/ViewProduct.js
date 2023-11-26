import React, { useCallback, useEffect, useState }  from 'react';
import { useParams } from 'react-router-dom'; // v6.4.5

import { ApiService } from '../../services/ApiService'; 
import { withAuth } from '../../hoc/withAuth';  

const ViewProduct = () => { 

  const { id } = useParams(); 
  // console.log( "id", id );

  const AServ = new ApiService();
  
  const [ productId, setProductId ] = useState('');
  const [ price, setPrice ] = useState(0);
  const [ quantity, setQuantity ] = useState(0);
  const [ name, setName] = useState('');

  let innerFunction = useCallback( async () => {
    
    const oneproductpromise = await AServ.getOneProduct(`${id}`).catch( (err) => {
      // console.log( "err", err );
    } ); 
    

    if( await oneproductpromise !== undefined ){
      try{
        
        // await console.log( "oneproductpromise", await oneproductpromise );

        setProductId( await oneproductpromise['id'] );
        setPrice( await oneproductpromise['price'] );
        setQuantity( await oneproductpromise['quantity'] );
        setName( await oneproductpromise['name'] );
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
  } , [ innerFunction ] );
  
  let element = (
    <>
      <div className="container">
        <div className="py-5">
          <div className="row">
            <div className="col-md-6 mx-auto">
              <div className="card text-center">
                <div className="card-header">
                  <h1 className="mt-1">{ name }</h1>
                </div>
                <div className="card-body">
                  <h5 className="card-title">Product ID -- { productId }</h5>
                  <p className="card-text">${ price } each</p>
                </div>
                <div className="card-footer text-muted">
                  Number Currently In Stock: { quantity }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
  return element;
};

const AdminViewProduct = withAuth( ViewProduct );
export { AdminViewProduct };
