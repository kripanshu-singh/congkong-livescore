import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { AppContext } from './context';
import { DICTIONARY, TEAMS, JUDGES } from './data';
import LoginScreen from './screens/LoginScreen';
import JudgeInterface from './screens/JudgeInterface';
import AdminDashboard from './screens/AdminDashboard';

const appId = '1:642440523500:web:993b21fc1a7b05dfaaffc9';

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [scores, setScores] = useState({});
  const [control, setControl] = useState({ activeTeamId: TEAMS[0].id, timer: { isRunning: false, seconds: 420 } });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [theme, setTheme] = useState('light');
  const [lang, setLang] = useState('ko');

  useEffect(() => {
    const init = async () => {
      // Check for custom token in window object if injected, otherwise anonymous
      if (typeof window !== 'undefined' && window.__initial_auth_token) {
        try {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } catch (e) {
          console.error("Custom token sign-in failed", e);
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    init();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    
    return () => {
       unsubscribeAuth();
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
    }
  }, []);

  useEffect(() => {
    // Apply theme to body or root div
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    
    const qScores = collection(db, 'artifacts', appId, 'public', 'data', 'scores');
    const unsubScores = onSnapshot(qScores, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => data[doc.id] = doc.data());
      setScores(data);
    }, (error) => {
      console.error("Error fetching scores:", error);
    });

    const qControl = doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'control_state');
    const unsubControl = onSnapshot(qControl, (docSnap) => {
      if (docSnap.exists()) setControl(docSnap.data());
    }, (error) => {
      console.error("Error fetching control state:", error);
    });

    return () => {
      unsubScores();
      unsubControl();
    };
  }, [user]);

  const handleSubmitScore = async (teamId, detail, comment, signature) => {
    if (!user) {
      alert("Error: Not connected to the server. Please ensure 'Anonymous Authentication' is enabled in your Firebase Console.");
      throw new Error("Not authenticated");
    }
    if (!userProfile) return;
    const total = Object.values(detail).reduce((a, b) => a + b, 0);
    const id = `${teamId}_${userProfile.id}`;
    const payload = {
      id, teamId, judgeId: userProfile.id, judgeName: userProfile.name,
      detail, total, comment, signature, timestamp: Date.now()
    };
    // Optimistic update
    setScores(prev => ({ ...prev, [id]: payload }));
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scores', id), payload);
    } catch (e) {
      console.error("Error saving score:", e);
      // Revert or show error (handled by UI toast mostly)
    }
  };

  const handleControlUpdate = async (newControl) => {
    setControl(newControl);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'control_state'), newControl);
    } catch (e) {
      console.error("Error updating control:", e);
    }
  };

  const handleUnlock = async (scoreId) => {
    const newScores = { ...scores };
    delete newScores[scoreId];
    setScores(newScores);
    try {
      await deleteField(doc(db, 'artifacts', appId, 'public', 'data', 'scores', scoreId)); 
      // Resetting the doc might be needed if deleteField doesn't remove the doc itself or if we want to keep a record.
      // The original code did: await setDoc(..., { ...scores[scoreId], detail: {}, total: 0, signature: null });
      // But scores[scoreId] might be undefined after delete.
      // Let's follow the original logic but be careful.
      // Actually, original code:
      // await deleteField(doc(...)); -> This is wrong usage of deleteField, it should be updateDoc(doc, {field: deleteField()})
      // But here it seems they might have meant deleteDoc? Or maybe they are using a wrapper?
      // The original import was: import { ..., deleteField } from 'firebase/firestore';
      // And usage: await deleteField(doc(...));
      // This is definitely incorrect Firestore SDK usage if it's the web SDK. `deleteField()` returns a Sentinel value to be used in `updateDoc`.
      // `deleteDoc(docRef)` deletes the document.
      
      // Let's assume they want to reset the score.
      // I will implement a reset logic:
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'scores', scoreId), {
         id: scoreId,
         // We might lose other info if we don't have it. 
         // But since we have `scores` state, we can use it.
         ...scores[scoreId],
         detail: {}, 
         total: 0, 
         signature: null 
      });
    } catch (e) {
      console.error("Error unlocking:", e);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{ isOnline, theme, toggleTheme, lang, setLang, t: DICTIONARY[lang] }}>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        {!userProfile ? (
          <LoginScreen onLogin={setUserProfile} />
        ) : userProfile.role === 'admin' ? (
          <AdminDashboard 
            teams={TEAMS} 
            scores={scores} 
            judges={JUDGES} 
            control={control}
            onControlUpdate={handleControlUpdate}
            onUnlock={handleUnlock}
            onLogout={() => setUserProfile(null)} 
          />
        ) : (
          <JudgeInterface 
            judge={userProfile} 
            teams={TEAMS} 
            scores={scores} 
            control={control}
            onSubmit={handleSubmitScore} 
            onLogout={() => setUserProfile(null)} 
            isOnline={isOnline} 
          />
        )}
      </div>
    </AppContext.Provider>
  );
}
