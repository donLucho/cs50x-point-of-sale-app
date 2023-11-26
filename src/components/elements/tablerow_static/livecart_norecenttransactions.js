import React from "react";

const NoRecentTransactions = () => {
  let el = (
    <>
      <tr>
        <td colSpan={'2'} className='text-bg-warning text-center'>
          No recent transactions available.
        </td>
      </tr>
    </>
  );
  return el;
};

export { NoRecentTransactions };