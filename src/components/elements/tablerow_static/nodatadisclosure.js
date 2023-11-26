import React from "react";

const NoDataDisclosure = () => {
  let el = (
    <tr>
      <td colSpan={'6'} className='text-center'>
        No data displayed.
      </td>
    </tr>
  );
  return el;
};

export { NoDataDisclosure };