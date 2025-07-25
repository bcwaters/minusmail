import type { EmailData } from '../services/ApiService';
import minusMailBannerImage from '../assets/minusMailBannerImage.png';
import EmailInput from './EmailInput';
import styles from './AppBanner.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
interface AppBannerProps {
  email: string;
  setEmail: (email: string) => void;
  emailList: EmailData[];
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

function AppBanner(_props: AppBannerProps) {
  const [bannerFontSize, setBannerFontSize] = useState(window.innerWidth <= 600 ? '1.5rem' : '2.5rem');
  const [emailAddress, setEmailAddress] = useState(_props.email);
  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      setBannerFontSize(window.innerWidth <= 600 ? '1.5rem' : '2.5rem');
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEmailUpdate = (newEmail: string) => {
    setEmailAddress(newEmail);
    // Navigate to the new URL
    navigate(`/${newEmail}`);
  };

  return (
  
      <div className={styles.bannerContainer} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'column',

        // For mobile, override with -5px if needed
        ...(window.innerWidth <= 600 ? { marginLeft: '-5px', marginRight: '-5px', marginTop: '-5px', marginBottom: '15px' } : {})
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexDirection: window.innerWidth <= 600 ? 'column' : 'row',
          padding: '0 20px',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img 
              src={minusMailBannerImage} 
              alt="MinusMail Banner" 
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <h1 style={{
                color: '#fff',
                fontSize: bannerFontSize,
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
                textAlign: 'left',
                fontFamily: '"Libre Baskerville", Georgia, serif'
              }}>Check any MinusMail email address at any time</h2>
            </div>
          </div>
        
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: window.innerWidth <= 600 ? 'center' : 'flex-end',
            width: window.innerWidth <= 600 ? '100%' : 'auto',
            marginRight: window.innerWidth <= 600 ? '0' : '15px', 
            gap: '8px' 
          }}>
            <EmailInput currentEmail={emailAddress} onEmailUpdate={handleEmailUpdate} />
          </div>
        </div>
      </div>

  );
}

export default AppBanner;