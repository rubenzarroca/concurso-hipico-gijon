import React from 'react';

export const Select = ({ children, ...props }) => (
  <select className="border border-gray-300 rounded-md p-2" {...props}>
    {children}
  </select>
);

export const SelectTrigger = Select;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, ...props }) => (
  <option {...props}>{children}</option>
);
export const SelectValue = ({ children }) => <>{children}</>;