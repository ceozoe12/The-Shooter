import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage, BrandingConfig, CreditState, AppConfig } from '../types';
import { FONTS } from '../constants';

interface BrandingEditorProps {
  image: GeneratedImage | null;
  gallery: GeneratedImage[];
  credits: CreditState;
  config: AppConfig;
  onSelectImage: (img: GeneratedImage) => void;
  onOpenBilling: () => void;
  onSave: (img: GeneratedImage) => void;
  onCancel: () => void;
}

const BrandingEditor: React.FC<BrandingEditorProps> = ({ 
  image, 
  gallery,
  credits, 
  config, 
  onSelectImage,
  onOpenBilling, 
  onSave, 
  onCancel 
}) => {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    text: '@TheShooter',
    position: 'bottom-right',
    color: '#ffffff',
    fontFamily: FONTS[0].value,
    fontSize: 4
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Branding drawing
      ctx.font = `${Math.floor(img.width * (brandingConfig.fontSize / 100))}px ${brandingConfig.fontFamily}`;
      ctx.fillStyle = brandingConfig.color;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 15;
      
      const textWidth = ctx.measureText(brandingConfig.text).width;
      const padding = img.width * 0.05;
      
      let x = padding;
      let y = padding + Math.floor(img.width * (brandingConfig.fontSize / 100));

      if (brandingConfig.position === 'top-right') x = img.width - textWidth - padding;
      if (brandingConfig.position === 'bottom-left') y = img.height - padding;
      if (brandingConfig.position === 'bottom-right') {
        x = img.width - textWidth - padding;
        y = img.height - padding;
      }

      ctx.fillText(brandingConfig.text, x, y);
    };
  }, [image, brandingConfig]);

  const handleExport = () => {
    if (credits.subscriptionLevel !== 'pro') {
      alert("Brand Studio requires a Pro Subscription.");
      onOpenBilling();
      return;
    }
    if (!canvasRef.current || !image) return;
    const brandedUrl = canvasRef.current.toDataURL('image/png');
    onSave({
      ...image,
      url: brandedUrl,
      isBranded: true
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `shooter-branded-${image.id}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCanvaExport = () => {
    if (credits.subscriptionLevel !== 'pro') {
      alert("Canva Integration requires a Pro Subscription.");
      onOpenBilling();
      return;
    }

    if (!config.canvaApiKey) {
      alert("Please configure your Canva API Key in the System Admin tab.");
      return;
    }

    alert("Initializing Canva @beta SDK. Opening high-precision editor for production asset polishing...");
  };

  if (credits.subscriptionLevel !== 'pro' && image) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-12 bg-slate-800 rounded-3xl border border-slate-700 text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
          <i className="fa-solid fa-lock text-3xl text-blue-500"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          The Brand Studio and Canva integration are premium features. Upgrade your membership to start applying your unique handle and aesthetic to your influencers.
        </p>
        <div className="flex gap-4">
           <button onClick={onCancel} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold">Maybe Later</button>
           <button onClick={onOpenBilling} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold">Go Pro Now</button>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-12 bg-slate-800 rounded-3xl border border-slate-700 text-center">
        <i className="fa-solid fa-palette text-6xl text-slate-700 mb-6"></i>
        <h2 className="text-2xl font-bold text-white mb-2">No Image Selected for Branding</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Select an image from the Production Studio to start applying your aesthetic.
        </p>
        <button 
          onClick={onCancel}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Go to Production Studio
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-palette text-blue-600"></i>
            Brand Studio
            </h2>
            <button 
                onClick={handleCanvaExport}
                className="px-4 py-2 bg-[#00C4CC] hover:bg-[#00B4BB] text-white rounded-xl text-[10px] font-black flex items-center gap-2 uppercase transition-all shadow-lg shadow-[#00C4CC]/20"
            >
                <i className="fa-solid fa-wand-magic-sparkles"></i> Canva Beta Editor
            </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white font-medium uppercase text-xs tracking-widest">Cancel</button>
          <button onClick={handleDownload} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-black uppercase text-xs tracking-widest transition-all">
            <i className="fa-solid fa-download mr-2"></i> Download
          </button>
          <button onClick={handleExport} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/40 transition-all">Save Asset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gallery Thumbnails for Selection */}
        <div className="lg:col-span-2 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Shot List</p>
           {gallery.map((img, idx) => (
             <div 
               key={img.id} 
               onClick={() => onSelectImage(img)}
               className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group ${
                 image.id === img.id ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-700 hover:border-slate-500'
               }`}
             >
               <img src={img.url} className="w-full aspect-[4/5] object-cover" alt="Thumb" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase">
                 Edit
               </div>
               <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-[8px] text-white font-bold">
                 #{gallery.length - idx}
               </div>
             </div>
           ))}
        </div>

        {/* Editor Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-700 shadow-inner">
          <canvas ref={canvasRef} className="max-w-full h-auto max-h-[55vh] rounded shadow-2xl" />
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 space-y-4 shadow-xl">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Watermark Text</label>
              <input 
                type="text" 
                value={brandingConfig.text}
                onChange={(e) => setBrandingConfig({...brandingConfig, text: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-600 outline-none font-medium text-sm" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Font Style</label>
              <select 
                value={brandingConfig.fontFamily}
                onChange={(e) => setBrandingConfig({...brandingConfig, fontFamily: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              >
                {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Size</label>
                <input 
                  type="range" min="1" max="15" step="0.5"
                  value={brandingConfig.fontSize}
                  onChange={(e) => setBrandingConfig({...brandingConfig, fontSize: parseFloat(e.target.value)})}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Color</label>
                <input 
                   type="color"
                   value={brandingConfig.color}
                   onChange={(e) => setBrandingConfig({...brandingConfig, color: e.target.value})}
                   className="w-full h-8 bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setBrandingConfig({...brandingConfig, position: pos as any})}
                    className={`py-2 px-3 rounded-lg text-[10px] font-bold capitalize transition-all border ${
                      brandingConfig.position === pos ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {pos.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-600/5 rounded-xl border border-blue-500/10">
            <p className="text-[10px] text-blue-400 font-bold text-center italic leading-relaxed">
              Batch branding sequences enabled for Pro members. Maintains aesthetic across production lots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingEditor;