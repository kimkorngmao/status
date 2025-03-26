import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Upload() {
  const [emoji, setEmoji] = useState('');
  const [text, setText] = useState('');
  const [sticker, setSticker] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [isKeyCorrect, setIsKeyCorrect] = useState(false);
  const router = useRouter();

  const correctKey = 'pasSw@rD!123'; // Secret key to access the form

  const moods = [
    { emoji: '😊', text: 'Happy', bg: 'bg-yellow-200', textColor: 'text-yellow-800' },
    { emoji: '😌', text: 'Calm', bg: 'bg-blue-200', textColor: 'text-blue-800' },
    { emoji: '😡', text: 'Angry', bg: 'bg-red-200', textColor: 'text-red-800' },
    { emoji: '😔', text: 'Sad', bg: 'bg-gray-200', textColor: 'text-gray-800' },
    { emoji: '😃', text: 'Excited', bg: 'bg-green-200', textColor: 'text-green-800' },
    { emoji: '🥱', text: 'Tired', bg: 'bg-purple-200', textColor: 'text-purple-800' },
    { emoji: '😍', text: 'Love', bg: 'bg-pink-200', textColor: 'text-pink-800' },
    { emoji: '🤯', text: 'Surprised', bg: 'bg-orange-200', textColor: 'text-orange-800' },
    { emoji: '😶', text: 'Neutral', bg: 'bg-teal-200', textColor: 'text-teal-800' }
  ];

  useEffect(() => {
    // Check if the secret key is stored in localStorage and if it's still valid
    const storedKeyTime = localStorage.getItem('keyTime');
    if (storedKeyTime) {
      const timeElapsed = Date.now() - storedKeyTime;
      // If the key is valid for 3 hours (10800000 milliseconds), allow access
      if (timeElapsed < 10800000) {
        setIsKeyCorrect(true);
      }
    }
  }, []);

  const handleKeySubmit = () => {
    if (secretKey === correctKey) {
      // Store the key time in localStorage for 3 hours
      localStorage.setItem('keyTime', Date.now().toString());
      setIsKeyCorrect(true);
    } else {
      alert('Incorrect key. Please try again.');
    }
  };

  const handleEmojiClick = async (selectedEmoji, selectedText) => {
    setEmoji(selectedEmoji);
    setText(`${selectedEmoji} ${selectedText}`);

    await addDoc(collection(db, 'statuses'), {
      emoji: selectedEmoji,
      text: selectedText,
      stickerUrl: null,
      timestamp: serverTimestamp(),
    });

    router.push('/');
  };

  const handleFileChange = (e) => {
    setSticker(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('image', sticker);

    const imgBBUrl = 'https://api.imgbb.com/1/upload';
    const imgBBApiKey = 'ff37a0062ff9e3a09a102b1f66e43eab'; // Replace with your ImgBB API Key

    try {
      const response = await fetch(`${imgBBUrl}?key=${imgBBApiKey}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const stickerUrl = result.data.url;

        await addDoc(collection(db, 'statuses'), {
          emoji,
          text,
          stickerUrl,
          timestamp: serverTimestamp(),
        });

        router.push('/');
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      alert('An error occurred while uploading the image.');
    }
  };

  const handleLogout = () => {
    // Clear the key time from localStorage and set isKeyCorrect to false
    localStorage.removeItem('keyTime');
    setIsKeyCorrect(false);
    router.push('/'); // Redirect to the home page
  };

  return (
    <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 mx-auto text-xs">
      {!isKeyCorrect ? (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Enter the Secret Key
          </h1>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter secret key"
            className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white mt-4"
          />
          <button
            onClick={handleKeySubmit}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg w-full"
          >
            Submit
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            How are you feeling today?
          </h1>

          <div className="mt-4 space-y-2 grid grid-cols-3 gap-2">
            {moods.map(({ emoji, text, bg, textColor }) => (
              <button
                key={emoji}
                className={`${bg} hover:bg-opacity-80 ${textColor} py-2 px-4 rounded-lg h-9 line-clamp-1`}
                onClick={() => handleEmojiClick(emoji, text)}
              >
                {emoji} {text}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your status..."
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
            />
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="border p-2 rounded w-full mt-2 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSubmit}
              className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg w-full"
            >
              Submit
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-500 text-sm">
              Go to home
            </a>
            <span> —</span>
            <button
              onClick={handleLogout}
              className="ml-3 text-red-500 text-sm hover:text-red-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
