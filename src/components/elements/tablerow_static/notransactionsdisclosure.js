import React from "react";

const NoTransactionsDisclosure = () => {
  let el = (
    <tr>
      <td colSpan={'7'} className='text-center'>
        No transactions added.
      </td>
    </tr>
  );
  return el;
};

export { NoTransactionsDisclosure };