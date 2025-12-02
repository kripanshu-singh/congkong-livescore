import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { AppContext } from './context';
import { DICTIONARY, TEAMS, JUDGES } from './data';
import LoginScreen from './screens/LoginScreen';
import JudgeInterface from './screens/JudgeInterface';
import AdminDashboard from './screens/AdminDashboard';
import Footer from './components/Footer';

const appId = '1:642440523500:web:993b21fc1a7b05dfaaffc9';

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [teams, setTeams] = useState(TEAMS);
  const [judges, setJudges] = useState(JUDGES); // Initialize with default, will be overwritten by Firestore
  const [eventSettings, setEventSettings] = useState({});
  const [scores, setScores] = useState({});
  const [control, setControl] = useState({
    activeTeamId: null,
    globalLock: false,
    unlockedJudges: [],
    timer: { isRunning: false, seconds: 420 }
  });


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

    const qTeams = doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'teams');
    const unsubTeams = onSnapshot(qTeams, (docSnap) => {
      if (docSnap.exists()) {
        setTeams(docSnap.data().list || []);
      } else {
        // Initialize if not exists
        setDoc(qTeams, { list: TEAMS });
        setTeams(TEAMS);
      }
    }, (error) => {
      console.error("Error fetching teams:", error);
    });

    const qJudges = doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'judges');
    const unsubJudges = onSnapshot(qJudges, (docSnap) => {
      if (docSnap.exists()) {
        setJudges(docSnap.data().list || []);
      } else {
        // Initialize if not exists
        setDoc(qJudges, { list: JUDGES });
        setJudges(JUDGES);
      }
    }, (error) => {
      console.error("Error fetching judges:", error);
    });

    const qEventSettings = doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'event_settings');
    const unsubEventSettings = onSnapshot(qEventSettings, (docSnap) => {
      if (docSnap.exists()) {
        setEventSettings(docSnap.data() || {});
      } else {
        // Initialize with defaults if needed, or leave empty
        setDoc(qEventSettings, { 
          timerPresentation: 12, 
          timerQnA: 3,
          mainTitle: '25년 기술사업화',
          eventTime: '2025. 12. 03 (수)',
          location: 'CCEX Conf. 307호'
        });
      }
    }, (error) => {
      console.error("Error fetching event settings:", error);
    });

    return () => {
      unsubScores();
      unsubControl();
      unsubTeams();
      unsubJudges();
      unsubEventSettings();
    };
  }, [user]);

  const handleUpdateTeams = async (newTeams) => {
    if (!user) {
      alert("Error: You must be logged in to save changes.");
      return;
    }
    // Optimistic update
    setTeams(newTeams);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'teams'), { list: newTeams }, { merge: true });
    } catch (e) {
      console.error("Error updating teams:", e);
      alert("Failed to save team changes. Please check your connection.");
      // Revert if needed, but for now we rely on snapshot to correct it eventually or user retry
    }
  };

  const handleUpdateJudges = async (newJudges) => {
    if (!user) {
      alert("Error: You must be logged in to save changes.");
      return;
    }
    // Optimistic update
    setJudges(newJudges);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'judges'), { list: newJudges }, { merge: true });
    } catch (e) {
      console.error("Error updating judges:", e);
      alert("Failed to save judge changes. Please check your connection.");
    }
  };

  const handleUpdateEventSettings = async (newSettings) => {
    if (!user) {
      alert("Error: You must be logged in to save changes.");
      return;
    }
    // Optimistic update
    setEventSettings(newSettings);
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'event_settings'), newSettings, { merge: true });
    } catch (e) {
      console.error("Error updating event settings:", e);
      alert("Failed to save event settings. Please check your connection.");
    }
  };

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

  const handleGlobalLock = async (isLocked) => {
    const newControl = { ...control, globalLock: isLocked, unlockedJudges: [] }; // Reset exceptions on toggle
    handleControlUpdate(newControl);
  };

  const handleJudgeUnlock = async (judgeId) => {
    const currentUnlocked = control.unlockedJudges || [];
    let newUnlocked;
    if (currentUnlocked.includes(judgeId)) {
      newUnlocked = currentUnlocked.filter(id => id !== judgeId);
    } else {
      newUnlocked = [...currentUnlocked, judgeId];
    }
    const newControl = { ...control, unlockedJudges: newUnlocked };
    handleControlUpdate(newControl);
  };

  const handleSystemReset = async () => {
    if (!user) return;
    
    try {
      // 1. Delete all scores
      const qScores = collection(db, 'artifacts', appId, 'public', 'data', 'scores');
      const snapshot = await getDocs(qScores);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setScores({});

      // 2. Reset Teams to default
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'teams'), { list: TEAMS });
      setTeams(TEAMS);

      // 3. Reset Judges to default
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'judges'), { list: JUDGES });
      setJudges(JUDGES);

      // 4. Reset Event Settings to default
      const defaultSettings = { 
        timerPresentation: 12, 
        timerQnA: 3,
        mainTitle: '25년 기술사업화',
        eventTime: '2025. 12. 03 (수)',
        location: 'CCEX Conf. 307호'
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'event_settings'), defaultSettings);
      setEventSettings(defaultSettings);

      // 5. Reset Control State
      const defaultControl = {
        activeTeamId: null,
        globalLock: false,
        unlockedJudges: [],
        timer: { isRunning: false, seconds: 420 }
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'admin', 'control_state'), defaultControl);
      setControl(defaultControl);

      alert("System has been reset successfully.");
    } catch (e) {
      console.error("Error resetting system:", e);
      alert("Failed to reset system. Check console for details.");
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{ isOnline, theme, toggleTheme, lang, setLang, t: DICTIONARY[lang] }}>
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="grow">
          {!userProfile ? (
            <LoginScreen onLogin={setUserProfile} judges={judges} eventSettings={eventSettings} />
          ) : userProfile.role === 'admin' ? (
            <AdminDashboard 
              teams={teams} 
              setTeams={handleUpdateTeams}
              judges={judges}
              setJudges={handleUpdateJudges}
              eventSettings={eventSettings}
              onUpdateEventSettings={handleUpdateEventSettings}
              onSystemReset={handleSystemReset}
              scores={scores} 
              control={control}
              onControlUpdate={handleControlUpdate}
              onGlobalLock={handleGlobalLock}
              onJudgeUnlock={handleJudgeUnlock}
              onLogout={() => setUserProfile(null)} 
            />
          ) : (
            <JudgeInterface 
              judge={userProfile} 
              teams={teams} 
              scores={scores} 
              control={control}
              onSubmit={handleSubmitScore} 
              onLogout={() => setUserProfile(null)} 
              isOnline={isOnline} 
            />
          )}
        </div>
        <Footer />
      </div>
    </AppContext.Provider>
  );
}
