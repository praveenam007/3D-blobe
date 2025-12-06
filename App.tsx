import React, { useState, useRef, useEffect } from 'react';
import Scene3D, { Scene3DRef } from './components/Scene3D';
import Controls from './components/Controls';
import { SceneState, ShapeType, ChatMessage } from './types';
import { generateSceneConfig } from './services/geminiService';
import { Send, Menu, Sparkles, X, Activity, ArrowRight, Cpu, Box, Palette, Home, Download, Video } from 'lucide-react';

const INITIAL_STATE: SceneState = {
  shape: ShapeType.TORUS,
  color: '#3b82f6',
  speed: 1.0,
  wireframe: false,
  roughness: 0.3,
  metalness: 0.8
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [sceneConfig, setSceneConfig] = useState<SceneState>(INITIAL_STATE);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene3DRef>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleConfigChange = (changes: Partial<SceneState>) => {
    setSceneConfig(prev => ({ ...prev, ...changes }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateSceneConfig(input, chatHistory);
      
      if (response.toolUpdates) {
        handleConfigChange(response.toolUpdates);
      }

      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response.text || (response.toolUpdates ? "Applying visual updates..." : "I heard you, but I didn't have anything to say.") 
      };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I had trouble connecting to the neural core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadWallpaper = () => {
    if (sceneRef.current && !isRecording) {
      setIsRecording(true);
      sceneRef.current.recordVideo(() => {
        setIsRecording(false);
      });
    }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex font-sans">
      
      {/* BACKGROUND: 3D Scene Layer (Always rendered for seamless transition) */}
      <div className="absolute inset-0 z-0">
        <Scene3D ref={sceneRef} config={sceneConfig} autoRotate={!hasStarted} />
      </div>

      {/* VIEW: Landing Page */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-1000">
          <div className="max-w-4xl w-full px-6 text-center space-y-8">
            
            {/* Hero Section */}
            <div className="space-y-4 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
                <Sparkles size={12} />
                <span>POWERED BY GOOGLE GEMINI 2.5</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 tracking-tight">
                GenAI 3D Forge
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                Experience the future of generative design. Control real-time 3D geometry using natural language, powered by advanced neural networks and WebGL.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-12">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <Cpu className="text-purple-400 mb-4" size={32} />
                <h3 className="text-white font-semibold mb-2">Neural Interface</h3>
                <p className="text-sm text-gray-400">Speak to the engine naturally. Gemini 2.5 interprets your intent to modify the scene instantly.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <Box className="text-blue-400 mb-4" size={32} />
                <h3 className="text-white font-semibold mb-2">Procedural Mesh</h3>
                <p className="text-sm text-gray-400">Generate and manipulate complex 3D primitives like Torus, Icosahedron, and more in real-time.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
                <Palette className="text-pink-400 mb-4" size={32} />
                <h3 className="text-white font-semibold mb-2">PBR Materials</h3>
                <p className="text-sm text-gray-400">Full control over physically based rendering properties including roughness, metalness, and lighting.</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button 
                onClick={() => setHasStarted(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
              >
                Enter Studio
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </div>

          </div>
          
          {/* Footer */}
          <div className="absolute bottom-6 text-gray-500 text-xs font-mono">
            v1.0.0 • REACT THREE FIBER • GEMINI SDK
          </div>
        </div>
      )}

      {/* VIEW: Main Studio Interface (Conditional) */}
      {hasStarted && (
        <>
          {/* Toggle Button for Mobile/Desktop */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Glassmorphism Sidebar */}
          <div 
            className={`relative z-40 w-full md:w-96 h-full bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={20} />
                  Studio
                </h1>
                <p className="text-xs text-gray-400 mt-1">Interactive Mode</p>
              </div>
              <button 
                onClick={() => setHasStarted(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                title="Back to Home"
              >
                <Home size={20} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Manual Controls Section */}
              <div className="p-6 border-b border-white/10">
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={16} /> Manual Override
                </h2>
                <Controls config={sceneConfig} onChange={handleConfigChange} />
                
                {/* Download Wallpaper Button */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wider">Export</h3>
                  <button
                    onClick={handleDownloadWallpaper}
                    disabled={isRecording}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                      isRecording 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Recording (5s)...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download Video Wallpaper
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    Downloads a looped video usable as a Live Wallpaper on Android/iOS.
                  </p>
                </div>
              </div>

              {/* Chat History */}
              <div className="p-6 pb-2">
                <h2 className="text-sm font-bold text-white mb-4">Neural Interface</h2>
                <div className="space-y-4" ref={scrollRef}>
                  {chatHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm italic">
                      "Make it a red sphere rotating fast."
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600/80 text-white rounded-tr-sm' 
                            : 'bg-white/10 text-gray-200 rounded-tl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe scene changes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;