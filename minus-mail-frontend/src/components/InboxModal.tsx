import React from 'react';
import Modal from './Modal';
import Inbox from './Inbox';
import type { EmailData } from '../services/ApiService';
import styles from './InboxModal.module.css';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailList: EmailData[];
  userEmail: string;
  isLoading: boolean;
  emailData: EmailData | null;
  handleEmailSelect: (email: EmailData) => void;
}

const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  emailList,
  userEmail,
  isLoading,
  emailData,
  handleEmailSelect
}) => {
  const handleEmailSelectAndClose = (email: EmailData) => {
    handleEmailSelect(email);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`Inbox (${emailList.length} ${emailList.length === 1 ? 'email' : 'emails'})`}
    >
      <div className={styles.inboxContainer}>
        <Inbox
          emailList={emailList}
          userEmail={userEmail}
          isLoading={isLoading}
          emailData={emailData}
          handleEmailSelect={handleEmailSelectAndClose}
          isModal={true}
        />
      </div>
    </Modal>
  );
};

export default InboxModal; 