import React from "react";

const CustomButton = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`btn-primary ${isActive ? "active" : ""}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
