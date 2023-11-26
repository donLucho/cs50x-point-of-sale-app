import React from "react";

const RepeatingProductItemCard = ( props ) => { 

  // console.log("props", props );
  
  let element = (
    <>
      <div className="col">
        <div className="card mb-4 rounded-3 shadow-sm border-primary">
          <div className="card-header py-3 text-bg-primary border-primary">
            <h4 className="my-0 fw-normal">{props.item.name}</h4>
          </div>
          <div className="card-body">
            <h3 className="card-title pricing-card-title">
              <small className="text-muted fw-light">
                { props.item.id }
              </small>
            </h3>
            <ul className="list-unstyled mt-3 mb-4">
              <li>${props.item.price}</li>
            </ul>
          </div>
          <div className="card-footer text-muted">
            Number Purchased: { props.item.quantity }
          </div>
        </div>
      </div>
    </>
  );
  return element;
  
};

export { RepeatingProductItemCard };