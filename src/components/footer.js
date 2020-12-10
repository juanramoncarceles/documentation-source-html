import React from "react";

const Footer = () => {
  return (
    <footer className="p-3 text-center text-white bg-gray-500">
      © {new Date().getFullYear()}, Asuni Soft
    </footer>
  );
};

export default Footer;
