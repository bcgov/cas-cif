import StaticLayout from "./StaticLayout";

const LoadingFallback = () => {
  return (
    <StaticLayout showSubheader>
      <div className="shimmer-wrapper">
        <div className="shimmer-line" />
        <div className="shimmer-line" />
        <div className="shimmer-line" />
      </div>
      <style jsx>{`
        .shimmer-line {
          height: 20px;
          margin-top: 20px;
          background: #777;
          border-radius: 8px;
          animation: shimmer-animation 2s infinite linear;
          background: linear-gradient(
            to right,
            #eff1f3 4%,
            #e2e2e2 25%,
            #eff1f3 36%
          );
          background-size: 1000px 100%;
        }

        .shimmer-wrapper {
          width: 30vw;
          height: 100%;
          animation: shimmer-full-view 0.5s forwards
            cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes shimmer-full-view {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes shimmer-animation {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </StaticLayout>
  );
};

export default LoadingFallback;
