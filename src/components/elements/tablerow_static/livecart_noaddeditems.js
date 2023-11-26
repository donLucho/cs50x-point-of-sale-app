import React from "react";

const NoAddedItems = () => {
  let el = (
    <>
      <tr>
        <td colSpan={'3'} className='text-bg-danger text-center'>
          <strong>Not Active:</strong> No items added at this time.
        </td>
      </tr>
    </>
  );
  return el;
};

export { NoAddedItems };