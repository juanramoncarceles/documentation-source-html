import React from "react";
import { connectSearchBox } from "react-instantsearch-dom";

export default connectSearchBox(
  ({ refine, currentRefinement, onFocus, hasFocus }) => (
    <form className="flex flex-row-reverse items-center">
      <input
        className={`py-1 pr-6 pl-2 transition-all ${
          hasFocus ? "w-64 outline-subtle" : "w-32 outline-none cursor-pointer"
        }`}
        type="text"
        placeholder="Search"
        aria-label="Search"
        onChange={e => refine(e.target.value)}
        value={currentRefinement}
        onFocus={onFocus}
      />
      <svg
        viewBox="0 0 24 24"
        height="24"
        width="24"
        className="absolute w-5 m-1 pointer-events-none"
      >
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    </form>
  )
);
