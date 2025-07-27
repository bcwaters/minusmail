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
  const [emailAddress, setEmailAddress] = useState(_props.email);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 700;
      setIsMobile(mobile);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll for logo opacity
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 20; // Adjust this value to control when opacity reaches minimum
      const minOpacity = 0; // Minimum opacity when scrolled
      
      if (scrollY <= 0) {
        setLogoOpacity(1);
      } else if (scrollY >= maxScroll) {
        setLogoOpacity(minOpacity);
      } else {
        // Linear interpolation between 1 and minOpacity
        const opacity = 1 - ((scrollY / maxScroll) * (1 - minOpacity));
        setLogoOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEmailUpdate = (newEmail: string) => {
    setEmailAddress(newEmail);
    // Navigate to the new URL
    navigate(`/${newEmail}`);
  };

  const handleLogoClick = () => {
    if (isMobile && _props.onLogoClick) {
      _props.onLogoClick();
    }else{
      window.location.href = '/';
    }
  };

  return (
    <>
      <div className={styles.logoContainer}>
        <img 
          onClick={handleLogoClick}
          src={minusMailBannerImage} 
          alt="MinusMail Banner" 
          className={`${styles.logoImage} ${isMobile ? styles.logoImageMobile : ''}`}
          style={{ opacity: logoOpacity }}
        />
        {isMobile && _props.emailList.length > 0 && (
          <span className={styles.badge}>
            {_props.emailList.length > 99 ? '99+' : _props.emailList.length}
          </span>
        )}
      </div>
      <div className={`${styles.bannerContainer} ${isMobile ? styles.bannerContainerMobile : ''}`}>
        <div className={`${styles.bannerContent} ${isMobile ? styles.bannerContentMobile : ''}`}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerTextContainer}>
              <h1 
                className={`${styles.bannerTitle} ${isMobile ? styles.bannerTitleMobile : ''}`}
                onClick={() => window.location.href = '/'}
              >
                MinusMail
              </h1>
            </div>
          </div>
        
          <div className={`${styles.bannerRight} ${isMobile ? styles.bannerRightMobile : ''}`}>
            <EmailInput currentEmail={emailAddress} onEmailUpdate={handleEmailUpdate} isMobile={isMobile} />
          </div>
        </div>
      </div>
    </>
  );
}

export default AppBanner;