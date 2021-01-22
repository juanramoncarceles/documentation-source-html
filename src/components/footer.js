import React from "react";

const Footer = () => {
  return (
    <footer className="p-3 text-center border-t border-gray-200">
      <span>
        © {new Date().getFullYear()},{" "}
        <a href="https://www.asuni.com/">Asuni Soft</a>
      </span>
    </footer>
  );
};

export default Footer;
