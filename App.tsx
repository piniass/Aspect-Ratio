import React, { useState, useEffect } from 'react';
import { AppStatus, AspectRatio, ImageState } from './types';
import { generateResizedImage } from './services/geminiService';
import Spinner from './components/Spinner';
import RatioButton from './components/RatioButton';
import UploadZone from './components/UploadZone';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    generated: null,
    currentView: 'original',
  });
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('9:16');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const ratios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];

  const handleFileSelect = (base64: string) => {
    setImageState({
      original: base64,
      generated: null,
      currentView: 'original',
    });
    setStatus(AppStatus.IDLE);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!imageState.original) return;

    setStatus(AppStatus.LOADING);
    setErrorMsg(null);

    try {
      const generatedBase64 = await generateResizedImage(imageState.original, selectedRatio);
      setImageState(prev => ({
        ...prev,
        generated: generatedBase64,
        currentView: 'generated',
      }));
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate image.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    const imageToDownload = imageState.currentView === 'original' ? imageState.original : imageState.generated;
    
    if (imageToDownload) {
      link.href = imageToDownload;
      link.download = `image-${imageState.currentView}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the current image?")) {
      setImageState({ original: null, generated: null, currentView: 'original' });
      setStatus(AppStatus.IDLE);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8 px-4 md:px-8">
      {/* Header */}
      <header className="mb-8 text-center max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          Aspect Ratio AI
        </h1>
        <p className="text-slate-400 text-lg">
          Upload an image and use Gemini to intelligently resize and expand it to any dimension.
        </p>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Status & Errors */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-red-200 text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Upload Section (If no image) */}
          {!imageState.original && (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Source</h2>
              <UploadZone onFileSelect={handleFileSelect} />
            </div>
          )}

          {/* Controls (Visible if image exists) */}
          {imageState.original && (
             <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
                
                {/* Ratio Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Target Aspect Ratio</h2>
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                      {selectedRatio}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {ratios.map((r) => (
                      <RatioButton
                        key={r}
                        ratio={r}
                        selected={selectedRatio === r}
                        onClick={setSelectedRatio}
                        disabled={status === AppStatus.LOADING}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-700 flex flex-col gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={status === AppStatus.LOADING}
                    className={`
                      w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                      ${status === AppStatus.LOADING 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 active:translate-y-0'
                      }
                    `}
                  >
                    {status === AppStatus.LOADING ? (
                      <>
                        <Spinner />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        <span>Generate</span>
                      </>
                    )}
                  </button>

                  <button
                     onClick={handleReset}
                     className="w-full py-3 rounded-xl font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Upload Different Image
                  </button>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8 flex flex-col order-1 lg:order-2 h-full">
           <div className="bg-slate-800/50 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[600px] lg:h-[750px] relative">
              
              {/* Preview Header / Tabs */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm z-10">
                <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-lg">
                  <button
                    onClick={() => setImageState(prev => ({ ...prev, currentView: 'original' }))}
                    disabled={!imageState.original}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      imageState.currentView === 'original' 
                        ? 'bg-slate-700 text-white shadow' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setImageState(prev => ({ ...prev, currentView: 'generated' }))}
                    disabled={!imageState.generated}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      imageState.currentView === 'generated' 
                        ? 'bg-blue-600/90 text-white shadow' 
                        : 'text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span>Result</span>
                    {imageState.generated && <span className="flex h-2 w-2 rounded-full bg-green-400"></span>}
                  </button>
                </div>

                {/* Download Button */}
                {(imageState.currentView === 'original' ? imageState.original : imageState.generated) && (
                   <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download
                   </button>
                )}
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 flex items-center justify-center p-4 lg:p-8 overflow-auto">
                 {/* Empty State */}
                 {!imageState.original && (
                   <div className="text-center text-slate-600">
                     <svg className="w-20 h-20 mx-auto mb-4 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2H4zm0 2h16v10H4V7zm2 2a1 1 0 100 2 1 1 0 000-2zm10 4l-4-4-6 6h10z" /></svg>
                     <p className="text-xl font-light">Preview area</p>
                   </div>
                 )}

                 {/* Image Display */}
                 {(imageState.currentView === 'original' && imageState.original) && (
                   <img 
                      src={imageState.original} 
                      alt="Original" 
                      className="max-w-full max-h-full object-contain shadow-2xl rounded-lg ring-1 ring-white/10" 
                   />
                 )}
                 {(imageState.currentView === 'generated' && imageState.generated) && (
                    <img 
                      src={imageState.generated} 
                      alt="Generated" 
                      className="max-w-full max-h-full object-contain shadow-2xl rounded-lg ring-1 ring-blue-500/30" 
                    />
                 )}

                 {/* Loading Overlay */}
                 {status === AppStatus.LOADING && (
                   <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                     <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-700">
                       <Spinner />
                       <p className="mt-4 text-white font-medium animate-pulse">Expanding reality...</p>
                       <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
                     </div>
                   </div>
                 )}
              </div>

           </div>
           
           {/* Hint */}
           <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p>Use the toggle above to compare Original vs Result</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;