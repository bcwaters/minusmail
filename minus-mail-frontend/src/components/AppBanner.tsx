import type { EmailData } from '../services/ApiService';
import minusMailBannerImage from '../assets/minusMailBannerImage.png';
import styles from './AppBanner.module.css';
interface AppBannerProps {
  email: string;
  setEmail: (email: string) => void;
  emailList: EmailData[];
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

function AppBanner(_props: AppBannerProps) {
  return (
  
      <div className={styles.bannerContainer} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          flexDirection: 'row',
          padding: '0 20px',
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
              textAlign: 'left',
              fontFamily: '"Libre Baskerville", Georgia, serif'
            }}>Check any minusmail email address at any time</h2>
          </div>
        </div>
      </div>

  );
}

export default AppBanner;