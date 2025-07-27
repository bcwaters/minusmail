import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import EmailDisplay from './components/EmailDisplay'
import './App.css'

import AppBanner from './components/AppBanner'
import AppFooter from './components/AppFooter'
import { socketService } from './services/SocketService'
import { apiService, type EmailData } from './services/ApiService'
import Inbox from './components/Inbox'
import InboxModal from './components/InboxModal'

// Component that handles the email functionality with routing
function EmailApp() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  
  const [emailAddress, setEmailAddress] = useState(username || 'default')
  const [emailData, setEmailData] = useState<EmailData | null>(null)
  const [emailList, setEmailList] = useState<EmailData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  
  // Update email address when username param changes
  useEffect(() => {
    if (username) {
      setEmailAddress(username)
    }
  }, [username])

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    // Connect to socket with callbacks
    socketService.connect(emailAddress, {
      //check if the email is already in the list
    
      onNewEmail: (emailData: EmailData) => {
        
        // console.log('[FRONTEND] New email received:', emailData);
        // Only add new email to the list, do not update the viewer
        setEmailList(prev => {
          // console.log('[FRONTEND] Updating email list, current count:', prev.length);
          //check if the email is already in the list
          const isEmailInList = prev.some(email => emailData.id === email.id);
          if (isEmailInList) {
            // console.log('[FRONTEND] Email already in list, skipping');
            return prev;
          }
          const newList = [emailData, ...prev];
          // console.log('[FRONTEND] New email list count:', newList.length);
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

  const handleEmailUpdate = (newEmail: string) => {
    setEmailAddress(newEmail);
    // Navigate to the new URL
    navigate(`/${newEmail}`);
  };

  const handleInboxIconClick = () => {
    setIsInboxModalOpen(true);
  };

  const handleInboxModalClose = () => {
    setIsInboxModalOpen(false);
  };

  return (
    <div className="app-container">
      <div className="app-banner">
        <AppBanner 
          email={emailAddress} 
          setEmail={handleEmailUpdate} 
          emailList={emailList} 
          isLoading={isLoading} 
          emailData={emailData} 
          handleEmailSelect={handleEmailSelect}
          onLogoClick={handleInboxIconClick}
        />
      </div>
      <div className="main-content">

        <div className="email-container">
        {!isMobile && (
          <div className="email-sidebar">
            <Inbox 
              emailList={emailList}
              isLoading={isLoading}
              emailData={emailData}
              handleEmailSelect={handleEmailSelect}
              userEmail={emailAddress}
            />
          </div>
        )}
        <div className="email-display">

          <EmailDisplay email={emailData} username={emailAddress} />
        </div>
        </div>
      </div>

      <div className="app-footer">
        <AppFooter />
      </div>

      {/* Mobile Inbox Modal */}
      <InboxModal
        isOpen={isInboxModalOpen}
        onClose={handleInboxModalClose}
        emailList={emailList}
        userEmail={emailAddress}
        isLoading={isLoading}
        emailData={emailData}
        handleEmailSelect={handleEmailSelect}
      />
    </div>
  )
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmailApp />} />
        <Route path="/:username" element={<EmailApp />} />
      </Routes>
    </Router>
  )
}

export default App
