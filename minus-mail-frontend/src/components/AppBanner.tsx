import root from 'react-shadow';

function AppBanner() {
  return (
    <root.div>
      <div className="banner-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          flexDirection: 'column'
        }}>
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '800',
            letterSpacing: '3px',
            margin: '0',
         
            fontFamily: 'Georgia, Times New Roman, serif',
            textTransform: 'uppercase'
          }}>MinusMail</h1>
          <h2 style={{
            color: '#000',
            fontSize: '1rem',
            fontWeight: '800',
            margin: '10px 0 0 0',
            textAlign: 'center',
            fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, Helvetica, Arial, "Segoe UI", Roboto, sans-serif'
          }}>Check any minusmail email address at any time</h2>
        </div>
      </div>
    </root.div>
  );
}

export default AppBanner;