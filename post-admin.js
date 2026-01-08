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
  CloudUpload
} from 'lucide-react';

// --- Mock Data ---
const INITIAL_POSTS = [
  {
    id: 1,
    user: 'Astronaut_Z',
    content: 'มุมมองจากดาวอังคารวันนี้สวยมากครับ! #Mars #SpaceTravel',
    likes: 124,
    comments: [
      { id: 101, user: 'Nova', text: 'อยากไปบ้างจัง!' }
    ],
    file: { name: 'mars_exploration_data.pdf', size: '1.2 MB' },
    timestamp: '2 ชม. ที่แล้ว'
  },
  {
    id: 2,
    user: 'StarGazer',
    content: 'ค้นพบเนบิวลาใหม่ในระบบสุริยะอื่น กำลังประมวลผลข้อมูล...',
    likes: 89,
    comments: [],
    file: null,
    timestamp: '5 ชม. ที่แล้ว'
  }
];

// --- Subspace Animation Component ---
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
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Auth State
  const [user, setUser] = useState({ authenticated: true, role: 'admin', name: 'Commander_Dev' });
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
    }
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
      timestamp: 'เมื่อครู่'
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setSelectedFile(null);
    setIsModalOpen(false);
    setActiveTab('feed');
  };

  return (
    <div className={`relative w-full min-h-screen overflow-hidden text-white font-sans selection:bg-blue-500/30 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      <SpaceBackground />

      {/* Main Content */}
      <div className="relative z-10 max-w-lg mx-auto h-screen flex flex-col pt-12 pb-6 px-4">
        
        {/* iOS Glass Header */}
        <header className="flex items-center justify-between mb-8 backdrop-blur-3xl bg-white/10 p-5 rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('feed')}>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Nebula OS
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest font-medium">
              <span>{user.role} mode</span>
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              <span>Online</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`p-3 rounded-full transition-all border border-white/10 active:scale-90 ${activeTab === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/40 hover:bg-white/20'}`}
              >
                <ShieldCheck size={18} />
              </button>
            )}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-3 rounded-full transition-all border border-white/10 active:scale-90 ${activeTab === 'profile' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/40 hover:bg-white/20'}`}
            >
              <User size={18} />
            </button>
            <button className="p-3 bg-white/5 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all border border-white/10 active:scale-90">
              <LogOut size={18} />
            </button>
          </nav>
        </header>

        {/* Tab Logic */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {activeTab === 'feed' && (
            <>
              {posts.map((post) => (
                <div key={post.id} className="group relative backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] p-6 hover:bg-white/10 transition-all duration-500 shadow-xl overflow-hidden animate-fade-in">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center font-bold border-2 border-white/20 shadow-lg shadow-indigo-500/20">
                      {post.user[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white/90">{post.user}</h3>
                      <p className="text-[11px] text-white/40 flex items-center gap-1">
                        <span>{post.timestamp}</span>
                        <span className="w-0.5 h-0.5 bg-white/30 rounded-full"></span>
                        <span>Satellite Connection</span>
                      </p>
                    </div>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="ml-auto p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <p className="text-white/80 leading-relaxed mb-5 text-[15px] font-light">
                    {post.content}
                  </p>

                  {/* File Attachment Display */}
                  {post.file && (
                    <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 mb-6 group/file active:scale-95 transition-transform cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                          <FileIcon size={20} />
                        </div>
                        <div className="flex flex-col overflow-hidden max-w-[200px]">
                          <span className="text-xs font-medium text-white/80 truncate">{post.file.name}</span>
                          <span className="text-[10px] text-white/30 uppercase tracking-tighter">{post.file.size} • Downloadable</span>
                        </div>
                      </div>
                      <button className="p-2.5 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-600/20">
                        <Download size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-8 pt-5 border-t border-white/10">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-2.5 group/btn">
                      <div className={`p-2 rounded-full transition-all ${post.likes > 89 ? 'bg-pink-500/20 text-pink-500' : 'bg-white/5 text-white/40'}`}>
                        <Heart size={18} className={post.likes > 89 ? "fill-current" : ""} />
                      </div>
                      <span className="text-xs font-semibold">{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-2.5 group/btn text-white/40">
                      <div className="p-2 bg-white/5 rounded-full">
                        <MessageCircle size={18} />
                      </div>
                      <span className="text-xs font-semibold">{post.comments.length}</span>
                    </button>

                    <button className="ml-auto p-2 bg-white/5 rounded-full text-white/40 hover:text-green-400 transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'profile' && (
            <div className="p-8 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[2.5rem] text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mx-auto mb-6 flex items-center justify-center text-4xl font-bold border-4 border-white/10">
                {user.name[0]}
              </div>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-white/40 text-sm mb-8 uppercase tracking-[0.2em]">Rank: {user.role}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                  <div className="text-2xl font-bold tracking-tighter">14</div>
                  <div className="text-[10px] text-white/40 uppercase">Logs</div>
                </div>
                <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                  <div className="text-2xl font-bold tracking-tighter">1.2k</div>
                  <div className="text-[10px] text-white/40 uppercase">Fans</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4 animate-fade-in px-2">
              <h2 className="text-xl font-bold mb-4 opacity-80">Station Analytics</h2>
              <div className="grid gap-4">
                {[
                  { label: 'Signal Strength', value: '98%', color: 'text-green-400' },
                  { label: 'Active Relays', value: '1,024', color: 'text-blue-400' },
                  { label: 'System Uptime', value: '99.9d', color: 'text-purple-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-5 backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[1.8rem] flex justify-between items-center">
                    <span className="text-sm font-medium opacity-60">{stat.label}</span>
                    <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="h-24" />
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="pointer-events-auto w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-full border border-white/30 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all z-20 group"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/40 to-purple-600/40 blur-md group-hover:opacity-100 opacity-60 transition-opacity" />
            <Plus size={32} strokeWidth={1.5} className="relative z-10" />
          </button>
        </div>

        {/* Post Modal with File Input */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-[40px] rounded-[3rem] border border-white/20 p-8 shadow-2xl animate-sheet-up overflow-hidden">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/10 rounded-full" />
              
              <div className="flex justify-between items-center mb-6 mt-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic tracking-tight">New Broadcast</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/30">
                  <X size={24} />
                </button>
              </div>

              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-lg placeholder:text-white/10 focus:outline-none focus:border-blue-500/30 min-h-[160px] resize-none mb-6"
                placeholder="What's happening in your sector?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                autoFocus
              />

              {/* Hidden File Input */}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
              />

              {/* Selected File Preview */}
              {selectedFile ? (
                <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6 animate-fade-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <CloudUpload className="text-blue-400 shrink-0" size={20} />
                    <span className="text-xs font-medium text-blue-200 truncate">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-blue-400 p-1">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl mb-6 flex items-center justify-center gap-3 text-white/40 hover:bg-white/10 transition-colors"
                >
                  <Paperclip size={20} />
                  <span className="text-sm">Attach Data / Files</span>
                </button>
              )}

              <button 
                onClick={handlePost}
                disabled={!newPostContent.trim() && !selectedFile}
                className={`w-full py-5 rounded-[2rem] font-bold transition-all flex items-center justify-center gap-3 shadow-2xl ${newPostContent.trim() || selectedFile ? 'bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-95 text-white' : 'bg-white/5 text-white/10'}`}
              >
                <Send size={20} />
                <span>Launch Connection</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .stars-container {
          position: absolute;
          width: 200%; height: 200%; top: -50%; left: -50%;
          animation: space-rotate 300s linear infinite;
        }
        .star-layer {
          position: absolute; inset: 0;
          background-image: 
            radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 100px 150px, #fff, rgba(0,0,0,0));
          background-size: 300px 300px;
        }
        .layer1 { opacity: 0.2; }
        .layer2 { opacity: 0.4; background-size: 200px 200px; animation: pulse 8s ease-in-out infinite; }
        .nebula-glow {
          position: absolute; width: 150%; height: 150%;
          background: radial-gradient(circle at center, rgba(63, 94, 251, 0.08) 0%, rgba(252, 70, 107, 0.04) 50%, transparent 100%);
          filter: blur(100px); animation: nebula-move 60s ease-in-out infinite alternate;
        }
        @keyframes space-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes nebula-move { from { transform: translate(-10%, -10%); } to { transform: translate(5%, 5%); } }
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-sheet-up { animation: sheet-up 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}} />
    </div>
  );
}