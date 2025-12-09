import { useEffect, useState } from 'react';
import queueApi from '../api/queueApi';

// Custom hook to subscribe to live queue updates
export default function useQueueUpdates() {
  const [queueData, setQueueData] = useState([]);

  useEffect(() => {
    // TODO: Replace with real-time subscription (WebSocket / SSE)
    const fetchData = async () => {
      // const data = await queueApi.getCurrentQueue();
      // setQueueData(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return queueData;
}
