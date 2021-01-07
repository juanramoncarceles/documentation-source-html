import React from "react";
import PropTypes from "prop-types";

const LandsLogo = ({ rootCssClasses }) => (
  <svg viewBox="0 0 250 44.29" className={rootCssClasses}>
    <g>
      <path
        d="M12.79.25s-2.68,13.53,3.79,22.32,20.09,7.48,20.09,7.48A21.44,21.44,0,0,0,34.4,14.88C30,6.72,20,4.42,16.61,3.11A8.44,8.44,0,0,1,12.79.25Z"
        fill="#dfdd00"
        opacity="0.7"
      />
      <path
        d="M37.27,25.52a23.06,23.06,0,0,0-2.79-10.69C30.7,7.78,22.71,5.09,18.41,3.64c-.69-.23-1.29-.44-1.76-.62A8.43,8.43,0,0,1,12.87.2L12.74,0l0,.23a39.14,39.14,0,0,0-.53,7.89c.13,4.1,1,9.95,4.34,14.51S25.17,29,29,29.7a32.42,32.42,0,0,0,5.75.51c1.16,0,1.87-.07,1.89-.07h.06l0-.06A17.15,17.15,0,0,0,37.27,25.52Zm-3-10.6c.3.57.57,1.13.82,1.68h0a25.4,25.4,0,0,1-2.49,10.92,46.87,46.87,0,0,1-5.28-4.23c.49-1,3.65-7.68,3-13.29A17.63,17.63,0,0,1,34.31,14.92Zm-21,.17A20.46,20.46,0,0,0,22,17.72h0c.6.8,1.22,1.57,1.85,2.28,1.08,1.21,2.15,2.3,3.2,3.28-1,0-7.38-.09-11.14-1.87A22.1,22.1,0,0,1,13.29,15.09ZM12.36,8.3A16.65,16.65,0,0,0,15.58,10c.47.19,1,.37,1.36.5a3.11,3.11,0,0,0,.57.15,62.46,62.46,0,0,0,4.34,6.85,20,20,0,0,1-8.62-2.69A33,33,0,0,1,12.36,8.3ZM22,17.38a62.42,62.42,0,0,1-4.33-6.84l.18-.31c.65-1.07,2.36-3.88,1.59-6,1.33.46,2.89,1,4.52,1.78C24.59,10.48,22.44,16.23,22,17.38Zm2,2.49c-.64-.72-1.27-1.5-1.88-2.31.34-.85,2.65-6.79,2-11.49a26.36,26.36,0,0,1,6,3.78h0c.71,5.51-2.39,12.16-2.95,13.31C26.15,22.18,25.07,21.09,24,19.87ZM16.58,3.2c.47.18,1.07.39,1.77.62l.85.29a.09.09,0,0,0,0,0c.84,2.09-.88,4.92-1.53,6l-.13.21A97.87,97.87,0,0,1,12.85.5,8.88,8.88,0,0,0,16.58,3.2ZM12.78.84a98.89,98.89,0,0,0,4.6,9.61,18,18,0,0,1-5-2.4A40.58,40.58,0,0,1,12.78.84Zm3.87,21.67q-.29-.4-.56-.81c3.88,1.71,10.13,1.77,11,1.77h.16a47.12,47.12,0,0,0,5.19,4.16,28,28,0,0,1-9,.15A16.76,16.76,0,0,1,16.66,22.51Zm12.41,7a25.37,25.37,0,0,1-5-1.43,28,28,0,0,0,3.36.2,25.93,25.93,0,0,0,5.22-.49h0A34.11,34.11,0,0,0,36.31,30,31.73,31.73,0,0,1,29.06,29.51Zm7.54.41a32.17,32.17,0,0,1-3.83-2.28A25.41,25.41,0,0,0,35.29,17a22.66,22.66,0,0,1,1.78,8.54A17.65,17.65,0,0,1,36.61,29.91Z"
        fill="#fff"
      />
    </g>
    <g>
      <path
        d="M6.72,6.22S4,19.75,10.51,28.53,30.6,36,30.6,36a21.44,21.44,0,0,0-2.27-15.17C24,12.69,13.91,10.39,10.54,9.08A8.44,8.44,0,0,1,6.72,6.22Z"
        fill="#92af1e"
        opacity="0.7"
      />
      <path
        d="M31.2,31.49A23.06,23.06,0,0,0,28.41,20.8C24.63,13.75,16.63,11.05,12.34,9.6,11.64,9.37,11,9.17,10.58,9A8.43,8.43,0,0,1,6.8,6.16L6.67,6l0,.23a39.14,39.14,0,0,0-.53,7.89c.13,4.1,1,9.95,4.34,14.51S19.1,35,23,35.66a32.42,32.42,0,0,0,5.75.51c1.16,0,1.87-.07,1.89-.07h.06l0-.06A17.15,17.15,0,0,0,31.2,31.49Zm-3-10.6c.3.57.57,1.13.82,1.68h0a25.4,25.4,0,0,1-2.49,10.92,46.87,46.87,0,0,1-5.28-4.23c.49-1,3.65-7.68,3-13.29A17.63,17.63,0,0,1,28.24,20.89Zm-21,.17a20.46,20.46,0,0,0,8.69,2.63h0c.6.8,1.22,1.57,1.85,2.28,1.08,1.21,2.15,2.3,3.2,3.28-1,0-7.38-.09-11.14-1.87A22.1,22.1,0,0,1,7.22,21.06Zm8.69,2.29a62.43,62.43,0,0,1-4.33-6.84l.18-.31c.65-1.07,2.36-3.88,1.59-6,1.33.46,2.89,1,4.52,1.78C18.52,16.44,16.37,22.19,15.91,23.34Zm-.14.14a20,20,0,0,1-8.62-2.69,33,33,0,0,1-.86-6.52A16.65,16.65,0,0,0,9.51,16c.47.19,1,.37,1.36.5a3.11,3.11,0,0,0,.57.15A62.47,62.47,0,0,0,15.77,23.48Zm2.15,2.36c-.64-.72-1.27-1.5-1.88-2.31.34-.85,2.65-6.79,2-11.49a26.37,26.37,0,0,1,6,3.78h0c.71,5.51-2.39,12.16-3,13.31C20.08,28.14,19,27.05,17.92,25.84ZM10.51,9.17c.47.18,1.07.39,1.77.62l.85.29a.09.09,0,0,0,0,0c.84,2.09-.88,4.92-1.53,6l-.13.21A97.88,97.88,0,0,1,6.78,6.46,8.88,8.88,0,0,0,10.51,9.17ZM6.71,6.81a98.89,98.89,0,0,0,4.6,9.61,18,18,0,0,1-5-2.4A40.58,40.58,0,0,1,6.71,6.81Zm3.87,21.67q-.29-.4-.56-.81c3.88,1.71,10.13,1.77,11,1.77h.16a47.11,47.11,0,0,0,5.19,4.16,28,28,0,0,1-9,.15A16.76,16.76,0,0,1,10.59,28.48Zm12.41,7A25.38,25.38,0,0,1,18,34a28,28,0,0,0,3.36.2,25.93,25.93,0,0,0,5.22-.49h0a34.11,34.11,0,0,0,3.64,2.19A31.73,31.73,0,0,1,23,35.47Zm7.54.4a32.16,32.16,0,0,1-3.83-2.28,25.41,25.41,0,0,0,2.51-10.66A22.66,22.66,0,0,1,31,31.48,17.66,17.66,0,0,1,30.54,35.88Z"
        fill="#fff"
      />
    </g>
    <g>
      <path
        d="M.65,12.18S-2,25.71,4.44,34.5,24.53,42,24.53,42a21.44,21.44,0,0,0-2.27-15.17C17.89,18.65,7.84,16.35,4.47,15A8.44,8.44,0,0,1,.65,12.18Z"
        fill="#4da92c"
        opacity="0.8"
      />
      <path
        d="M25.13,37.45a23.07,23.07,0,0,0-2.79-10.69C18.56,19.71,10.56,17,6.27,15.57,5.57,15.34,5,15.13,4.51,15A8.43,8.43,0,0,1,.73,12.13l-.13-.2,0,.23A39.14,39.14,0,0,0,0,20C.15,24.15,1,30,4.36,34.56S13,40.92,16.89,41.63a32.42,32.42,0,0,0,5.75.51c1.16,0,1.87-.07,1.89-.07h.06l0-.06A17.15,17.15,0,0,0,25.13,37.45Zm-3-10.6c.3.57.57,1.13.82,1.68h0a25.4,25.4,0,0,1-2.49,10.92,46.87,46.87,0,0,1-5.28-4.23c.49-1,3.65-7.68,3-13.29A17.63,17.63,0,0,1,22.17,26.85ZM1.15,27a20.46,20.46,0,0,0,8.69,2.63h0c.6.8,1.22,1.57,1.85,2.28,1.08,1.21,2.15,2.3,3.2,3.28-1,0-7.38-.09-11.14-1.87A22.1,22.1,0,0,1,1.15,27ZM.22,20.23a16.65,16.65,0,0,0,3.22,1.72c.47.19,1,.37,1.36.5a3.11,3.11,0,0,0,.57.15A62.46,62.46,0,0,0,9.7,29.45a20,20,0,0,1-8.62-2.69A33,33,0,0,1,.22,20.23Zm9.62,9.08a62.42,62.42,0,0,1-4.33-6.84l.18-.31c.65-1.07,2.36-3.88,1.59-6,1.33.46,2.89,1,4.52,1.78C12.45,22.41,10.3,28.16,9.84,29.31Zm2,2.49c-.64-.72-1.27-1.5-1.88-2.31.34-.85,2.65-6.79,2-11.49a26.36,26.36,0,0,1,6,3.78h0c.71,5.51-2.39,12.16-2.95,13.31C14,34.11,12.93,33,11.85,31.8ZM4.44,15.13c.47.18,1.07.39,1.77.62l.85.29a.09.09,0,0,0,0,0c.84,2.09-.88,4.92-1.53,6l-.13.21A97.87,97.87,0,0,1,.71,12.43,8.88,8.88,0,0,0,4.44,15.13ZM.64,12.77a98.9,98.9,0,0,0,4.6,9.61,18,18,0,0,1-5-2.4A40.58,40.58,0,0,1,.64,12.77ZM4.51,34.44Q4.22,34,4,33.63c3.88,1.71,10.13,1.77,11,1.77h.16a47.11,47.11,0,0,0,5.19,4.16,28,28,0,0,1-9,.15A16.76,16.76,0,0,1,4.51,34.44Zm12.41,7a25.38,25.38,0,0,1-5-1.44,28,28,0,0,0,3.36.2,25.93,25.93,0,0,0,5.22-.49h0a34.11,34.11,0,0,0,3.64,2.19A31.73,31.73,0,0,1,16.93,41.44Zm7.54.4a32.16,32.16,0,0,1-3.83-2.28,25.41,25.41,0,0,0,2.51-10.66,22.66,22.66,0,0,1,1.78,8.54A17.66,17.66,0,0,1,24.46,41.84Z"
        fill="#fff"
      />
    </g>
    <g fill="#434041">
      <path d="M45.91,8V32.69H57v3.2H42.28V8Z" />
      <path d="M73,16.21q1.68,1.64,1.68,5.22V35.89H71.24V32.57q-2.47,3.84-5.59,3.84A4.94,4.94,0,0,1,61.7,34.7,6.88,6.88,0,0,1,60.23,30V28.86A5.64,5.64,0,0,1,62,24.61a6.48,6.48,0,0,1,4.69-1.68,23.79,23.79,0,0,1,4.39.55V21.14a3.57,3.57,0,0,0-.83-2.64,3.58,3.58,0,0,0-2.58-.81,36.37,36.37,0,0,0-5.76.64V15.21a41.77,41.77,0,0,1,5.76-.64Q71.32,14.57,73,16.21ZM64.84,26.68a3.58,3.58,0,0,0-.94,2.64v.47a3.82,3.82,0,0,0,.73,2.47,2.26,2.26,0,0,0,1.83.9,3.76,3.76,0,0,0,2.37-1,9.81,9.81,0,0,0,2.24-2.84V26a19.38,19.38,0,0,0-3.5-.3A3.7,3.7,0,0,0,64.84,26.68Z" />
      <path d="M93.73,16.42a8.3,8.3,0,0,1,1.47,5.27v14.2H91.58V22.2q0-4.26-2.77-4.26a4.26,4.26,0,0,0-2.52.94,8.21,8.21,0,0,0-2.22,2.56V35.89H80.45V15.08h3.41v3.11a9.18,9.18,0,0,1,2.58-2.69,5.53,5.53,0,0,1,3.09-.94A5,5,0,0,1,93.73,16.42Z" />
      <path d="M115.5,35.89H112V32.52q-2.56,3.88-5.84,3.88a4.82,4.82,0,0,1-4.05-1.81,8.53,8.53,0,0,1-1.41-5.31V21.69a8,8,0,0,1,1.56-5.25,5.46,5.46,0,0,1,4.46-1.88,6.32,6.32,0,0,1,2.6.62,12.45,12.45,0,0,1,2.52,1.51V6.77h3.62Zm-10.3-17a5.42,5.42,0,0,0-.83,3.3v6.61q0,4.35,2.69,4.35a4.06,4.06,0,0,0,2.54-1,9.45,9.45,0,0,0,2.28-2.84V19.94a7.41,7.41,0,0,0-2.11-1.54,5.07,5.07,0,0,0-2.2-.6A2.8,2.8,0,0,0,105.2,18.9Z" />
      <path d="M131.75,15.08l-.08,3.07a18.14,18.14,0,0,0-4.05-.51q-3.84,0-3.84,2.47v.38a1.82,1.82,0,0,0,.41,1.24,4.63,4.63,0,0,0,1.47,1l4,1.88q3.62,1.71,3.62,5v.94a5.59,5.59,0,0,1-1.77,4.41q-1.73,1.47-5.44,1.47a24.61,24.61,0,0,1-5.5-.9l.17-3.24a19.49,19.49,0,0,0,5.25.94,5.28,5.28,0,0,0,2.9-.58,2.17,2.17,0,0,0,.81-1.9v-.43a2.85,2.85,0,0,0-.4-1.62,3.15,3.15,0,0,0-1.34-1l-4.14-1.83a6.79,6.79,0,0,1-2.75-2,4.56,4.56,0,0,1-.87-2.77v-.6A5.66,5.66,0,0,1,122,16q1.73-1.47,5.44-1.47A22.16,22.16,0,0,1,131.75,15.08Z" />
      <path d="M161.28,10.33Q164,13.21,164,18.62v7q0,5.2-2.75,8t-8,2.79q-3.62,0-7.59-.26V7.62q3.84-.17,7.8-.17Q158.53,7.45,161.28,10.33Zm-12,.28V33q2.52.26,4,.26a7.15,7.15,0,0,0,5.22-1.9,7.32,7.32,0,0,0,1.94-5.48V18.37q0-3.88-1.88-5.86a6.93,6.93,0,0,0-5.29-2Q151.92,10.52,149.27,10.6Z" />
      <path d="M182.07,16.53a7.89,7.89,0,0,1,1.88,5.67V26.6H173v2.52a4.08,4.08,0,0,0,1,3.13,4.78,4.78,0,0,0,3.3,1,28.52,28.52,0,0,0,5.54-.68l.09,3.16a36.31,36.31,0,0,1-5.67.73q-4.22,0-6.08-1.83t-1.85-5.67V22.2a8.06,8.06,0,0,1,1.81-5.67,7,7,0,0,1,5.44-2A7.21,7.21,0,0,1,182.07,16.53ZM174,18.64a4.23,4.23,0,0,0-1,3v2h7.33V21.78a4.39,4.39,0,0,0-1-3.11,3.54,3.54,0,0,0-2.71-1.07A3.45,3.45,0,0,0,174,18.64Z" />
      <path d="M199.13,15.08,199,18.15a18.14,18.14,0,0,0-4.05-.51q-3.84,0-3.84,2.47v.38a1.82,1.82,0,0,0,.41,1.24,4.63,4.63,0,0,0,1.47,1l4,1.88q3.62,1.71,3.62,5v.94a5.59,5.59,0,0,1-1.77,4.41q-1.73,1.47-5.44,1.47a24.61,24.61,0,0,1-5.5-.9l.17-3.24a19.49,19.49,0,0,0,5.25.94,5.28,5.28,0,0,0,2.9-.58,2.17,2.17,0,0,0,.81-1.9v-.43a2.85,2.85,0,0,0-.4-1.62,3.15,3.15,0,0,0-1.34-1l-4.14-1.83a6.79,6.79,0,0,1-2.75-2,4.56,4.56,0,0,1-.87-2.77v-.6A5.66,5.66,0,0,1,189.38,16q1.73-1.47,5.44-1.47A22.16,22.16,0,0,1,199.13,15.08Z" />
      <path d="M208.91,7.19a1.78,1.78,0,0,1,.62,1.45V9.88a1.71,1.71,0,0,1-.62,1.43,2.79,2.79,0,0,1-1.77.49,2.71,2.71,0,0,1-1.73-.49,1.71,1.71,0,0,1-.62-1.43V8.64a1.78,1.78,0,0,1,.62-1.45,2.63,2.63,0,0,1,1.73-.51A2.71,2.71,0,0,1,208.91,7.19Zm.06,7.89V35.89h-3.62V15.08Z" />
      <path d="M225.18,15.12l6.65-.09v3.2l-3.5-.09a7.41,7.41,0,0,1,.73,3.2v.94a6.73,6.73,0,0,1-1.92,5,7.31,7.31,0,0,1-5.37,1.9,12.78,12.78,0,0,1-3.62-.43,2.23,2.23,0,0,0-.94,1.75v.26a1.17,1.17,0,0,0,.43,1,3.38,3.38,0,0,0,1.66.4l6.35.47a4.74,4.74,0,0,1,3.18,1.47A4.59,4.59,0,0,1,230,37.38V39a5.53,5.53,0,0,1-.73,3,4.59,4.59,0,0,1-2.67,1.75,20,20,0,0,1-5.57.6,20.72,20.72,0,0,1-3.22-.3,31.43,31.43,0,0,1-3.52-.77l.13-3.37a22,22,0,0,0,6.74,1.32,15.61,15.61,0,0,0,3.43-.28,2.4,2.4,0,0,0,1.49-.83,3.08,3.08,0,0,0,.36-1.66v-.34a1.95,1.95,0,0,0-2-2.13l-6.4-.43a4.78,4.78,0,0,1-3.11-1.15,3.66,3.66,0,0,1-1.07-2.77v-.85a3.78,3.78,0,0,1,.49-1.83,4.82,4.82,0,0,1,1.43-1.58,4.82,4.82,0,0,1-1-2.07,12.77,12.77,0,0,1-.32-3.09v-.94a6.42,6.42,0,0,1,1.88-4.84,7.55,7.55,0,0,1,5.46-1.81A10,10,0,0,1,225.18,15.12ZM219,18.51a3.46,3.46,0,0,0-1,2.62v1.41a7.15,7.15,0,0,0,.28,2.32,1.66,1.66,0,0,0,1,1,6.43,6.43,0,0,0,2.18.28,4.11,4.11,0,0,0,2.94-.94,3.54,3.54,0,0,0,1-2.69V21.26a8.6,8.6,0,0,0-.51-3.11,7.47,7.47,0,0,0-1.39-.38,9.25,9.25,0,0,0-1.77-.17A3.83,3.83,0,0,0,219,18.51Z" />
      <path d="M248.53,16.42A8.3,8.3,0,0,1,250,21.69v14.2h-3.62V22.2q0-4.26-2.77-4.26a4.26,4.26,0,0,0-2.52.94,8.21,8.21,0,0,0-2.22,2.56V35.89h-3.62V15.08h3.41v3.11a9.18,9.18,0,0,1,2.58-2.69,5.53,5.53,0,0,1,3.09-.94A5,5,0,0,1,248.53,16.42Z" />
    </g>
  </svg>
);

LandsLogo.propTypes = {
  rootCssClasses: PropTypes.string,
};

LandsLogo.defaultProps = {
  rootCssClasses: "",
};

export default LandsLogo;
