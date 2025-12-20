import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GenerationStudio from './components/GenerationStudio';
import BrandingEditor from './components/BrandingEditor';
import Scheduler from './components/Scheduler';
import BillingModal from './components/BillingModal';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Settings from './components/Settings';
import { CreditState, GeneratedImage, AppTab, SubscriptionLevel, User, AppConfig } from './types';
import { FREE_LIMIT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [showBilling, setShowBilling] = useState(false);
  
  // Persistence Loading
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('shooter_user');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      avatar: '',
      isLoggedIn: false,
      isDriveConnected: false
    };
  });

  const [credits, setCredits] = useState<CreditState>(() => {
    const saved = localStorage.getItem('shooter_credits');
    return saved ? JSON.parse(saved) : {
      freeGenerationsRemaining: FREE_LIMIT,
      subscriptionLevel: 'none',
      creditsRemaining: 0,
      apiKeySet: false
    };
  });

  const [config, setConfig] = useState<AppConfig>({
    stripePublicKey: 'mk_1Sfx5p0Z7icb3eU0ZY5FTKGm', // Live Key as per user instruction
    canvaApiKey: '',
    blotatoApiKey: '',
    blotatoAccounts: []
  });

  // Save State Changes
  useEffect(() => {
    if (user.isLoggedIn) {
      localStorage.setItem('shooter_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('shooter_credits', JSON.stringify(credits));
  }, [credits]);

  // Handle Owner Mode Activation & API Key Detection
  useEffect(() => {
    const checkApiKey = async () => {
      const envKeyExists = typeof process !== 'undefined' && !!process.env.API_KEY;
      const manualKeyExists = !!localStorage.getItem('manual_gemini_api_key');
      let studioKeyExists = false;
      
      if (window.aistudio?.hasSelectedApiKey) {
        studioKeyExists = await window.aistudio.hasSelectedApiKey();
      }
      
      const hasKey = envKeyExists || studioKeyExists || manualKeyExists;
      const isAdmin = user.email === 'owner@theshooter.pro';

      setCredits(prev => ({ 
        ...prev, 
        apiKeySet: hasKey,
        subscriptionLevel: isAdmin ? 'pro' : prev.subscriptionLevel,
        creditsRemaining: isAdmin ? 9999 : prev.creditsRemaining,
        freeGenerationsRemaining: isAdmin ? 0 : prev.freeGenerationsRemaining
      }));
    };
    checkApiKey();
  }, [user.email, showBilling]); // Re-check when billing closes in case they saved a key

  const handleStart = () => {
    if (!user.isLoggedIn) {
      setActiveTab('landing');
      return;
    }
    setActiveTab('studio');
  };

  const handleLogin = (mockUser: Partial<User>) => {
    setUser({
      name: mockUser.name || 'AI Creator',
      email: mockUser.email || 'creator@theshooter.pro',
      avatar: mockUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name || 'AI'}`,
      isLoggedIn: true,
      isDriveConnected: false
    });
    setActiveTab('studio');
  };

  const handleLogout = () => {
    // Clear all persistence
    localStorage.removeItem('shooter_user');
    localStorage.removeItem('shooter_credits');
    localStorage.removeItem('manual_gemini_api_key');
    
    // Reset states
    setUser({
      name: '',
      email: '',
      avatar: '',
      isLoggedIn: false,
      isDriveConnected: false
    });
    setCredits({
      freeGenerationsRemaining: FREE_LIMIT,
      subscriptionLevel: 'none',
      creditsRemaining: 0,
      apiKeySet: false
    });
    setGallery([]);
    setSelectedImage(null);
    setActiveTab('landing');
  };

  const toggleDrive = () => {
    setUser(prev => ({ ...prev, isDriveConnected: !prev.isDriveConnected }));
    if (!user.isDriveConnected) {
      alert("Google Drive connected! Images will now auto-sync to your 'TheShooter/Production' folder.");
    }
  };

  const handleShowFeatures = () => setActiveTab('features');
  const handleBackToLanding = () => setActiveTab('landing');

  const handleGenerate = (newImages: GeneratedImage[]) => {
    setGallery(prev => [...newImages, ...prev]);
    if (credits.creditsRemaining > 9000) return;
    setCredits(prev => {
      const count = newImages.length;
      if (prev.freeGenerationsRemaining > 0) {
        const remaining = Math.max(0, prev.freeGenerationsRemaining - count);
        return { ...prev, freeGenerationsRemaining: remaining };
      }
      return { ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - count) };
    });
  };

  const handleUpdateImage = (oldId: string, newImage: GeneratedImage) => {
    setGallery(prev => prev.map(img => img.id === oldId ? newImage : img));
    if (selectedImage?.id === oldId) setSelectedImage(newImage);
    if (credits.creditsRemaining > 9000) return;
    setCredits(prev => ({ ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - 1) }));
  };

  const navigateToBranding = (img: GeneratedImage) => {
    setSelectedImage(img);
    setActiveTab('branding');
  };

  const navigateToDistribution = (img: GeneratedImage) => {
    setSelectedImage(img);
    setActiveTab('distribution');
  };

  if (activeTab === 'landing') {
    return (
      <LandingPage 
        onStart={handleStart} 
        onExplore={handleShowFeatures} 
        onLogin={handleLogin} 
        user={user} 
        onViewPrivacy={() => setActiveTab('privacy')}
        onViewTerms={() => setActiveTab('terms')}
      />
    );
  }

  if (activeTab === 'features') {
    return <FeaturesPage onBack={handleBackToLanding} onStart={handleStart} />;
  }

  if (activeTab === 'privacy') {
    return <PrivacyPolicy onBack={() => setActiveTab(user.isLoggedIn ? 'studio' : 'landing')} />;
  }

  if (activeTab === 'terms') {
    return <TermsOfService onBack={() => setActiveTab(user.isLoggedIn ? 'studio' : 'landing')} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        credits={credits}
        user={user}
        onOpenBilling={() => setShowBilling(true)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'studio' && (
            <GenerationStudio 
              onGenerate={handleGenerate} 
              onUpdateImage={handleUpdateImage}
              credits={credits} 
              user={user}
              onToggleDrive={toggleDrive}
              onOpenBilling={() => setShowBilling(true)}
              onOpenEditor={navigateToBranding}
              onOpenDistribution={navigateToDistribution}
              gallery={gallery}
            />
          )}
          
          {activeTab === 'branding' && (
            <BrandingEditor 
              image={selectedImage} 
              gallery={gallery}
              credits={credits}
              config={config}
              onSelectImage={setSelectedImage}
              onOpenBilling={() => setShowBilling(true)}
              onSave={(updated) => {
                setGallery(prev => prev.map(i => i.id === updated.id ? updated : i));
                setSelectedImage(updated);
                setActiveTab('distribution');
              }}
              onCancel={() => setActiveTab('studio')}
            />
          )}
          
          {activeTab === 'distribution' && (
            <Scheduler 
              image={selectedImage}
              credits={credits}
              config={config}
              onUpdateConfig={(partial) => setConfig({ ...config, ...partial })}
              onOpenBilling={() => setShowBilling(true)}
              onPost={() => setActiveTab('studio')}
              onGoBackToEdit={() => setActiveTab('branding')}
            />
          )}

          {activeTab === 'motion' && (
             <div className="h-[80vh] flex flex-col items-center justify-center p-12 bg-slate-800 rounded-[3rem] border border-slate-700 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                  <i className="fa-solid fa-video text-5xl text-blue-600"></i>
                </div>
                <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">AI Motion Engine</h2>
                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-8">Coming Q1 2025</span>
                <p className="text-slate-400 max-w-xl mx-auto text-lg italic leading-relaxed">
                  Transform your consistent production shots into viral short-form video content. One-click Reels, TikToks, and Shorts generation for your AI Influencer.
                </p>
                <button onClick={() => setActiveTab('studio')} className="mt-12 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black uppercase text-sm transition-all italic tracking-widest">
                  Back to Production
                </button>
             </div>
          )}

          {activeTab === 'settings' && (
            <Settings onSave={(newCfg) => setConfig({ ...config, ...newCfg })} />
          )}
        </div>
      </main>

      {showBilling && (
        <BillingModal 
          credits={credits} 
          onClose={() => setShowBilling(false)} 
          setCredits={setCredits} 
        />
      )}
    </div>
  );
};

export default App;
