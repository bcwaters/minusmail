import type { EmailData } from '../services/ApiService';
import minusMailBannerImage from '../assets/minusmail_icon_2.png';
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
  onLogoClick?: () => void;
}

function AppBanner(_props: AppBannerProps) {
  const [bannerFontSize, setBannerFontSize] = useState(window.innerWidth <= 600 ? '1.5rem' : '2.5rem');
  const [emailAddress, setEmailAddress] = useState(_props.email);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 600;
      setBannerFontSize(mobile ? '1.5rem' : '2.5rem');
      setIsMobile(mobile);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEmailUpdate = (newEmail: string) => {
    setEmailAddress(newEmail);
    // Navigate to the new URL
    navigate(`/${newEmail}`);
  };

  const handleLogoClick = () => {
    if (isMobile && _props.onLogoClick) {
      _props.onLogoClick();
    }
  };

  return (
  
      <div className={styles.bannerContainer} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'column',

        // For mobile, override with -5px if needed
        ...(isMobile ? { marginLeft: '-5px', marginRight: '-5px', marginTop: '-5px', marginBottom: '15px' } : {})
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexDirection: isMobile ? 'column' : 'row',
          padding: '0 20px',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
         
            width: '100%'
          }}>

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
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '25px',
                cursor: isMobile ? 'pointer' : 'default'
              }} onClick={handleLogoClick}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={minusMailBannerImage} 
                    alt="MinusMail Banner" 
                    style={{
                      margin: '0 0 0 0',
                      height: '60px',
                      width: 'auto',
                      objectFit: 'contain',
                      cursor: isMobile ? 'pointer' : 'default'
                    }}
                  />
                  {isMobile && _props.emailList.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '1px',
                      right: '-15px',
                      backgroundColor: '#D7ECFF',
                      border: '1px solid #999',
                      borderRadius: '10px',
                      padding: '4px 4px',
                      fontSize: '12px',
                      color: '#000',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      animation: 'badgePulse 0.6s ease-in-out'
                    }}>
                      {_props.emailList.length > 99 ? '99+' : _props.emailList.length}
                    </span>
                  )}
                </div>
                MinusMail
              </h1>
              <h2 style={{
                color: '#000',
                fontSize: '.9rem',
                fontWeight: '800',
                margin: '0 0 0 8px',
                textAlign: 'left',
                fontFamily: '"Libre Baskerville", Georgia, serif'
              }}>Instantly check any MinusMail email</h2>
            </div>
          </div>
        
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto',
            marginRight: isMobile ? '0' : '15px', 
            gap: '8px' 
          }}>
            <EmailInput currentEmail={emailAddress} onEmailUpdate={handleEmailUpdate} />
          </div>
        </div>
      </div>

  );
}

export default AppBanner;