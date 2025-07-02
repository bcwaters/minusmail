import root from 'react-shadow';

function AppBanner() {
  return (
    <root.div>
      <style>{`
        .banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          flex-direction: column;
        }
        .banner-content h1 {
          color: #fff;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 2px;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .banner-content h2 {
          color: #e0e0e0;
          font-size: 1.1rem;
          font-weight: 400;
          margin: 10px 0 0 0;
          text-align: center;
        }
      `}</style>
      <div className="banner-content">
        <h1>MinusMail</h1>
        <h2>Free, open, temporary emails</h2>
      </div>
    </root.div>
  );
}

export default AppBanner;