import React from 'react';
import { initializeNotifications } from './notification/notifManager';

export default function App() {
  React.useEffect(() => {
    // Initialize notifications
    initializeNotifications();
  }, []);
  
  return (
    // ...rest of your App component code...
  );
}
