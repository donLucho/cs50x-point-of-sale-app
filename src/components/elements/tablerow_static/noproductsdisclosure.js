import React from "react";

const NoProductDisclosure = () => {
  let el = (
    <tr>
      <td colSpan={'6'} className='text-center'>
        No products added.
      </td>
    </tr>
  );
  return el;
};

export { NoProductDisclosure };