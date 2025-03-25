import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Head from 'next/head';

export default function Home() {
  const [history, setHistory] = useState([]);
  const [isKeyValid, setIsKeyValid] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const [noStatusesMessage, setNoStatusesMessage] = useState(''); // Track no status message

  useEffect(() => {
    // Check if the secret key is stored in localStorage and if it's still valid
    const storedKeyTime = localStorage.getItem('keyTime');
    if (storedKeyTime) {
      const timeElapsed = Date.now() - storedKeyTime;
      // If the key is valid for 3 hours (10800000 milliseconds), allow access
      if (timeElapsed < 10800000) {
        setIsKeyValid(true);
      }
    }

    // Fetch status history
    const fetchHistory = async () => {
      setLoading(true); // Set loading to true while fetching data
      try {
        const q = query(collection(db, 'statuses'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);

        // Set noStatusesMessage if there are no statuses
        if (historyData.length === 0) {
          setNoStatusesMessage('No statuses available.');
        } else {
          setNoStatusesMessage('');
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setNoStatusesMessage('Failed to load statuses.');
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (statusId) => {
    try {
      await deleteDoc(doc(db, 'statuses', statusId)); // Delete the status from Firestore
      // After deletion, re-fetch the updated history
      setHistory((prevHistory) => prevHistory.filter((status) => status.id !== statusId));
    } catch (error) {
      console.error("Error deleting status:", error);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 mx-auto">
      <Head>
        <title>Status - Kimkorng Mao</title>
        
      </Head>
      <h2 className="mt-6 text-gray-500 dark:text-gray-400 text-sm">Recent Updates</h2>
      
      {/* Show loading spinner if data is being fetched */}
      {loading ? (
        <div className="flex justify-center items-center mt-6">
          <span className="loader">Loading...</span> {/* Replace with your preferred loading spinner */}
        </div>
      ) : (
        <ul id="history" className="mt-2 text-gray-600 dark:text-gray-400 text-sm space-y-2">
          {history.length === 0 ? (
            <li className="text-center text-gray-500 dark:text-gray-400">
              <div className='!w-8 mx-auto'>
                  <picture>
                    <source srcset="https://fonts.gstatic.com/s/e/notoemoji/latest/1f423/512.webp" type="image/webp"/>
                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f423/512.gif" alt="🐣" width="32" height="32"/>
                  </picture>
              </div>
              {noStatusesMessage} {/* Show message if no statuses */}
            </li>
          ) : (
            history.map((status, index) => (
              <li key={index} className="flex justify-between items-center text-xs">
                <div>
                  {status.stickerUrl && (
                    <img src={status.stickerUrl} alt="Sticker" className="mt-2 mb-2 w-auto h-12 rounded-lg" />
                  )}
                  {status.emoji} {status.text}
                  &nbsp;- {status.timestamp.toDate().toLocaleString()}
                </div>

                {/* Show delete button if the key is valid */}
                {isKeyValid && (
                  <button
                    onClick={() => handleDelete(status.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
