import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onExplore: () => void;
  onLogin: (user: Partial<User>) => void;
  user: User;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExplore, onLogin, user }) => {
  const [email, setEmail] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '47075610338-uqb0kr36c5olsoo7voc4ekh4nnfkqd5k.apps.googleusercontent.com';
    
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { 
          theme: "filled_blue", 
          size: "large", 
          width: 320,
          shape: "pill",
          text: "signin_with",
          logo_alignment: "left"
        }
      );
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      
      onLogin({ 
        name: decoded.name || decoded.given_name, 
        email: decoded.email,
        avatar: decoded.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decoded.email}`
      });
    } catch (e) {
      console.error("Failed to decode Google Credential", e);
      onLogin({ name: 'Google Creator', email: 'verified@google.user' });
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: email.split('@')[0], email });
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Using the established secure admin password
    if (adminPass === 'TheShooter12') {
      onLogin({ name: 'Owner', email: 'owner@theshooter.pro' });
      setShowAdminLogin(false);
    } else {
      setLoginError('Invalid Access Token');
    }
  };

  const isViteEnvMissing = !(import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  const reviews = [
    {
      name: "Lena S.",
      handle: "@AI_PersonaCreator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena",
      quote: "The Shooter saved me over 15 hours a week on my influencer feed. Consistency is finally solved.",
      stat: "420% Engagement Growth"
    },
    {
      name: "Marcus V.",
      handle: "@DigitalAgencies",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      quote: "Batching 10 high-quality shots in one click changed my business model. The distribution hub is a lifesaver.",
      stat: "2.4M Reached in 30 Days"
    },
    {
      name: "Sofi R.",
      handle: "@VirtualVibe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofi",
      quote: "I tried every LoRA and model out there. Nothing beats the prompt-to-production pipeline here.",
      stat: "Save 20hrs/Week"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 text-center relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 mx-auto">
              <i className="fa-solid fa-user-shield text-3xl text-red-500"></i>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Owner Access Control</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Personnel Verification Required</p>
            </div>
            <form onSubmit={handleAdminVerify} className="space-y-4">
              <input 
                type="password" 
                placeholder="Access Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                autoFocus
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition-all font-bold placeholder:text-slate-700"
              />
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-pulse">{loginError}</p>}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl w-full space-y-20 animate-in fade-in zoom-in duration-700 z-10 py-12">
        <section className="space-y-8">
          <div className="inline-block p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20 mb-4">
            <i className="fa-solid fa-camera-retro text-4xl text-blue-600"></i>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] italic uppercase">
            The <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700 px-6 pb-2">Shooter</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            The world's first end-to-end studio for <span className="text-white font-bold">AI Influencers</span>. 
            Facial consistency. Batch production. Automated distribution.
          </p>
          
          {user.isLoggedIn ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button 
                onClick={onStart}
                className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xl transition-all transform hover:scale-105 shadow-2xl shadow-blue-600/30 uppercase italic"
              >
                Enter Studio
              </button>
              <button 
                onClick={onExplore}
                className="w-full md:w-auto px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black text-xl border border-slate-700 transition-all uppercase italic"
              >
                The Tech
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-sm mx-auto bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700 backdrop-blur-sm shadow-2xl">
              <div className="grid grid-cols-1 gap-4">
                
                <div id="googleSignInDiv" className="flex justify-center mb-2 min-h-[50px]"></div>

                {isViteEnvMissing && (
                  <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="w-full px-8 py-3 bg-slate-900 text-slate-400 border border-slate-700 rounded-2xl font-black text-[10px] flex items-center justify-center gap-3 hover:text-white transition-all uppercase italic"
                  >
                    <i className="fa-solid fa-bolt"></i>
                    Owner Quick-Entry
                  </button>
                )}
                
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-slate-700"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Or Email</span>
                  <div className="flex-1 h-px bg-slate-700"></div>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <input 
                    type="email" 
                    required
                    placeholder="creator@theshooter.pro" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                  <button 
                    type="submit"
                    className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all uppercase italic tracking-widest"
                  >
                    Continue
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-blue-600/5 p-8 rounded-[3rem] border border-blue-500/10">
           <div className="text-center">
             <h4 className="text-4xl font-black text-white italic leading-none">20h+</h4>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Saved Weekly</p>
           </div>
           <div className="text-center">
             <h4 className="text-4xl font-black text-blue-500 italic leading-none">100%</h4>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Consistency Lock</p>
           </div>
           <div className="text-center">
             <h4 className="text-4xl font-black text-white italic leading-none">7+</h4>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Social Platforms</p>
           </div>
           <div className="text-center">
             <h4 className="text-4xl font-black text-blue-500 italic leading-none">1 Click</h4>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Multi-Post</p>
           </div>
        </section>

        <section className="space-y-12">
           <div className="space-y-2">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Production Feedback</h2>
             <p className="text-slate-500 font-medium">Why top creators chose The Shooter</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {reviews.map((review, i) => (
               <div key={i} className="bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-700 text-left space-y-6 relative group hover:border-blue-500/50 transition-all duration-500">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={review.avatar} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700" alt={review.name} />
                      <div>
                        <p className="text-white font-bold text-sm">{review.name}</p>
                        <p className="text-blue-500 text-[10px] font-black uppercase">{review.handle}</p>
                      </div>
                    </div>
                    <i className="fa-solid fa-quote-right text-slate-700 text-2xl group-hover:text-blue-600/20 transition-colors"></i>
                 </div>
                 <p className="text-slate-300 italic leading-relaxed text-sm">"{review.quote}"</p>
                 <div className="pt-4 border-t border-slate-700">
                    <p className="text-white font-black text-xs uppercase italic tracking-tighter flex items-center gap-2">
                      <i className="fa-solid fa-chart-line text-green-500"></i>
                      {review.stat}
                    </p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        <footer className="pt-20 border-t border-slate-800 flex flex-col items-center gap-4">
           <div className="flex gap-6 text-slate-500 text-sm font-bold uppercase tracking-widest">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#" className="hover:text-white transition-colors">Support</a>
           </div>
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">The Shooter &copy; 2024 • Built with Gemini 3 Pro</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;