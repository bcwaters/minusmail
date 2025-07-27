import styles from './AppFooter.module.css';

interface AppFooterProps {
  // Add any props if needed in the future
}

function AppFooter(_props: AppFooterProps) {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <div className={styles.footerTextContainer}>
            <span className={styles.footerText}>
              © MinusMail
            </span>
          </div>
        </div>
        

      </div>
    </div>
  );
}

export default AppFooter; 