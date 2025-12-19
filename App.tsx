
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GenerationStudio from './components/GenerationStudio';
import BrandingEditor from './components/BrandingEditor';
import Scheduler from './components/Scheduler';
import BillingModal from './components/BillingModal';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import Settings from './components/Settings';
import { CreditState, GeneratedImage, AppTab, SubscriptionLevel, User, AppConfig } from './types';
import { FREE_LIMIT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [showBilling, setShowBilling] = useState(false);
  
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    avatar: '',
    isLoggedIn: false,
    isDriveConnected: false
  });

  const [credits, setCredits] = useState<CreditState>({
    freeGenerationsRemaining: FREE_LIMIT,
    subscriptionLevel: 'none',
    creditsRemaining: 0,
    apiKeySet: false
  });

  const [config, setConfig] = useState<AppConfig>({
    stripePublicKey: '',
    canvaApiKey: '',
    blotatoApiKey: '',
    blotatoAccounts: []
  });

  useEffect(() => {
    const checkApiKey = async () => {
      // Check if API key is provided via environment (Vercel) or Native AI Studio
      const envKeyExists = !!process.env.API_KEY;
      let studioKeyExists = false;
      
      if (window.aistudio?.hasSelectedApiKey) {
        studioKeyExists = await window.aistudio.hasSelectedApiKey();
      }
      
      const hasKey = envKeyExists || studioKeyExists;
      setCredits(prev => ({ 
        ...prev, 
        apiKeySet: hasKey,
        // If an environment key is present, we grant initial credits for a "Full" experience
        creditsRemaining: envKeyExists ? 999 : prev.creditsRemaining 
      }));
    };
    checkApiKey();
  }, []);

  const handleStart = () => {
    if (!user.isLoggedIn) {
      alert("Please sign in to access the Production Studio.");
      return;
    }
    setActiveTab('studio');
  };

  const handleLogin = (mockUser: Partial<User>) => {
    setUser({
      name: mockUser.name || 'AI Creator',
      email: mockUser.email || 'creator@theshooter.pro',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name || 'AI'}`,
      isLoggedIn: true,
      isDriveConnected: false
    });
    setActiveTab('studio');
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
    
    setCredits(prev => {
      const count = newImages.length;
      if (prev.freeGenerationsRemaining > 0) {
        return { ...prev, freeGenerationsRemaining: 0 };
      }
      return { ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - count) };
    });
  };

  const handleUpdateImage = (oldId: string, newImage: GeneratedImage) => {
    setGallery(prev => prev.map(img => img.id === oldId ? newImage : img));
    if (selectedImage?.id === oldId) setSelectedImage(newImage);
    
    setCredits(prev => {
      return { ...prev, creditsRemaining: Math.max(0, prev.creditsRemaining - 1) };
    });
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
    return <LandingPage onStart={handleStart} onExplore={handleShowFeatures} onLogin={handleLogin} user={user} />;
  }

  if (activeTab === 'features') {
    return <FeaturesPage onBack={handleBackToLanding} onStart={handleStart} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        credits={credits}
        user={user}
        onOpenBilling={() => setShowBilling(true)}
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
                <div className="mt-12 flex items-center gap-6">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                        <i className="fa-solid fa-film text-slate-500"></i>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Lip Sync</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                        <i className="fa-solid fa-person-walking text-slate-500"></i>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Pose Direct</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                        <i className="fa-solid fa-music text-slate-500"></i>
                      </div>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Auto Sync</span>
                   </div>
                </div>
                <button 
                  onClick={() => setActiveTab('studio')}
                  className="mt-12 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black uppercase text-sm transition-all italic tracking-widest"
                >
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
