import React from "react";

const ProductsTable = ( props ) => {

  // console.log("props", props );
  
  let tablebody = (
    <>
      <div className="container">
        <div className="row">
          <div className="table-responsive-sm">
            
            <table className='table'>
              <thead>
                <tr>
                  <th scope='col'>ID</th>
                  <th scope='col'>Name</th>
                  <th scope='col'>Price</th>
                  <th scope='col'>Quantity</th>
                  <th scope='col'>Action</th>
                  <th scope='col'>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                { props.children }
              </tbody>
            </table>

          </div>
        </div>
      </div>
    </>
  );

  return tablebody;
  
};

export { ProductsTable };