import React from "react";

const Footer = () => {
  return (
    <footer className="p-3 text-center border-t border-gray-200">
      © {new Date().getFullYear()}, Asuni Soft
    </footer>
  );
};

export default Footer;
