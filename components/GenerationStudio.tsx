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
    const manualKeyExists = !!localStorage.getItem('manual_gemini_api_key');
    let studioKeyExists = false;
    if (window.aistudio?.hasSelectedApiKey) {
      studioKeyExists = await window.aistudio.hasSelectedApiKey();
    }

    if (!credits.apiKeySet && !studioKeyExists && !manualKeyExists) {
      if (window.aistudio?.openSelectKey) {
        if (confirm("The production engine requires a linked API Key. Select your Gemini key now?")) {
           await window.aistudio.openSelectKey();
        } else {
          return;
        }
      } else {
        alert("Please configure your Gemini Key in the Billing Portal to start production.");
        onOpenBilling();
        return;
      }
    }

    const totalNeeded = batchSize;
    const isSubscribed = credits.subscriptionLevel !== 'none';
    const isFreeTrialActive = credits.freeGenerationsRemaining === 3;

    if (isFreeTrialActive && totalNeeded > 3 && !isSubscribed) {
        alert("The trial batch is limited to 3 images. Please update batch size or upgrade.");
        return;
    }

    if (!isFreeTrialActive && !isSubscribed && credits.creditsRemaining < totalNeeded) {
        alert("Credit balance insufficient. Please refill your studio.");
        onOpenBilling();
        return;
    }

    setIsGenerating(true);
    setStatusMessage('Synchronizing character DNA and aesthetic sequence...');
    
    try {
      const allRefs = [...faceRefs, ...styleRefs, ...sceneRefs];
      const images = await generateBatchImages(masterPrompt, allRefs, batchSize, selectedRatio, characterDNA || undefined);
      onGenerate(images);
      setMasterPrompt('');
      setFaceRefs([]);
      setStyleRefs([]);
      setSceneRefs([]);
      setCharacterDNA(null);
    } catch (err) {
      console.error(err);
      alert("Production aborted. Verify your API key and credit balance.");
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleRegenerate = async (img: GeneratedImage) => {
    const isSubscribed = credits.subscriptionLevel !== 'none';
    if (!isSubscribed && credits.creditsRemaining < 1) {
       alert("Refill required for individual shot regeneration.");
       onOpenBilling();
       return;
    }

    if (confirm("Regenerating this shot uses 1 credit. Character likeness will be preserved. Proceed?")) {
      setRegeneratingId(img.id);
      try {
        const refParts = (img.originalRefs || []).map(ref => ({
          inlineData: {
            data: ref.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/png"
          }
        }));
        const newImg = await generateSingleImage(img.prompt, "STRICT CHARACTER CONSISTENCY", refParts, img.aspectRatio || "3:4", 0, 1, characterDNA || undefined);
        onUpdateImage(img.id, { ...newImg, originalRefs: img.originalRefs });
      } catch (err) {
        alert("Regeneration sequence failed.");
      } finally {
        setRegeneratingId(null);
      }
    }
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
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-3">
          {category === 'face' && currentRefs.length > 0 && (
            <button 
              onClick={handleAnalyzeDNA}
              disabled={isAnalyzing || !!characterDNA}
              className={`text-[9px] font-black uppercase px-3 py-1 rounded-xl border transition-all ${
                characterDNA 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20'
              }`}
            >
              {isAnalyzing ? 'Decoding...' : characterDNA ? 'Identity Locked' : 'Analyze DNA'}
            </button>
          )}
          <span className="text-[10px] text-blue-500 font-bold">{currentRefs.length}/15</span>
        </div>
      </div>
      <div 
        onClick={() => triggerUpload(category)}
        className={`min-h-[120px] rounded-3xl border-2 border-dashed transition-all p-4 bg-slate-900 flex flex-col items-center justify-center cursor-pointer group ${
          totalRefs < 15 ? 'border-slate-800 hover:border-blue-600 shadow-inner' : 'border-slate-800'
        }`}
      >
        {currentRefs.length === 0 ? (
          <div className="text-center">
            <i className={`fa-solid ${icon} text-3xl text-slate-700 mb-3 group-hover:text-blue-600 transition-colors`}></i>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-tight">{subtitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 w-full">
            {currentRefs.map((ref, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl border border-slate-700 overflow-hidden group/img shadow-xl">
                <img src={ref} className="w-full h-full object-cover" alt="" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeReference(category, idx); }}
                  className="absolute inset-0 bg-red-600/80 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all duration-300"
                >
                  <i className="fa-solid fa-trash text-white text-xs"></i>
                </button>
              </div>
            ))}
            {totalRefs < 15 && (
              <div className="aspect-square rounded-2xl border border-dashed border-slate-700 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors">
                <i className="fa-solid fa-plus text-sm"></i>
              </div>
            )}
          </div>
        )}
      </div>
      {category === 'face' && characterDNA && (
        <div className="p-3 bg-blue-600/5 border border-blue-500/20 rounded-2xl animate-in slide-in-from-top-2">
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-1.5 italic">Character Profile Synced:</p>
          <p className="text-[10px] text-slate-400 font-medium line-clamp-2 italic leading-relaxed">
            "{characterDNA}"
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Lightbox Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <div className="absolute top-10 right-10 flex gap-5">
             <button 
                onClick={(e) => { e.stopPropagation(); downloadImage(zoomedImage.url, zoomedImage.id); }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
             >
                <i className="fa-solid fa-download"></i> Save Asset
             </button>
             <button onClick={() => setZoomedImage(null)} className="w-14 h-14 bg-slate-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center border border-slate-700 transition-all shadow-xl">
                <i className="fa-solid fa-xmark text-2xl"></i>
             </button>
          </div>
          
          <div className="relative max-w-full max-h-[80vh] flex items-center justify-center group" onClick={e => e.stopPropagation()}>
             <img 
               src={zoomedImage.url} 
               className="max-w-full max-h-full rounded-[3rem] shadow-[0_0_120px_rgba(37,99,235,0.2)] border border-white/5 object-contain animate-in zoom-in duration-500" 
               alt="Blow up" 
             />
          </div>

          <div className="mt-12 w-full max-w-4xl text-center space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Shot Telemetry</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[11px] font-black text-blue-400 uppercase tracking-widest">Likeness: 100% Consistent</span>
              <span className="px-5 py-2 bg-slate-800 border border-slate-700 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest">{zoomedImage.aspectRatio} Form Factor</span>
            </div>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto italic leading-relaxed px-6">
              "{zoomedImage.prompt}"
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-[3rem] p-10 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-12 relative z-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
              <i className="fa-solid fa-camera-retro text-blue-600"></i>
              Production Studio
            </h2>
            {credits.freeGenerationsRemaining === 3 && (
              <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-500/20 inline-block shadow-lg shadow-blue-900/10">
                1 Trial Slot Available (3 Images)
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onToggleDrive}
              className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all flex items-center gap-3 ${
                user.isDriveConnected 
                ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
              }`}
            >
              <i className="fa-brands fa-google-drive"></i>
              {user.isDriveConnected ? 'Sync Enabled' : 'Link Drive'}
            </button>
            <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-[1.5rem] border border-slate-700 shadow-inner">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">DNA SYNC</span>
              <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-in-out ${characterDNA ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`} 
                    style={{ width: `${(totalRefs / 15) * 100}%` }}
                  ></div>
              </div>
              <span className={`text-[10px] font-black ${characterDNA ? 'text-green-500' : 'text-blue-500'}`}>{totalRefs}/15</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-4 space-y-8 border-r border-slate-700/50 pr-8">
            {RenderUploadBox('face', 'Facial Identity Matrix', 'fa-id-card', faceRefs, '3-5 Reference angles')}
            {RenderUploadBox('style', 'Aesthetic Blueprint', 'fa-palette', styleRefs, 'Outfit & Color Palette')}
            {RenderUploadBox('scene', 'Environmental Map', 'fa-mountain-sun', sceneRefs, 'Location & Props')}
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest px-1">Aspect Ratio</label>
                <select 
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-600 appearance-none shadow-xl"
                >
                  {ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest px-1">Batch Velocity</label>
                <div className="grid grid-cols-2 gap-2">
                  {[3, 5, 8, 10].map(size => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size as BatchSize)}
                      className={`py-3 rounded-2xl border font-black text-[11px] transition-all ${
                        batchSize === size 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30' 
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

          <div className="lg:col-span-8 space-y-10">
            <div className="relative group">
              <div className="flex justify-between items-center mb-4 px-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Master Campaign Directive</label>
                <button 
                  onClick={handleEnhance}
                  disabled={!masterPrompt || isEnhancing}
                  className="text-[11px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-3 transition-colors px-4 py-2 bg-blue-600/5 rounded-xl border border-blue-500/10"
                >
                  {isEnhancing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-magic-wand-sparkles"></i>}
                  Polish Narrative
                </button>
              </div>
              <textarea
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                placeholder="Ex: Minimalist editorial shoot in a Tokyo garden at dusk. Soft bokeh, 35mm film grain, high fashion streetwear..."
                className="w-full h-[420px] bg-slate-900 border border-slate-700 rounded-[2.5rem] p-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none shadow-inner text-xl leading-relaxed placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-6">
              <button
                disabled={isGenerating || !masterPrompt}
                onClick={startGeneration}
                className={`w-full py-8 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-5 shadow-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
                  isGenerating || !masterPrompt
                  ? 'bg-slate-750 text-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-blue-600/40'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {statusMessage || 'Initializing Sequence...'}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rocket"></i>
                    Launch {batchSize}-Shot Campaign
                  </>
                )}
              </button>
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50">
                <p className="text-[10px] font-black text-slate-600 leading-relaxed text-center uppercase tracking-[0.2em]">
                  <i className="fa-solid fa-user-shield mr-3 text-blue-600"></i>
                  {REFUND_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center px-6">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
            <i className="fa-solid fa-film text-slate-700"></i>
            Production Timeline
          </h3>
        </div>
        
        {gallery.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[4rem] text-slate-700 bg-slate-900/30 group">
            <i className="fa-solid fa-clapperboard text-7xl mb-8 opacity-10 group-hover:scale-110 transition-transform duration-500"></i>
            <p className="font-black uppercase tracking-[0.5em] opacity-30 italic">Awaiting Campaign Start</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {gallery.map((img, idx) => (
              <div key={img.id} className="group relative bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-600/20">
                <img 
                  src={img.url} 
                  alt="Production Asset" 
                  className="w-full aspect-[4/5] object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-1000" 
                  onClick={() => setZoomedImage(img)} 
                />
                
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest pointer-events-none z-10 shadow-2xl">
                  Asset #{gallery.length - idx}
                </div>

                {/* Interaction Overlays */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-30 pointer-events-none">
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadImage(img.url, img.id); }}
                      className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-colors pointer-events-auto active:scale-90"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setZoomedImage(img); }}
                      className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-2xl border border-slate-700 hover:bg-slate-700 transition-colors pointer-events-auto active:scale-90"
                    >
                      <i className="fa-solid fa-expand"></i>
                    </button>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end gap-5 pointer-events-none z-20">
                    <div className="grid grid-cols-2 gap-4 pointer-events-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenEditor(img); }} 
                        className="py-4 bg-white text-slate-950 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                      >
                        Brand Hub
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenDistribution(img); }} 
                        className="py-4 bg-blue-600 text-white rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95"
                      >
                        Deploy
                      </button>
                    </div>
                    <button 
                      disabled={regeneratingId === img.id}
                      onClick={(e) => { e.stopPropagation(); handleRegenerate(img); }}
                      className="w-full py-3.5 bg-slate-800 text-slate-400 hover:text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all border border-slate-700 pointer-events-auto shadow-xl active:scale-95"
                    >
                      {regeneratingId === img.id ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-rotate"></i> Sync Again (1 Cr)</>}
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
