import root from 'react-shadow';

function AppBanner() {

  return (
    <root.div>
      <style>{`
        .email-content {
          border: 1px solid #ddd;
          padding: 16px;
          max-width: 600px;
          margin: 0 auto;
          overflow-x: auto;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
      <div className="banner-content">
        <h1>MinusMail</h1>
      </div>
    </root.div>
  );
}

export default AppBanner;