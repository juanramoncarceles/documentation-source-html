import React from "react";
import PropTypes from "prop-types";

const ToggleNavButton = ({ open, setOpen }) => (
  <button
    type="button"
    aria-expanded={open}
    className="fixed z-50 bottom-4 right-4 w-16 h-16 rounded-full bg-gray-900 text-white block lg:hidden"
    onClick={() => setOpen(!open)}
  >
    <span className="sr-only">Open site navigation</span>
    <svg
      width="24"
      height="24"
      fill="none"
      className={`absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform ${
        open ? "opacity-0 scale-80" : ""
      }`}
    >
      <path
        d="M4 8h16M4 16h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <svg
      width="24"
      height="24"
      fill="none"
      className={`absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform ${
        open ? "" : "opacity-0 scale-80"
      }`}
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

ToggleNavButton.defaultProps = {
  open: false,
  setOpen: () => {},
};

ToggleNavButton.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
};

export default ToggleNavButton;
