import React, { createContext, useContext, useState } from 'react';

const QueueContext = createContext();

export function QueueProvider({ children }) {
  const [queueData, setQueueData] = useState([]);

  return (
    <QueueContext.Provider value={{ queueData, setQueueData }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueContext() {
  return useContext(QueueContext);
}
