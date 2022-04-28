const LoadingSpinner = () => (
  <>
    <div className="spinner">
      {/* This is to keep compatibility with the progressive rendering  */}
      <div className="spinnerContent">Loading...</div>
    </div>
    <style jsx>
      {`
        div.loaderWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }
        .spinner {
          width: 40px;
          height: 40px;
          margin: 100px auto;
          background-color: #333;
          border-radius: 100%;
          -webkit-animation: sk-scaleout 1s infinite ease-in-out;
          animation: sk-scaleout 1s infinite ease-in-out;
        }
        .spinner > .spinnerContent {
          display: none;
        }
        @-webkit-keyframes sk-scaleout {
          0% {
            -webkit-transform: scale(0);
          }
          100% {
            -webkit-transform: scale(1);
            opacity: 0;
          }
        }
        @keyframes sk-scaleout {
          0% {
            -webkit-transform: scale(0);
            transform: scale(0);
          }
          100% {
            -webkit-transform: scale(1);
            transform: scale(1);
            opacity: 0;
          }
        }
      `}
    </style>
  </>
);
export default LoadingSpinner;
