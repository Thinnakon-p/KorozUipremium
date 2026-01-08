import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Download, 
  Plus, 
  User, 
  Search, 
  Send,
  X,
  File as FileIcon,
  Image as ImageIcon,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Trash2,
  Paperclip,
  CloudUpload,
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
  Mail,
  UserPlus
} from 'lucide-react';

// --- Gemini API Configuration ---
const apiKey = ""; 

const fetchGemini = async (prompt, systemInstruction = "") => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  let retries = 0;
  const backoff = [1000, 2000, 4000, 8000, 16000];

  while (retries < 5) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries === 4) throw error;
      await new Promise(res => setTimeout(res, backoff[retries]));
      retries++;
    }
  }
};

// --- Mock Data ---
const INITIAL_POSTS = [
  {
    id: 1,
    user: 'Astronaut_Z',
    content: 'มุมมองจากดาวอังคารวันนี้สวยมากครับ! พื้นผิวเต็มไปด้วยฝุ่นสีแดงและลมพายุที่กำลังก่อตัว เรากำลังเตรียมติดตั้งแผงโซลาร์เซลล์ชุดใหม่ #Mars #SpaceTravel',
    likes: 124,
    comments: [],
    file: { name: 'mars_exploration_data.pdf', size: '1.2 MB' },
    timestamp: '2 ชม. ที่แล้ว',
    aiSummary: null
  },
  {
    id: 2,
    user: 'StarGazer',
    content: 'ค้นพบเนบิวลาใหม่ในระบบสุริยะอื่น กำลังประมวลผลข้อมูลความร้อนที่ได้รับจากกล้องโทรทรรศน์อวกาศเพื่อระบุธาตุองค์ประกอบเบื้องต้น...',
    likes: 89,
    comments: [],
    file: null,
    timestamp: '5 ชม. ที่แล้ว',
    aiSummary: null
  }
];

const SpaceBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-black">
    <div className="stars-container">
      <div className="star-layer layer1"></div>
      <div className="star-layer layer2"></div>
      <div className="star-layer layer3"></div>
    </div>
    <div className="nebula-glow"></div>
  </div>
);

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [authMode, setAuthMode] = useState('landing'); // 'landing', 'login', 'signup'
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');
  
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ authenticated: false, role: 'user', name: '' });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // --- Auth Handlers ---
  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ authenticated: true, role: 'admin', name: 'Commander_Dev' });
    setIsAuth(true);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setUser({ authenticated: true, role: 'user', name: 'New_Explorer' });
    setIsAuth(true);
  };

  const handleLogout = () => {
    setIsAuth(false);
    setAuthMode('landing');
    setUser({ authenticated: false, role: 'user', name: '' });
  };

  // --- Post Handlers ---
  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleDeletePost = (postId) => {
    if (user.role === 'admin') {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const generateAiCaption = async () => {
    setIsAiLoading(true);
    try {
      const result = await fetchGemini("เขียนแคปชันโซเชียลอวกาศสั้นๆ (ภาษาไทย)", "คุณคือ AI ผู้ช่วยนักบินอวกาศ");
      if (result) setNewPostContent(result.trim());
    } catch (error) { console.error(error); }
    finally { setIsAiLoading(false); }
  };

  const summarizePost = async (postId, content) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, aiSummary: "กำลังวิเคราะห์..." } : p));
    try {
      const result = await fetchGemini(`สรุปสั้นๆ: "${content}"`, "คุณคือระบบวิเคราะห์ข้อมูล");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, aiSummary: result } : p));
    } catch (error) { console.error(error); }
  };

  const handlePost = () => {
    if (!newPostContent.trim() && !selectedFile) return;
    const newPost = {
      id: Date.now(),
      user: user.name,
      content: newPostContent,
      likes: 0,
      comments: [],
      file: selectedFile,
      timestamp: 'เมื่อครู่',
      aiSummary: null
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  // --- Render Sections ---

  if (!isAuth) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden text-white font-sans flex items-center justify-center p-6">
        <SpaceBackground />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {authMode === 'landing' && (
            <div className="text-center space-y-8">
              <div className="inline-block p-4 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl mb-4 animate-bounce-slow">
                <Sparkles size={48} className="text-blue-400" />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                NEBULA OS
              </h1>
              <p className="text-white/40 text-lg font-light leading-relaxed px-6">
                ยินดีต้อนรับสู่เครือข่ายสื่อสารระหว่างดวงดาวที่ล้ำสมัยที่สุดในกาแล็กซี
              </p>
              
              <div className="space-y-4 pt-8">
                <button 
                  onClick={() => setAuthMode('login')}
                  className="w-full py-5 bg-white text-black rounded-[2rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  เริ่มการเชื่อมต่อ <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => setAuthMode('signup')}
                  className="w-full py-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all"
                >
                  ลงทะเบียนพลเมืองใหม่
                </button>
              </div>
            </div>
          )}

          {(authMode === 'login' || authMode === 'signup') && (
            <div className="backdrop-blur-[40px] bg-white/5 border border-white/20 rounded-[3rem] p-10 shadow-2xl animate-sheet-up">
              <button onClick={() => setAuthMode('landing')} className="text-white/30 mb-6 flex items-center gap-2 hover:text-white transition-colors">
                <ChevronDown className="rotate-90" size={20} /> กลับหน้าหลัก
              </button>
              
              <h2 className="text-3xl font-bold mb-2 italic tracking-tight">
                {authMode === 'login' ? 'Authentication' : 'Registration'}
              </h2>
              <p className="text-white/40 text-sm mb-8">กรุณากรอกข้อมูลเพื่อระบุตัวตนของคุณ</p>
              
              <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="email" placeholder="Satellite ID (Email)" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 transition-all" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="password" placeholder="Access Key" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 transition-all" required />
                </div>
                {authMode === 'signup' && (
                  <div className="relative">
                    <UserPlus className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input type="text" placeholder="Explorer Name" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 transition-all" required />
                  </div>
                )}
                <button className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition-all mt-4">
                  {authMode === 'login' ? 'Authorize Access' : 'Create Identity'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full min-h-screen overflow-hidden text-white font-sans transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <SpaceBackground />

      <div className="relative z-10 max-w-lg mx-auto h-screen flex flex-col pt-12 pb-6 px-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 backdrop-blur-3xl bg-white/10 p-5 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('feed')}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nebula OS</h1>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{user.name} • {user.role}</span>
          </div>
          <nav className="flex items-center gap-2">
            <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-full border border-white/10 ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40'}`}>
              <User size={18} />
            </button>
            <button onClick={handleLogout} className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10">
              <LogOut size={18} />
            </button>
          </nav>
        </header>

        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {activeTab === 'feed' && (
            <>
              {posts.map((post) => (
                <div key={post.id} className="group relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 animate-fade-in shadow-xl overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center font-bold border-2 border-white/20">
                      {post.user[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white/90">{post.user}</h3>
                      <p className="text-[11px] text-white/40">{post.timestamp}</p>
                    </div>
                    {user.role === 'admin' && (
                      <button onClick={() => handleDeletePost(post.id)} className="ml-auto p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-white/80 leading-relaxed mb-4 font-light">{post.content}</p>
                  
                  {post.aiSummary ? (
                    <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl animate-fade-in">
                      <div className="flex items-center gap-2 mb-1 text-blue-400">
                        <Zap size={14} className="fill-current" />
                        <span className="text-[10px] font-bold uppercase">AI Insight</span>
                      </div>
                      <p className="text-xs text-blue-100/80 italic">{post.aiSummary}</p>
                    </div>
                  ) : (
                    <button onClick={() => summarizePost(post.id, post.content)} className="mb-4 px-3 py-1.5 bg-white/5 rounded-xl text-[10px] text-white/40 flex items-center gap-2">
                      <Sparkles size={12} /> สรุปด้วย AI
                    </button>
                  )}

                  {post.file && (
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-3xl border border-white/5 mb-6">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileIcon size={20} className="text-blue-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium truncate">{post.file.name}</span>
                          <span className="text-[10px] text-white/30">{post.file.size}</span>
                        </div>
                      </div>
                      <button className="p-2.5 bg-blue-600 rounded-full"><Download size={16} /></button>
                    </div>
                  )}

                  <div className="flex items-center gap-8 pt-5 border-t border-white/10">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-white/40">
                      <Heart size={18} className={post.likes > 100 ? "fill-pink-500 text-pink-500" : ""} />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-white/40"><MessageCircle size={18} /><span className="text-xs">0</span></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'profile' && (
            <div className="p-10 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[3rem] text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-4xl font-bold">
                {user.name[0]}
              </div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-white/40 text-sm mb-8">Explorer Status: Verified</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                  <div className="text-xl font-bold">14</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Logs</div>
                </div>
                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                  <div className="text-xl font-bold">1.2k</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Fans</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="h-24" />
        </div>

        {/* FAB */}
        <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
          <button onClick={() => setIsModalOpen(true)} className="pointer-events-auto w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-full border border-white/30 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
            <Plus size={32} />
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-[40px] rounded-[3rem] border border-white/20 p-8 shadow-2xl animate-sheet-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold italic">New Broadcast</h2>
                <button onClick={generateAiCaption} disabled={isAiLoading} className="px-3 py-1.5 bg-blue-500/20 rounded-full text-[10px] text-blue-300 flex items-center gap-2">
                  <Sparkles size={14} className={isAiLoading ? "animate-spin" : ""} /> AI Magic
                </button>
              </div>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg placeholder:text-white/10 focus:outline-none min-h-[160px] resize-none mb-4"
                placeholder="Share your discovery..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <button onClick={handlePost} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] font-bold shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Send size={20} /> Launch Post
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .stars-container { position: absolute; width: 200%; height: 200%; top: -50%; left: -50%; animation: space-rotate 300s linear infinite; }
        .star-layer { position: absolute; inset: 0; background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)); background-size: 300px 300px; }
        .layer2 { opacity: 0.4; background-size: 200px 200px; }
        .nebula-glow { position: absolute; width: 150%; height: 150%; background: radial-gradient(circle at center, rgba(63, 94, 251, 0.05) 0%, transparent 100%); filter: blur(100px); }
        @keyframes space-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-sheet-up { animation: sheet-up 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </div>
  );
}