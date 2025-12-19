import React, { useState, useRef } from 'react';
import { CreditState, GeneratedImage, BatchSize, User } from '../types';
import { generateBatchImages, generateSingleImage, enhancePrompt, analyzeCharacterDNA } from '../services/geminiService';
import { ASPECT_RATIOS, REFUND_DISCLAIMER } from '../constants';

interface GenerationStudioProps {
  onGenerate: (images: GeneratedImage[]) => void;
  onUpdateImage: (oldId: string, newImage: GeneratedImage) => void;
  credits: CreditState;
  user: User;
  onToggleDrive: () => void;
  onOpenBilling: () => void;
  onOpenEditor: (img: GeneratedImage) => void;
  onOpenDistribution: (img: GeneratedImage) => void;
  gallery: GeneratedImage[];
}

type RefCategory = 'face' | 'style' | 'scene';

const GenerationStudio: React.FC<GenerationStudioProps> = ({ 
  onGenerate, onUpdateImage, credits, user, onToggleDrive, onOpenBilling, onOpenEditor, onOpenDistribution, gallery 
}) => {
  const [masterPrompt, setMasterPrompt] = useState('');
  const [faceRefs, setFaceRefs] = useState<string[]>([]);
  const [styleRefs, setStyleRefs] = useState<string[]>([]);
  const [sceneRefs, setSceneRefs] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState<BatchSize>(3);
  const [selectedRatio, setSelectedRatio] = useState('3:4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [characterDNA, setCharacterDNA] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [zoomedImage, setZoomedImage] = useState<GeneratedImage | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<RefCategory | null>(null);

  const totalRefs = faceRefs.length + styleRefs.length + sceneRefs.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && activeCategory) {
      const remainingSlots = 15 - totalRefs;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          if (activeCategory === 'face') setFaceRefs(prev => [...prev, result].slice(0, 15));
          else if (activeCategory === 'style') setStyleRefs(prev => [...prev, result].slice(0, 15));
          else if (activeCategory === 'scene') setSceneRefs(prev => [...prev, result].slice(0, 15));
          // Reset DNA if face refs change
          if (activeCategory === 'face') setCharacterDNA(null);
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) e.target.value = '';
  };

  const removeReference = (category: RefCategory, index: number) => {
    if (category === 'face') {
      setFaceRefs(prev => prev.filter((_, i) => i !== index));
      setCharacterDNA(null);
    }
    else if (category === 'style') setStyleRefs(prev => prev.filter((_, i) => i !== index));
    else if (category === 'scene') setSceneRefs(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeDNA = async () => {
    if (faceRefs.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    setStatusMessage('Decoding Biometric DNA...');
    try {
      const dna = await analyzeCharacterDNA(faceRefs);
      setCharacterDNA(dna);
    } catch (err) {
      console.error(err);
      alert("DNA Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  const triggerUpload = (category: RefCategory) => {
    if (totalRefs >= 15) {
      alert("Total limit of 15 reference images reached.");
      return;
    }
    setActiveCategory(category);
    fileInputRef.current?.click();
  };

  const handleEnhance = async () => {
    if (!masterPrompt || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(masterPrompt);
      setMasterPrompt(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const startGeneration = async () => {
    if (!credits.apiKeySet) {
      if (window.aistudio?.openSelectKey) {
        if (confirm("Gemini 3 Pro Vision requires a personal API Key for image generation. Would you like to select yours now?")) {
           await window.aistudio.openSelectKey();
        } else {
          return;
        }
      } else {
        alert("Please configure your API Key in System Admin to start production.");
        return;
      }
    }

    const totalNeeded = batchSize;
    const isSubscribed = credits.subscriptionLevel !== 'none';
    const isFreeTrialActive = credits.freeGenerationsRemaining === 3;

    if (isFreeTrialActive && totalNeeded > 3 && !isSubscribed) {
        alert("The free trial is limited to 1 use of 3 images. Please select size 3 or upgrade.");
        return;
    }

    if (!isFreeTrialActive && !isSubscribed && credits.creditsRemaining < totalNeeded) {
        alert("Free trial exhausted. Please subscribe or buy credits.");
        onOpenBilling();
        return;
    }

    setIsGenerating(true);
    setStatusMessage('Syncing character and environment synergy...');
    
    try {
      const allRefs = [...faceRefs, ...styleRefs, ...sceneRefs];
      const images = await generateBatchImages(masterPrompt, allRefs, batchSize, selectedRatio, characterDNA || undefined);
      onGenerate(images);
      setMasterPrompt('');
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please verify your API key and network connection.");
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleRegenerate = async (img: GeneratedImage) => {
    if (!credits.apiKeySet) {
      alert("Please link your Gemini API Key to use the Redo feature.");
      return;
    }

    const isSubscribed = credits.subscriptionLevel !== 'none';
    if (!isSubscribed && credits.creditsRemaining < 1) {
       alert("Subscription or credits required for regeneration.");
       onOpenBilling();
       return;
    }

    if (confirm("Regenerating this shot uses 1 credit. Character likeness will persist. Proceed?")) {
      setRegeneratingId(img.id);
      try {
        const refParts = (img.originalRefs || []).map(ref => ({
          inlineData: {
            data: ref.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/png"
          }
        }));
        const newImg = await generateSingleImage(img.prompt, "CHARACTER OUTFIT PERSISTENCE", refParts, img.aspectRatio || "3:4", 0, 1, characterDNA || undefined);
        onUpdateImage(img.id, { ...newImg, originalRefs: img.originalRefs });
      } catch (err) {
        alert("Regeneration failed.");
      } finally {
        setRegeneratingId(null);
      }
    }
  };

  const handleSaveToDrive = (id: string) => {
    if (!user.isDriveConnected) {
      alert("Please connect your Google Drive first.");
      onToggleDrive();
      return;
    }
    alert(`Shot #${id} saved to 'TheShooter/Production' in Drive.`);
  };

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `shooter-shot-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RenderUploadBox = (category: RefCategory, label: string, icon: string, currentRefs: string[], subtitle: string) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
          {category === 'face' && currentRefs.length > 0 && (
            <button 
              onClick={handleAnalyzeDNA}
              disabled={isAnalyzing || !!characterDNA}
              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border transition-all ${
                characterDNA 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20'
              }`}
            >
              {isAnalyzing ? 'Analyzing...' : characterDNA ? 'Identity Locked' : 'Lock Identity'}
            </button>
          )}
          <span className="text-[10px] text-blue-500 font-bold">{currentRefs.length}/15</span>
        </div>
      </div>
      <div 
        onClick={() => triggerUpload(category)}
        className={`min-h-[100px] rounded-2xl border-2 border-dashed transition-all p-3 bg-slate-900 flex flex-col items-center justify-center cursor-pointer group ${
          totalRefs < 15 ? 'border-slate-800 hover:border-blue-600' : 'border-slate-800'
        }`}
      >
        {currentRefs.length === 0 ? (
          <div className="text-center">
            <i className={`fa-solid ${icon} text-2xl text-slate-700 mb-2 group-hover:text-blue-600`}></i>
            <p className="text-[10px] text-slate-600 leading-tight px-4">{subtitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 w-full">
            {currentRefs.map((ref, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg border border-slate-700 overflow-hidden group/img">
                <img src={ref} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeReference(category, idx); }}
                  className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <i className="fa-solid fa-trash-can text-white text-[10px]"></i>
                </button>
              </div>
            ))}
            {totalRefs < 15 && (
              <div className="aspect-square rounded-lg border border-dashed border-slate-700 flex items-center justify-center text-slate-700 hover:text-blue-600">
                <i className="fa-solid fa-plus text-xs"></i>
              </div>
            )}
          </div>
        )}
      </div>
      {category === 'face' && characterDNA && (
        <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg animate-in slide-in-from-top-2">
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1 italic">Extracted Biometrics:</p>
          <p className="text-[9px] text-blue-400 font-medium line-clamp-2 italic leading-tight">
            "{characterDNA}"
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Lightbox Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <div className="absolute top-8 right-8 flex gap-4">
             <button 
                onClick={(e) => { e.stopPropagation(); downloadImage(zoomedImage.url, zoomedImage.id); }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-blue-500/20 transition-all active:scale-95"
             >
                <i className="fa-solid fa-download"></i> Download Shot
             </button>
             <button onClick={() => setZoomedImage(null)} className="w-12 h-12 bg-slate-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center border border-slate-700 transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
             </button>
          </div>
          
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center group" onClick={e => e.stopPropagation()}>
             <img 
               src={zoomedImage.url} 
               className="max-w-full max-h-full rounded-[2rem] shadow-[0_0_100px_rgba(37,99,235,0.25)] border border-white/10 object-contain animate-in zoom-in duration-500" 
               alt="Blow up" 
             />
          </div>

          <div className="mt-12 w-full max-w-4xl text-center space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Shot Analysis</h3>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">Consistency: Locked</span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{zoomedImage.aspectRatio} Aspect</span>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto italic leading-relaxed">
              "{zoomedImage.prompt}"
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <i className="fa-solid fa-camera-retro text-blue-600"></i>
              Production Studio
            </h2>
            {credits.freeGenerationsRemaining === 3 && (
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-600/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                1 Trial Available (3 Images)
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleDrive}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                user.isDriveConnected 
                ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
              }`}
            >
              <i className="fa-brands fa-google-drive"></i>
              {user.isDriveConnected ? 'Drive Linked' : 'Link Drive'}
            </button>
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-700">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Biometric Link</span>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${characterDNA ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]'}`} 
                    style={{ width: `${(totalRefs / 15) * 100}%` }}
                  ></div>
              </div>
              <span className={`text-[10px] font-black ${characterDNA ? 'text-green-500' : 'text-blue-500'}`}>{totalRefs}/15</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-6 border-r border-slate-700/50 pr-6">
            {RenderUploadBox('face', 'Identity Matrix', 'fa-id-card', faceRefs, '3-5 facial angles')}
            {RenderUploadBox('style', 'Aesthetic DNA', 'fa-palette', styleRefs, 'Outfit & body goal')}
            {RenderUploadBox('scene', 'Environment', 'fa-mountain-sun', sceneRefs, 'Scene & props')}
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Frame Ratio</label>
                <select 
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Batch Size</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[3, 5, 8, 10].map(size => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size as BatchSize)}
                      className={`py-2 rounded-xl border font-black text-[10px] transition-all ${
                        batchSize === size 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Master Directive (Aesthetic & Vibe)</label>
                <button 
                  onClick={handleEnhance}
                  disabled={!masterPrompt || isEnhancing}
                  className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-2 transition-colors"
                >
                  {isEnhancing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magic-wand-sparkles"></i>}
                  Polish Script
                </button>
              </div>
              <textarea
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                placeholder="Ex: Narrative shoot in a neon-lit cyberpunk metropolis. Consistent chrome details..."
                className="w-full h-80 bg-slate-900 border border-slate-700 rounded-3xl p-8 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-inner text-lg leading-relaxed placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-4">
              <button
                disabled={isGenerating || !masterPrompt}
                onClick={startGeneration}
                className={`w-full py-6 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                  isGenerating || !masterPrompt
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-blue-600/40'
                }`}
              >
                {isGenerating ? (
                  <>
                    <i className="fa-solid fa-gear fa-spin"></i>
                    {statusMessage || 'Processing Campaign...'}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt"></i>
                    Launch {batchSize}-Shot Production
                  </>
                )}
              </button>
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50">
                <p className="text-[9px] font-black text-slate-600 leading-relaxed text-center uppercase tracking-widest">
                  <i className="fa-solid fa-shield-halved mr-2 text-blue-600"></i>
                  {REFUND_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
            <i className="fa-solid fa-film text-slate-700"></i>
            Production Dashboard
          </h3>
          {gallery.length > 0 && (
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
               Select an asset to begin Branding or Distribution
             </p>
          )}
        </div>
        
        {gallery.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-700 bg-slate-900/50">
            <i className="fa-solid fa-clapperboard text-6xl mb-6 opacity-10"></i>
            <p className="font-black uppercase tracking-[0.3em] opacity-30">Awaiting Directive</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {gallery.map((img, idx) => (
              <div key={img.id} className="group relative bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/10">
                <img 
                  src={img.url} 
                  alt="Production Asset" 
                  className="w-full aspect-[4/5] object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-700" 
                  onClick={() => setZoomedImage(img)} 
                />
                
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest pointer-events-none z-10">
                  Shot {gallery.length - idx}
                </div>

                {/* Top Overlay Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-30 pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSaveToDrive(img.id); }}
                      className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-xl hover:bg-blue-50 transition-colors pointer-events-auto"
                      title="Sync to Drive"
                    >
                      <i className="fa-brands fa-google-drive"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadImage(img.url, img.id); }}
                      className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-blue-500 transition-colors pointer-events-auto"
                      title="Download Locally"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setZoomedImage(img); }}
                      className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-xl border border-slate-700 hover:bg-slate-700 transition-colors pointer-events-auto"
                      title="Expand View"
                    >
                      <i className="fa-solid fa-expand"></i>
                    </button>
                </div>
                
                {/* Bottom Overlay Actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-end gap-4 pointer-events-none z-20">
                    <div className="grid grid-cols-2 gap-3 pointer-events-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenEditor(img); }} 
                        className="py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg active:scale-95"
                      >
                        Brand
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenDistribution(img); }} 
                        className="py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg active:scale-95"
                      >
                        Deploy
                      </button>
                    </div>
                    <button 
                      disabled={regeneratingId === img.id}
                      onClick={(e) => { e.stopPropagation(); handleRegenerate(img); }}
                      className="w-full py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors border border-slate-700 pointer-events-auto shadow-lg active:scale-95"
                    >
                      {regeneratingId === img.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-rotate"></i> Redo (1 Credit)</>}
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationStudio;