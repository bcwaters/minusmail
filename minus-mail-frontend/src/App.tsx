import { useState, useEffect } from 'react'
import EmailDisplay from './components/EmailDisplay'
import './App.css'
import EmailSidebar from './components/EmailSidebar'
import AppBanner from './components/AppBanner'
import { socketService } from './services/SocketService'
import { apiService, type EmailData } from './services/ApiService'

function App() {
  const [emailAddress, setEmailAddress] = useState('test')
  const [emailData, setEmailData] = useState<EmailData | null>(null)
  const [emailList, setEmailList] = useState<EmailData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    // Connect to socket with callbacks
    socketService.connect(emailAddress, {
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
      onConnectError: () => setIsConnected(false),
      onNewEmail: (emailData: EmailData) => {
        console.log('[FRONTEND] New email received:', emailData);
        setEmailData(emailData);
        // Add new email to the list
        setEmailList(prev => {
          console.log('[FRONTEND] Updating email list, current count:', prev.length);
          const newList = [emailData, ...prev];
          console.log('[FRONTEND] New email list count:', newList.length);
          return newList;
        });
      }
    })

    // Fetch initial email data
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        const emails = await apiService.getEmailsForUsername(emailAddress);
        setEmailList(emails);
        // Set the most recent email as the current display
        if (emails.length > 0) {
          setEmailData(emails[0]);
        } else {
          setEmailData(null);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
        setEmailList([]);
        setEmailData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmails();

    // Cleanup on unmount or email change
    return () => {
      socketService.disconnect();
    };
  }, [emailAddress]);

  const handleEmailSelect = (email: EmailData) => {
    setEmailData(email);
  };

  return (
    <div className="app-container">
      <div className="app-banner">
        <AppBanner />
        <div style={{ 
          padding: '10px', 
          backgroundColor: isConnected ? '#4CAF50' : '#f44336',
          color: 'white',
          textAlign: 'center'
        }}>
          Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <div className="main-content">
        <div className="email-sidebar">
          <EmailSidebar email={emailAddress} 
                        setEmail={setEmailAddress} />
          
          {/* Email List */}
          <div style={{ marginTop: '20px', padding: '10px' }}>
            <h3>📬 Email List ({emailList.length})</h3>
            {isLoading ? (
              <div>Loading emails...</div>
            ) : emailList.length === 0 ? (
              <div>No emails yet</div>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {emailList.map((email, index) => (
                  <div 
                    key={index}
                    onClick={() => handleEmailSelect(email)}
                    style={{
                      padding: '8px',
                      margin: '4px 0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: emailData === email ? '#e3f2fd' : '#f9f9f9'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                      {email.subject || 'No Subject'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      From: {email.from}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                      {new Date(email.received).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="email-display">
          <EmailDisplay email={emailData} />
        </div>
      </div>
    </div>
  )
}

export default App
