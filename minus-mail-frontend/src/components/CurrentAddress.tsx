import styles from './EmailSidebar.module.css';

interface CurrentAddressProps {
  currentAddress: string;
}

function CurrentAddress({ currentAddress }: CurrentAddressProps) {
  return (
    <div className={styles['current-address']} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', maxWidth: '350px' }}>
      <div className={styles['current-address-label']}>Current Address</div>
      <div className={styles['current-address-value']}>{`${currentAddress}@minusmail.com`}</div>
    </div>
  );
}

export default CurrentAddress; 