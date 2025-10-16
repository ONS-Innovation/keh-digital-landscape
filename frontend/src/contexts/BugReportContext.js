import { createContext, useState, useContext } from 'react';
import Modal from '../components/BugReport/Modal';

const BugReportContext = createContext();

export const useBugReport = () => useContext(BugReportContext);

export const BugReportProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBugReportModal = () => setIsModalOpen(true);
  const closeBugReportModal = () => setIsModalOpen(false);

  return (
    <BugReportContext.Provider value={{ openBugReportModal }}>
      {children}
      <Modal isOpen={isModalOpen} onClose={closeBugReportModal} />
    </BugReportContext.Provider>
  );
};
