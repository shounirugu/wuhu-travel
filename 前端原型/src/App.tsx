/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, MouseEvent } from 'react';
import { 
  Search, 
  Heart, 
  Star, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  MessageSquare, 
  X,
  Compass,
  TrendingUp,
  Activity,
  Trees,
  Utensils,
  Image as ImageIcon,
  CheckCircle2,
  Map,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  AreaChart, 
  Area, 
  Legend
} from 'recharts';

import { DESTINATIONS, DUMMY_STATS, CATEGORY_CHART_DATA, TOP_RATED_DATA, AI_TREND_DATA, CHAT_REPLIES } from './data';
import { Destination } from './types';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'scenery' | 'details' | 'stats' | 'login'>('home');
  const [selectedDest, setSelectedDest] = useState<Destination>(DESTINATIONS[0]);
  
  // Scenery Filtering & Search State
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sceneryPageIndex, setSceneryPageIndex] = useState<number>(1);
  
  // Auth Tab State
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  
  // AI Messenger State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: '您好！我是您的芜湖旅游助手。今天想去哪里感受江城魅力？我可以为您推荐路线或寻找地道美食。' }
  ]);
  
  // Likes/Favorites Track State
  const [likedDestIds, setLikedDestIds] = useState<string[]>(['jiuzi']);

  // Booked/Reservation Status Tracker
  const [bookedStatus, setBookedStatus] = useState<boolean>(false);

  // Mount Status for Recharts rendering stability
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggleLike = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (likedDestIds.includes(id)) {
      setLikedDestIds(likedDestIds.filter(item => item !== id));
    } else {
      setLikedDestIds([...likedDestIds, id]);
    }
  };

  const handleSelectDestination = (dest: Destination) => {
    setSelectedDest(dest);
    setCurrentPage('details');
    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // chatbot workflow
  const handleSendChat = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user' as const, text };
    
    // Find matching keyword trigger
    let replyText = CHAT_REPLIES.default;
    const normalized = text.toLowerCase();
    
    if (normalized.includes('美食') || normalized.includes('吃') || normalized.includes('面') || normalized.includes('包')) {
      replyText = CHAT_REPLIES.美食;
    } else if (normalized.includes('游') || normalized.includes('日程') || normalized.includes('路线') || normalized.includes('一日')) {
      replyText = CHAT_REPLIES.一日;
    } else if (normalized.includes('拍') || normalized.includes('摄影') || normalized.includes('打卡') || normalized.includes('出片')) {
      replyText = CHAT_REPLIES.打卡;
    }
    
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');

    // Add delayed reply for natural conversational rhythm
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'ai', text: replyText }]);
    }, 600);
  };

  // Filter logic on destinations
  const filteredDestinations = DESTINATIONS.filter(dest => {
    const matchesCategory = activeCategoryFilter === '全部' || dest.category === activeCategoryFilter;
    const matchesSearch = dest.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dest.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-river-bg text-ink-black font-sans min-h-screen flex flex-col selection:bg-jiang-blue/20">
      
      {/* -------------------- HEAD NAVIGATION BAR -------------------- */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border-gray/50 shadow-sm transition-all duration-300">
        <div className="max-w-[1200px] mx-auto h-20 px-6 flex justify-between items-center">
          <div 
            onClick={() => setCurrentPage('home')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="material-symbols-outlined text-4xl text-jiang-blue font-bold transition-transform group-hover:rotate-6">waves</span>
            <span className="text-2xl font-display font-light text-jiang-blue tracking-tight">
              Wuhu <span className="font-bold">Travel</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => setCurrentPage('home')} 
              className={`text-[16px] font-medium transition-all py-1 cursor-pointer hover:text-jiang-blue ${
                currentPage === 'home' 
                  ? 'text-jiang-blue border-b-2 border-jiang-blue font-semibold scale-105' 
                  : 'text-on-surface-variant'
              }`}
            >
              首页
            </button>
            <button 
              onClick={() => {
                setCurrentPage('scenery');
                setActiveCategoryFilter('全部');
              }} 
              className={`text-[16px] font-medium transition-all py-1 cursor-pointer hover:text-jiang-blue ${
                currentPage === 'scenery' || currentPage === 'details'
                  ? 'text-jiang-blue border-b-2 border-jiang-blue font-semibold scale-105' 
                  : 'text-on-surface-variant'
              }`}
            >
              自然风景
            </button>
            <button 
              onClick={() => setCurrentPage('stats')} 
              className={`text-[16px] font-medium transition-all py-1 cursor-pointer hover:text-jiang-blue ${
                currentPage === 'stats' 
                  ? 'text-jiang-blue border-b-2 border-jiang-blue font-semibold scale-105' 
                  : 'text-on-surface-variant'
              }`}
            >
              数据看板
            </button>
            <button 
              onClick={() => {
                setCurrentPage('login');
                setAuthTab('login');
              }} 
              className={`text-[16px] font-medium transition-all py-1 cursor-pointer hover:text-jiang-blue ${
                currentPage === 'login' 
                  ? 'text-jiang-blue border-b-2 border-jiang-blue font-semibold scale-105' 
                  : 'text-on-surface-variant'
              }`}
            >
              会员登录
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('scenery')}
              className="p-2 hover:bg-river-bg rounded-full text-on-surface-variant hover:text-jiang-blue transition-colors cursor-pointer"
              title="搜索推荐"
            >
              <Search size={20} />
            </button>
            <div 
              onClick={() => {
                setCurrentPage('login');
                setAuthTab('login');
              }}
              className="w-10 h-10 rounded-full bg-jiang-blue/10 border border-jiang-blue/20 flex items-center justify-center text-jiang-blue font-bold tracking-tight text-sm font-mono cursor-pointer hover:bg-jiang-blue/25 transition-all"
              title="用户中心"
            >
              JD
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 flex-grow">
        <AnimatePresence mode="wait">
          
          {/* -------------------- VIEW 1: HOME PAGE -------------------- */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col pb-20"
            >
              {/* Hero Banner Section */}
              <section className="max-w-[1200px] mx-auto w-full flex flex-col md:flex-row min-h-[580px] overflow-hidden md:rounded-2xl mt-6 shadow-md shadow-black/5 bg-white">
                
                {/* Hero Left Spec (40%) */}
                <div className="w-full md:w-[40%] hero-gradient flex flex-col justify-center px-12 py-16 relative text-white">
                  
                  {/* Decorative Architectural Lines (Anhui aesthetic) */}
                  <div className="absolute top-12 left-0 w-24 flex flex-col gap-1.5 opacity-40">
                    <div className="h-px bg-white/30 w-16"></div>
                    <div className="h-px bg-white/50 w-24"></div>
                    <div className="h-px bg-white/25 w-10"></div>
                  </div>

                  <h1 className="font-display text-5xl font-light mb-4 leading-tight">
                    芜湖，<br />
                    <span className="font-bold text-primary-fixed drop-shadow-md decoration-slice">
                      半城山水半城诗
                    </span>
                  </h1>
                  
                  <p className="font-sans text-xl opacity-90 mb-10 font-light tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-nature-green"></span>
                    江水穿城，徽韵千年
                  </p>

                  <button 
                    onClick={() => {
                      setCurrentPage('scenery');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className="w-fit bg-white/10 hover:bg-white text-white hover:text-jiang-blue border border-white/20 hover:border-white px-8 py-3.5 rounded-xl font-semibold hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-2 group-hover:translate-x-1"
                  >
                    开始探索
                    <ArrowRight size={18} />
                  </button>

                  <div className="absolute bottom-12 right-0 w-32 flex flex-col gap-1.5 opacity-30 items-end">
                    <div className="h-px bg-white/30 w-12"></div>
                    <div className="h-px bg-white/50 w-28"></div>
                    <div className="h-px bg-white/25 w-16"></div>
                  </div>
                </div>

                {/* Hero Right Slide Concept (60%) */}
                <div 
                  onClick={() => handleSelectDestination(DESTINATIONS[0])}
                  className="w-full md:w-[60%] relative overflow-hidden h-[380px] md:h-auto cursor-pointer group"
                >
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQUj9QGknsUg3r0Vedae5AK_yhofwGQo-uP6cS1Z-zVwx9_0fkENHpEwqj7YqDEDmhKLyOMBTa6mSZlL6QXE9EsGjL3nYBBU_uvEm3Pfq1hIsl1PrTASYtWPECva0IsFBDbnvvcvJal4z6X4lUr4xAuF7CG-PeI7reiuCHPH6XKkOHtSvWFVSVMwSty6nR3swnI6qLNlNLAPjA-h9Ltx3sFxfR2R-u-Jw9grfs1FqResVCqfyiFFj4h8HNMLgInhS6KqTeteeirrc-" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[6000ms]" 
                    alt="Mirror Lake"
                  />
                  
                  {/* Backdrop shading overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent"></div>

                  {/* Slider badge */}
                  <div className="absolute bottom-10 left-10 glass-card p-5 rounded-xl text-white">
                    <span className="block font-mono text-xs text-primary-fixed uppercase tracking-widest mb-1">Landmark 01</span>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      镜湖风景区
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </h3>
                  </div>

                  <div className="absolute bottom-10 right-10 flex items-center gap-2">
                    <div className="w-8 h-1 bg-white rounded-full"></div>
                    <div className="w-4 h-1 bg-white/30 rounded-full"></div>
                    <div className="w-4 h-1 bg-white/30 rounded-full"></div>
                  </div>
                </div>
              </section>

              {/* Bento Box category Section */}
              <section className="max-w-[1200px] mx-auto w-full px-6 py-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-jiang-blue font-display">探索多元芜湖</h2>
                  <div className="w-16 h-1 bg-jiang-blue mx-auto mt-3 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Category Nature */}
                  <div 
                    onClick={() => {
                      setCurrentPage('scenery');
                      setActiveCategoryFilter('风景');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-2 bg-nature-green rounded-2xl relative overflow-hidden group cursor-pointer h-[260px] shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-nature-green to-[#235339] opacity-90 z-10"></div>
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrMhEHj6pMGWVBq6Dvmh33R0eUhSiAZbC2IGD_2UqLSAAHl5v920AJu1YzbWzm3OwZPNI_AdxW52p9PrlZpNKQvqz_aT4WseDY2_eN2yl4yYE5Gr4CASl-19ewlhEyX0iu3MR0uYZxN3vKIMSUiW1uk5QaUGOLS7Nh0l739V4NSWt_MH6981CnPBnpmVB8ZRQQyaXAKD9z2dvrHPYszkm9hyndalHdFto3KJK-sn3Bhj0Em-Pa03gk5Z9xswD_KSA3u1t3iEiRJkFG" 
                      alt="Mount fog" 
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="relative z-20 h-full p-8 flex flex-col justify-end text-white">
                      <Trees size={36} className="mb-3 opacity-90" />
                      <h3 className="text-2xl font-bold mb-1">山水风光</h3>
                      <p className="text-white/80 text-sm">寻觅半城山水的自然诗意</p>
                    </div>
                  </div>

                  {/* Category Activity */}
                  <div 
                    onClick={() => {
                      setCurrentPage('scenery');
                      setActiveCategoryFilter('全部');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-jiang-blue rounded-2xl relative overflow-hidden group cursor-pointer h-[260px] shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-jiang-blue to-[#094142] opacity-95"></div>
                    <div className="h-full p-8 flex flex-col justify-between text-white relative z-10">
                      <Compass size={36} className="opacity-90 mt-2" />
                      <div>
                        <h3 className="text-xl font-bold mb-1">民俗活动</h3>
                        <p className="text-white/70 text-xs">感受千年的徽派人文律动</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Food */}
                  <div 
                    onClick={() => {
                      setCurrentPage('scenery');
                      setActiveCategoryFilter('小吃');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-cuisine-orange rounded-2xl relative overflow-hidden group cursor-pointer h-[260px] shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cuisine-orange to-[#9b4a12] opacity-95"></div>
                    <div className="h-full p-8 flex flex-col justify-between text-white relative z-10">
                      <Utensils size={36} className="opacity-90 mt-2" />
                      <div>
                        <h3 className="text-xl font-bold mb-1">地道美食</h3>
                        <p className="text-white/70 text-xs">寻味江城，舌尖上的徽韵</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Large Row */}
                  <div 
                    onClick={() => {
                      setCurrentPage('scenery');
                      setActiveCategoryFilter('打卡');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-4 bg-photo-purple rounded-2xl relative overflow-hidden group cursor-pointer h-[120px] shadow-sm hover:shadow-lg transition-all flex items-center px-10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-photo-purple to-[#492d75] opacity-95 z-10"></div>
                    <div className="relative z-20 flex w-full justify-between items-center text-white">
                      <div className="flex items-center gap-5">
                        <ImageIcon size={32} />
                        <div>
                          <h3 className="text-lg font-bold">光影江城</h3>
                          <p className="text-white/80 text-xs">镜头下的芜湖绝美瞬间</p>
                        </div>
                      </div>
                      <span className="bg-white/10 group-hover:bg-white/20 border border-white/20 hover:border-white px-6 py-2 rounded-full text-xs font-semibold backdrop-blur-sm transition-all">
                        浏览影集
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Hot Recommendations Section */}
              <section className="max-w-[1200px] mx-auto w-full px-6 py-6 font-sans">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-ink-black flex items-center gap-2">热门推荐</h2>
                    <div className="w-12 h-[3px] bg-jiang-blue mt-2 rounded-full"></div>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentPage('scenery');
                      setActiveCategoryFilter('全部');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-jiang-blue hover:text-jiang-blue/80 font-semibold text-[15px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    查看更多 <ArrowRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Recommended Item 1: 鸠兹古镇 */}
                  <div 
                    onClick={() => handleSelectDestination(DESTINATIONS[0])}
                    className="bg-white rounded-2xl overflow-hidden border border-border-gray/40 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_u6euqzIPRh7KEaTOLB8vGO5DgtRipqwMspwv1GCSORpUZpRPQiDeAio3cNEpmOi4S82F4Pio20PnKU-wPFAuBDPl9DsExOHHishQp2fSvjbbeUDY5h0P6tw8OD23DuPTiPJ-IHOyAFeW_N2Yvl4hmepeNk4cdsNz-iBbeVAHBHoGFPmkYtpPa8WZa3dsu5XGY4O7dJVFmGuwIGDEAsjLRgqJ-ih96lO80N94iYjgSz93Oc5trCzL_kCyqMODcUDQvSfvuuKANNvV" 
                        alt="jiuzi" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 font-semibold text-xs bg-nature-green text-white px-3 py-1 rounded-full shadow-sm">
                        推荐
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-ink-black hover:text-jiang-blue transition-colors">鸠兹古镇</h3>
                        <span className="bg-nature-green/10 text-nature-green text-xs font-medium px-2 py-0.5 rounded">
                          历史地标
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 leading-relaxed">
                        穿越千年的繁华街巷，体验正宗徽派文化底蕴。
                      </p>
                      <div className="flex justify-between items-center border-t border-border-gray/30 pt-4">
                        <span className="text-jiang-blue font-bold text-[16px]">￥0 门票</span>
                        <button 
                          onClick={(e) => handleToggleLike('jiuzi', e)}
                          className={`hover:scale-110 active:scale-95 transition-all p-1.5 rounded-full ${
                            likedDestIds.includes('jiuzi') ? 'text-rose-500 bg-rose-50' : 'text-outline hover:text-rose-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined ${likedDestIds.includes('jiuzi') ? 'material-symbols-fill' : ''}`}>favorite</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Item 2: 赭山公园 */}
                  <div 
                    onClick={() => handleSelectDestination(DESTINATIONS[1])}
                    className="bg-white rounded-2xl overflow-hidden border border-border-gray/40 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKAVZK9B8gqL9KunA2l9LGGBle4_YG0REYl6HgrVH8A99s1EMEGPfW1ZHcVlLkqmS7yK0r89I-cFGRxCl2EqFHT24syS5v2O72WB_cgGcmUxHD5wb98_W-tH4RRIxcoLbtYOTGtw2vtaxjkh-p7Zr0P2Idv5kiCWgxMV2QX5w1IOKs343IqXbNETq9PFNqmGkXXBv3Fx4Tn3Sc6vxxBPzTqDARiEq7WRHV7unLYE0tshTs8ODr11c_SysZAefeGw53uOYB0XlKnCDQ" 
                        alt="zheshan" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 font-semibold text-xs bg-nature-green text-white px-3 py-1 rounded-full shadow-sm">
                        热门
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-ink-black hover:text-jiang-blue transition-colors">赭山公园</h3>
                        <span className="bg-jiang-blue/10 text-jiang-blue text-xs font-medium px-2 py-0.5 rounded">
                          休闲健身
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 leading-relaxed">
                        江城的天然氧吧，登顶可俯瞰半城山水美景。
                      </p>
                      <div className="flex justify-between items-center border-t border-border-gray/30 pt-4">
                        <span className="text-jiang-blue font-bold text-[16px]">免费开放</span>
                        <button 
                          onClick={(e) => handleToggleLike('zheshan', e)}
                          className={`hover:scale-110 active:scale-95 transition-all p-1.5 rounded-full ${
                            likedDestIds.includes('zheshan') ? 'text-rose-500 bg-rose-50' : 'text-outline hover:text-rose-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined ${likedDestIds.includes('zheshan') ? 'material-symbols-fill' : ''}`}>favorite</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Item 3: 耿福兴 */}
                  <div 
                    onClick={() => handleSelectDestination(DESTINATIONS[2])}
                    className="bg-white rounded-2xl overflow-hidden border border-border-gray/40 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDifiyVDJldWTVukFw2XdsMveD7L-C_ploVOV4sat9Zlm6QUnkNfGE0b2uzfJQkRCZ8UVNPPbqvidG9axszKWh1TnYjHqLGaokQsQXF2ML-FXhhCBuGMsIyr0mn8aANfn4Iknm5Zdd8oySJDXe9Zyt9T-achDS4FGz1sPeyGQ000aRVbrxJ3a52J9t98GJdXSt1w3V2_DLGhOy9JyF32bwCujhFDbRw_8mLMmnPbFjz1zeGZiJ3mC_TBqQJp9sMORYa_mvQoRaSzoM2" 
                        alt="gengfuxing" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 font-semibold text-xs bg-nature-green text-white px-3 py-1 rounded-full shadow-sm">
                        推荐
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-ink-black hover:text-jiang-blue transition-colors">耿福兴</h3>
                        <span className="bg-cuisine-orange/10 text-cuisine-orange text-xs font-medium px-2 py-0.5 rounded">
                          中华老字号
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 leading-relaxed">
                        百年传承的经典芜湖早茶，让味蕾记住江城记忆。
                      </p>
                      <div className="flex justify-between items-center border-t border-border-gray/30 pt-4">
                        <span className="text-jiang-blue font-bold text-[16px]">人均 ￥45</span>
                        <button 
                          onClick={(e) => handleToggleLike('gengfuxing', e)}
                          className={`hover:scale-110 active:scale-95 transition-all p-1.5 rounded-full ${
                            likedDestIds.includes('gengfuxing') ? 'text-rose-500 bg-rose-50' : 'text-outline hover:text-rose-500'
                          }`}
                        >
                          <span className={`material-symbols-outlined ${likedDestIds.includes('gengfuxing') ? 'material-symbols-fill' : ''}`}>favorite</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* -------------------- VIEW 2: SCENERY PAGE -------------------- */}
          {currentPage === 'scenery' && (
            <motion.div
              key="scenery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-[1200px] mx-auto w-full px-6 py-12 flex flex-col md:flex-row gap-8 min-h-screen"
            >
              {/* Sidebar Category Filter */}
              <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white p-5 rounded-2xl border border-border-gray/40 shadow-sm sticky top-24">
                  <h3 className="text-lg font-bold text-ink-black mb-5 px-1 hui-border pl-3">分类浏览</h3>
                  <ul className="space-y-2.5">
                    {[
                      { key: '全部', label: '全部', val: 128 },
                      { key: '风景', label: '风景', val: 42 },
                      { key: '项目', label: '项目', val: 28 },
                      { key: '小吃', label: '小吃', val: 35 },
                      { key: '打卡', label: '打卡', val: 23 },
                    ].map((item) => (
                      <li key={item.key}>
                        <button
                          onClick={() => {
                            setActiveCategoryFilter(item.key);
                            setSceneryPageIndex(1);
                          }}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all font-medium cursor-pointer ${
                            activeCategoryFilter === item.key
                              ? 'bg-jiang-blue text-white shadow-md shadow-jiang-blue/10'
                              : 'text-on-surface-variant hover:bg-river-bg hover:text-jiang-blue'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className={`text-xs ml-2 font-mono ${activeCategoryFilter === item.key ? 'text-white/80' : 'text-outline'}`}>
                            {item.val}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Main Contents Area */}
              <section className="flex-grow">
                {/* Search & Dynamic Summary */}
                <div className="mb-8 p-1 bg-white rounded-2xl shadow-sm border border-border-gray/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input 
                      type="text" 
                      placeholder="搜索芜湖好玩的地方..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none outline-none font-medium placeholder-outline/80 text-[15px] focus:ring-0 focus:outline-none"
                    />
                  </div>
                  <div className="text-on-surface-variant text-sm px-6 py-2 shrink-0 bg-river-bg/50 rounded-xl md:mr-1 font-medium">
                    找到 <span className="text-jiang-blue font-bold font-mono">{filteredDestinations.length}</span> 个相关推荐
                  </div>
                </div>

                {/* Grid of Results */}
                {filteredDestinations.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-border-gray/30 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-outline mb-2">search_off</span>
                    <p className="text-on-surface-variant font-medium text-base">没有找到符合条件的推荐，试着换个词吧~</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDestinations.map((dest) => (
                      <div 
                        key={dest.id}
                        onClick={() => handleSelectDestination(dest)}
                        className="bg-white rounded-2xl overflow-hidden border border-border-gray/40 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <img 
                            src={dest.image} 
                            alt={dest.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className={`absolute top-3 left-3 px-3 py-1 text-white text-xs font-semibold rounded-full shadow-sm ${
                            dest.category === '风景' ? 'bg-nature-green' :
                            dest.category === '打卡' ? 'bg-photo-purple' :
                            dest.category === '小吃' ? 'bg-cuisine-orange' : 'bg-jiang-blue'
                          }`}>
                            {dest.category}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-ink-black group-hover:text-jiang-blue transition-colors mb-2">
                              {dest.title}
                            </h4>
                            <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed">
                              {dest.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-border-gray/30 pt-4 mt-1">
                            <span className="flex items-center text-cuisine-orange">
                              <Star size={16} fill="currentColor" className="mr-0.5" />
                              <span className="text-sm font-semibold font-mono">{dest.rating}</span>
                            </span>
                            <button className="text-jiang-blue font-semibold text-xs flex items-center gap-1 hover:underline">
                              查看详情
                              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Paginations block */}
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setSceneryPageIndex(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-gray text-on-surface-variant hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {[1, 2, 3].map((page) => (
                    <button 
                      key={page}
                      onClick={() => setSceneryPageIndex(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold text-[14px] transition-colors cursor-pointer ${
                        sceneryPageIndex === page 
                          ? 'bg-jiang-blue text-white shadow-md shadow-jiang-blue/10' 
                          : 'border border-border-gray bg-transparent text-on-surface-variant hover:border-jiang-blue hover:text-jiang-blue hover:bg-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="mx-1 text-outline text-xs">...</span>
                  <button 
                    onClick={() => setSceneryPageIndex(prev => Math.min(3, prev + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-border-gray text-on-surface-variant hover:bg-white transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* -------------------- VIEW 3: DETAIL PAGE -------------------- */}
          {currentPage === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col pb-20"
            >
              {/* Parallax Hero header */}
              <div className="relative w-full h-[400px] overflow-hidden bg-ink-black">
                <img 
                  src={selectedDest.image} 
                  alt={selectedDest.title}
                  className="w-full h-full object-cover opacity-80" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>

                {/* Back Button */}
                <div className="absolute top-8 left-6 z-10 max-w-[1200px] mx-auto w-full px-6">
                  <button 
                    onClick={() => {
                      setCurrentPage('scenery');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 hover:scale-[1.02] border border-white/25 hover:border-white/50 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer font-semibold text-sm"
                  >
                    <ArrowLeft size={16} />
                    返回上一页
                  </button>
                </div>

                {/* Floating Content Banner */}
                <div className="absolute bottom-10 left-0 w-full">
                  <div className="max-w-[1200px] mx-auto px-12">
                    <span className="inline-block px-3.5 py-1.5 bg-nature-green text-white rounded-full text-xs font-semibold mb-3 tracking-wide">
                      ⚡ {selectedDest.tag || '打卡地'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2 drop-shadow-md">
                      {selectedDest.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                      <span className="flex items-center gap-1 font-bold text-cuisine-orange bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                        <Star size={16} fill="currentColor" />
                        {selectedDest.rating} 评分
                      </span>
                      {selectedDest.address && (
                        <span className="flex items-center gap-1 font-medium bg-black/30 px-3 py-1 rounded-lg">
                          <MapPin size={16} className="text-rose-400" />
                          {selectedDest.address}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              <section className="max-w-[1200px] mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column Descriptions (8 units grid width) */}
                  <div className="lg:col-span-8">
                    <div className="p-8 md:p-10 bg-white rounded-2xl border border-border-gray/30 shadow-sm">
                      <div className="asymmetric-line mb-4"></div>
                      <h2 className="text-2xl font-bold text-ink-black mb-6 flex items-center gap-2">
                        古镇印象与历史渊源
                      </h2>

                      <div className="prose text-on-surface-variant text-[16px] leading-relaxed space-y-6">
                        <p>
                          {selectedDest.details || selectedDest.description} 芜湖自古便是长江流域的重要商业枢纽。作为长江沿岸历史名城，芜湖积淀了丰沛的人文风光。这里不仅是著名的鱼米之乡，更是徽派文明在皖南的瑰丽结晶。
                        </p>
                        <p>
                          漫步在青砖石板路上，空气中隐约飘荡着百年作坊、传统面点以及江海船家的烟硝香气。不论是用餐、品茗、揽景，还是寻古，每个景点都能让在尘俗中疲于奔波的都市旅人觅得一份心安处的怡然自得。
                        </p>

                        {/* Img detail grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOQPWLrfEHXufYtL70ugXXrA-FetjKpN5kxJwtS0NnKR46_CyyqCCGCKPZhzZC49iJy7XS2yG7_tLeW8t9OwioOEFlqNAEklPqsyuI9fDeR49KB03e5EHcoDqBiX1mQWdDBlPl3C00ruTng6D31N8Y8KSIVCeM9LyhtEbG4hLGWBKDcExxzhMDieeEfn8Br4YY98onPuQEqRq1NQlSDCMJzxyhv8Oq1o8GKGu86qVza_k8XkOi3ZofhRW_1Ia4OiJtPxmv3Mkm7qes" 
                            alt="Hui Door" 
                            className="rounded-xl h-56 w-full object-cover shadow-sm hover:scale-[1.02] transition-transform duration-500"
                          />
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRgCFXp7kAsilRWwubLHaF-ZN85-3p1FN5LKz4iaboSL0nVpRZDWCituMAZXMvB_AyEcxYBlKV4GgGJQYX4xoUF1UQMzuhL3AK3XjJB7CX4kSgbrDz7NM_0a5hZcTLXngzRwPVd8pfTf8WCcXWgvfETa4WFD7GLMFcqc2tsRppJJ-S2JffREjpiL6xH7yPitLQ1W7ODl2Vk75CJy0WeMx8qApq6E7wpLLmv8lIUe7-AQsiPQwxsHMtTGq4rkrWZNIpaDMD81UaAFDf" 
                            alt="Hui Canal" 
                            className="rounded-xl h-56 w-full object-cover shadow-sm hover:scale-[1.02] transition-transform duration-500"
                          />
                        </div>

                        <p>
                          傍晚夕照之下，临江的屋檐笼在金黄色的昏韵里，江风吹得人心神荡漾。与 “Wuhu Travel” 一起驻足观察这里的草长莺飞，听一曲徽班折子戏，在浮光掠影间，探询最富烟火气的江城深浅处。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Tips Card (4 units grid width) */}
                  <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
                    {/* Tips and facts card */}
                    <div className="p-8 bg-surface-container-low rounded-2xl border border-jiang-blue/10 shadow-sm relative overflow-hidden group">
                      
                      <div className="absolute -top-3 -right-3 text-jiang-blue/5 transform rotate-12 scale-150 transition-all group-hover:scale-175 group-hover:rotate-6">
                        <Sparkles size={110} />
                      </div>

                      <h3 className="text-xl font-bold text-jiang-blue mb-6 flex items-center gap-2 relative z-10 pl-1 hui-border">
                        游玩小贴士
                      </h3>

                      <ul className="space-y-4 relative z-10 text-[15px]">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-jiang-blue mt-2 shrink-0"></span>
                          <div>
                            <strong className="block text-ink-black mb-0.5">最佳游玩时间</strong>
                            <span className="text-on-surface-variant text-sm">
                              推荐春秋两季，或者傍晚 17:00 以后，可以观赏华灯初上后的绝美古镇或江面夜景。
                            </span>
                          </div>
                        </li>

                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-jiang-blue mt-2 shrink-0"></span>
                          <div>
                            <strong className="block text-ink-black mb-0.5">门票及购票提示</strong>
                            <span className="text-on-surface-variant text-sm">
                              {selectedDest.priceText}，建议登录官方账户平台提前预定预约，获取免费通道或晚场套餐折扣。
                            </span>
                          </div>
                        </li>

                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-jiang-blue mt-2 shrink-0"></span>
                          <div>
                            <strong className="block text-ink-black mb-0.5">必吃美味推介</strong>
                            <span className="text-on-surface-variant text-sm">
                              虾籽捞面、蟹黄汤包、汤卤排骨蒸饭以及传统徽州桂花毛豆腐、油炸红豆糕。
                            </span>
                          </div>
                        </li>
                      </ul>

                      {bookedStatus ? (
                        <div className="w-full mt-8 bg-nature-green text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm animate-pulse">
                          <CheckCircle2 size={18} />
                          您已成功预定此行程！
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setBookedStatus(true);
                            setTimeout(() => setBookedStatus(false), 3500);
                          }}
                          className="w-full mt-8 bg-jiang-blue hover:bg-jiang-blue/90 text-white font-semibold py-4 rounded-xl shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all relative z-10 flex items-center justify-center gap-1 text-base"
                        >
                          立即预定行程
                        </button>
                      )}
                    </div>

                    {/* Geolocation visual card */}
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-border-gray/30">
                      <h3 className="text-[17px] font-bold text-ink-black mb-4 flex items-center gap-1.5">
                        <Map size={18} className="text-jiang-blue" />
                        地理位置 & 地图
                      </h3>
                      
                      <div className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer shadow-inner">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgASepGEe_4B-pmDp4C2MuRUI3r89Ug87sPdpzX2r73gAv4ul55k6TYy8FLlh3F7ozVUSSh-WtNp2rEIp7D4y5KOcJ8Ijc0JLLr6ba9ktGCWaywc9UwUPfyVt-BMEOYnY1hTNGYuWrPe0sowkhq9BUy76NzFiVBBh5yvmEi8Slpav0aNyrkhX7bkY-z59v6ew7_KzgxwvpVIbcCk5k-MTXGqJZXujpvu1bWuCUT4JSnEXyOQpziHsS4AOEPL7su9GCRU4pUIXfVFc" 
                          alt="Illustrated Map" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-all">
                          <span className="bg-white text-jiang-blue font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 hover:scale-105 transition-all">
                            <span className="material-symbols-outlined text-sm">map</span>
                            查看完整地图
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-on-surface-variant font-medium text-center">
                        {selectedDest.address || '中国安徽省芜湖市境内'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gallery showcase */}
                <div className="mt-16 font-sans">
                  <h2 className="text-2xl font-bold mb-6 text-ink-black">精选图集</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtU1IDROPcHSW64UzPNLgEZiB-Yz2ps_jn8s3GECpmm6tJrwKTrSdE9WFC3GXnQ5Orr5xdz8Kf_4QH2C2GP1OpjPejdw7chJDLOBE83II1GsM5dgafIxt8vQKfo1J_u5ATSJoEoLNbt15JGunDOD1YJYuTGBMJWSWlFAkP2tUfPT6ZFz4EquihF5gCyXNkeSgB5i4mUcJAu1YcaNSEMX_-2iNB7OaHeWiXjiN2J1z6qnzO4Svd4qIJtawLgDYflBFD7yCmAoCkbG1o',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuDm4eezVgujbL2wn4pS7568eIgXpuIixo881YxBJ57piN24Mqw-zqODYPTqRO30Wr9xYCjc0_qBi3v3hQDqhDiArnBW91gLs_vpJasxaX3X_BdNs3fj8JEok-Tbn-mx0hutDFftRBLhit_eZ3B9GpTGHYwKrCxDorbUDkw8ZBYHvRJiGO66eMggLorOfzCHHpHl8qKu0OV1UoWtmm05onROSU3csyDmoFW7X8PWcWHZWMpq3b5xTl1ExEamkS7wTkN1H0L2bgurvcQk',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgGxcevWGzDG6byc1u1EEBsIaPxZ0vnN8ambE3DHq4HgLjtIHym-kgVoQrBjeGpJpb3dinc5Wy56Yuh0sYgrBItSxnmb8XWsWi-jQIFjk7g1SuClSxC5vezeb_WvTY6nOFrE9t7C6qLaozodqvKnCIdcmZA7zs7sb8gU1ZbYJJPHinvJ8EVmPU10etOhniGa_PQz4WsTb3slpoNnv_xyQ0k3IrRu85bipZpv9uxSgYw3AnYGPABQm4S7di_EIzSGD2kBfyQhlu-Xvo',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBw1EvBfK141FENmGVJr8Zh1v_8qP4zaBvwkxSu3mEwuHz3Gpp4EwoOziQ4ZjQaiVh-1NBQob-BHv0Bh9SG982U47DGAr2giUvsZtEnANbmSQCUie_G_fyEBGZwLvzfpA7lOj_jrZJkFLJ9ldf3W306F2uQwXu8eNGBHu1CCd8LeONmZhxW_b58t4qfEEdNqFPzb788vuLXhKPSZXHDrtKh6fxSuougYxemLXjYUq02KZAhlW9IU8q3y-EAusQXWn66sZt0lbhvySNn'
                    ].map((imgUrl, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <img 
                          src={imgUrl} 
                          alt={`Gallery item ${idx}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* -------------------- VIEW 4: STATS / DASHBOARD PAGE -------------------- */}
          {currentPage === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-[1200px] mx-auto w-full px-6 py-12 relative z-10"
            >
              <header className="mb-10 text-center md:text-left">
                <h1 className="text-3.5xl font-bold text-ink-black mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="material-symbols-outlined text-4xl text-jiang-blue inline">bar_chart</span>
                  芜湖旅游数据看板
                </h1>
                <p className="text-on-surface-variant font-medium text-base">
                  实时掌握平台内容分布与热度
                </p>
              </header>

              {/* KPI Summary Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                
                {/* KPI Item 1 */}
                <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-jiang-blue/15 flex items-center justify-center text-jiang-blue shrink-0">
                    <span className="material-symbols-outlined text-2xl material-symbols-fill">location_on</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-semibold">推荐总数</span>
                    <span className="text-2xl font-bold text-jiang-blue font-mono">
                      {DUMMY_STATS.totalCount} <span className="text-xs font-sans text-on-surface-variant font-normal">个</span>
                    </span>
                  </div>
                </div>

                {/* KPI Item 2 */}
                <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-cuisine-orange/15 flex items-center justify-center text-cuisine-orange shrink-0">
                    <span className="material-symbols-outlined text-2xl material-symbols-fill">star</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-semibold">平均评分</span>
                    <span className="text-2xl font-bold text-ink-black font-mono">
                      {DUMMY_STATS.avgRating} <span className="text-xs font-sans text-on-surface-variant font-normal">分</span>
                    </span>
                  </div>
                </div>

                {/* KPI Item 3 */}
                <div className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-nature-green/15 flex items-center justify-center text-nature-green shrink-0">
                    <span className="material-symbols-outlined text-2xl material-symbols-fill">grid_view</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-semibold">分类数量</span>
                    <span className="text-2xl font-bold text-ink-black font-mono">
                      {DUMMY_STATS.categoryCount} <span className="text-xs font-sans text-on-surface-variant font-normal">类</span>
                    </span>
                  </div>
                </div>

                {/* KPI Item 4 */}
                <div className="glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4 border-jiang-blue hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-jiang-blue/20 flex items-center justify-center text-jiang-blue shrink-0">
                    <span className="material-symbols-outlined text-2xl material-symbols-fill">chat</span>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant font-semibold">今日 AI 对话</span>
                    <span className="text-2xl font-bold text-jiang-blue font-mono">
                      {DUMMY_STATS.chatCount} <span className="text-xs font-sans text-on-surface-variant font-normal">次</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Distribution & Ranking Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
                
                {/* Left Card: Pie Chart (Category Distribution) -> 2 spans width */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border-gray/30 p-6 shadow-sm flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-[17px] font-bold text-ink-black flex items-center gap-2">
                      <span className="w-1 h-4 bg-jiang-blue rounded-full"></span>
                      景点分类分布
                    </h3>
                  </div>

                  {/* Rendering block */}
                  <div className="h-[280px] w-full flex items-center justify-center">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={CATEGORY_CHART_DATA}
                            cx="50%"
                            cy="45%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {CATEGORY_CHART_DATA.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => [`${value} 个景点`, '推荐计数']} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-sm text-outline">图表加载中...</div>
                    )}
                  </div>
                </div>

                {/* Right Card: Horizontal Bar Chart (Ratings Leaderboard) -> 3 spans width */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-border-gray/30 p-6 shadow-sm flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-[17px] font-bold text-ink-black flex items-center gap-2">
                      <span className="w-1 h-4 bg-jiang-blue rounded-full"></span>
                      评分 Top 10 排行
                    </h3>
                  </div>

                  <div className="h-[280px] w-full">
                    {isMounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={TOP_RATED_DATA}
                          layout="vertical"
                          margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
                        >
                          <XAxis type="number" domain={[4.0, 5.0]} stroke="#6e7979" fontSize={11} />
                          <YAxis dataKey="name" type="category" stroke="#3e4948" fontSize={11} width={85} />
                          <RechartsTooltip formatter={(value) => [`★ ${value} 分`, '真实游客评价']} />
                          <Bar 
                            dataKey="score" 
                            fill="#157878" 
                            radius={[0, 8, 8, 0]} 
                            barSize={12}
                          >
                            {TOP_RATED_DATA.map((entry, idx) => {
                              // Assign varying custom gradient colors
                              const colors = ['#157878', '#3D8B5F', '#D97A38', '#7B5EA7'];
                              return <Cell key={`bar-cell-${idx}`} fill={colors[idx % 4]} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-sm text-outline">图表加载中...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Trend area chart */}
              <div className="bg-white rounded-2xl border border-border-gray/30 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h3 className="text-[17px] font-bold text-ink-black flex items-center gap-2">
                    <span className="w-1 h-4 bg-jiang-blue rounded-full"></span>
                    AI 功能使用趋势 (近7日)
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#157878]"></span>
                      智能问答
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#3D8B5F]"></span>
                      路线规划
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#D97A38]"></span>
                      个性化推荐
                    </div>
                  </div>
                </div>

                <div className="h-[340px] w-full">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={AI_TREND_DATA}
                        margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                      >
                        <XAxis dataKey="date" stroke="#6e7979" fontSize={11} />
                        <YAxis stroke="#6e7979" fontSize={11} />
                        <RechartsTooltip />
                        
                        <Area 
                          type="monotone" 
                          dataKey="qna" 
                          stackId="1" 
                          stroke="#157878" 
                          fill="#157878" 
                          fillOpacity={0.15} 
                          name="智能问答" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="plan" 
                          stackId="1" 
                          stroke="#3D8B5F" 
                          fill="#3D8B5F" 
                          fillOpacity={0.15} 
                          name="路线规划" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="suggest" 
                          stackId="1" 
                          stroke="#D97A38" 
                          fill="#D97A38" 
                          fillOpacity={0.15} 
                          name="个性化推荐" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-sm text-outline animate-pulse">趋势加载中...</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------- VIEW 5: LOGIN / REGISTER PAGE -------------------- */}
          {currentPage === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-[1200px] mx-auto w-full px-6 py-8 flex flex-col md:flex-row min-h-[620px]"
            >
              <div className="w-full bg-white md:rounded-3xl shadow-lg border border-border-gray/35 flex overflow-hidden flex-col md:flex-row self-center my-auto">
                {/* Left Side Artistic section (60%) */}
                <div className="hidden md:flex md:w-[58%] relative overflow-hidden bg-ink-black min-h-[580px]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvMflJUB4B1Ttkzl5DN_1qfcjFF8852C49h5sxbthzlKiszhJbLpjMYV4rUoLsLKZ0rwDwAPP5FTmAU111VG9W8DxFF2WygvK0t--33x3S5kqzC-U5EtXiB4RDnliZpwszymK2EOx3w4uytQxgvjMD4tmBtMCac26v7bo2PD5k4pUgn-D8XZ042jAzuAyr1fqcmdmsCf1k9W9hR7VE2NcwOlucQQuhSE8gUzNmD6DOz-SFVcXTqPSijTf6LJqq8tunh53FGOyzVJjG" 
                    alt="Jiangbin Sunset Pagoda"
                    className="absolute inset-0 w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-[8000ms] ease-out pointer-events-none" 
                  />
                  
                  {/* Backdrop shroud gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-black/90 via-ink-black/35 to-transparent"></div>

                  {/* Corner frame detail */}
                  <div className="absolute top-12 left-12 w-20 h-px bg-white/30"></div>
                  <div className="absolute top-12 left-12 w-px h-20 bg-white/30"></div>

                  <div className="relative z-10 p-16 flex flex-col justify-end h-full text-white">
                    <span className="inline-block px-3.5 py-1.5 rounded-full bg-jiang-blue/20 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4 w-fit tracking-wider">
                      Discover Anhui
                    </span>
                    <h2 className="text-4xl font-bold font-display leading-tight tracking-tight mb-4">
                      Explore the <br />Beauty of Wuhu
                    </h2>
                    <p className="text-sm opacity-80 max-w-sm font-sans mb-8 leading-relaxed">
                      Immerse yourself in the poetic charm of the Yangtze River and the timeless elegance of Hui-style architecture.
                    </p>
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <MapPin size={14} className="text-rose-400" />
                      Jiangbin Park, Wuhu City
                    </div>
                  </div>
                </div>

                {/* Right Side form block (42%) */}
                <div className="w-full md:w-[42%] p-8 md:p-12 flex flex-col justify-between bg-white font-sans">
                  
                  {/* Top Header Logo */}
                  <div className="mb-8 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1.5">
                      <div className="w-9 h-9 bg-jiang-blue rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-jiang-blue/15">
                        <span className="material-symbols-outlined text-lg">waves</span>
                      </div>
                      <h3 className="text-xl font-bold text-jiang-blue tracking-tight">Wuhu Travel</h3>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium">
                      Riverside Ink Rhyme · Premium Experience
                    </p>
                  </div>

                  {/* Login/Register Panel Card */}
                  <div className="flex-grow flex flex-col justify-center max-w-sm w-full mx-auto">
                    {/* Tabs row */}
                    <div className="flex gap-6 mb-8 border-b border-border-gray relative">
                      <button 
                        onClick={() => {
                          setAuthTab('login');
                          setAuthSuccess(null);
                        }}
                        className={`pb-3 font-semibold text-[15px] cursor-pointer transition-all ${
                          authTab === 'login' 
                            ? 'text-jiang-blue border-b-2 border-jiang-blue' 
                            : 'text-outline hover:text-jiang-blue'
                        }`}
                      >
                        登录账户
                      </button>
                      <button 
                        onClick={() => {
                          setAuthTab('register');
                          setAuthSuccess(null);
                        }}
                        className={`pb-3 font-semibold text-[15px] cursor-pointer transition-all ${
                          authTab === 'register' 
                            ? 'text-jiang-blue border-b-2 border-jiang-blue' 
                            : 'text-outline hover:text-jiang-blue'
                        }`}
                      >
                        新会员注册
                      </button>
                    </div>

                    {authSuccess ? (
                      <div className="p-6 bg-nature-green/5 border border-nature-green/20 rounded-2xl text-center py-8">
                        <CheckCircle2 className="mx-auto text-nature-green mb-3" size={42} />
                        <h4 className="text-base font-bold text-ink-black mb-1">操作已成功！</h4>
                        <p className="text-xs text-on-surface-variant mb-6">{authSuccess}</p>
                        <button
                          onClick={() => {
                            setAuthSuccess(null);
                            setCurrentPage('home');
                          }}
                          className="px-6 py-2.5 bg-jiang-blue text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-jiang-blue/90"
                        >
                          返回首页探索
                        </button>
                      </div>
                    ) : (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAuthSuccess(authTab === 'login' ? '欢迎回来，登录授权已成功。' : '注册已成功！欢度您的江城之旅。');
                        }}
                        className="space-y-4"
                      >
                        {authTab === 'register' && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <label className="text-xs text-on-surface-variant font-semibold pl-0.5">真实姓名</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
                              <input 
                                type="text" 
                                required
                                placeholder="请输入您的名字" 
                                className="w-full pl-11 pr-4 py-3 bg-river-bg/70 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-jiang-blue focus:ring-1 focus:ring-jiang-blue transition-all"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-xs text-on-surface-variant font-semibold pl-0.5">电子邮箱或会员号</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
                            <input 
                              type="email" 
                              required
                              placeholder="请输入您的电子邮箱" 
                              className="w-full pl-11 pr-4 py-3 bg-river-bg/70 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-jiang-blue focus:ring-1 focus:ring-jiang-blue transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-on-surface-variant font-semibold pl-0.5">登录密码</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              required
                              placeholder="请输入不少于8位的密码" 
                              className="w-full pl-11 pr-11 py-3 bg-river-bg/70 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-jiang-blue focus:ring-1 focus:ring-jiang-blue transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-jiang-blue transition-colors cursor-pointer"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {authTab === 'login' ? (
                          <div className="flex items-center justify-between text-xs py-1">
                            <label className="flex items-center gap-1.5 cursor-pointer group">
                              <input type="checkbox" className="rounded text-jiang-blue focus:ring-jiang-blue w-4 h-4 border-outline-variant" />
                              <span className="text-on-surface-variant group-hover:text-jiang-blue transition-all font-medium">记住登录状态</span>
                            </label>
                            <span className="text-jiang-blue hover:underline cursor-pointer font-medium">忘记密码？</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-outline leading-relaxed py-1">
                            点击注册即表示您已阅读并同意我们的 <span className="text-jiang-blue hover:underline cursor-pointer">服务协议</span> 与 <span className="text-jiang-blue hover:underline cursor-pointer">隐私保护条款</span>。
                          </p>
                        )}

                        <button 
                          type="submit"
                          className="w-full py-3.5 mt-2 bg-jiang-gradient hover:opacity-90 active:scale-[0.98] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1 text-sm"
                        >
                          {authTab === 'login' ? '立即联登账户' : '注册会员账号'}
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Lower Third Social links */}
                  <div className="mt-8 border-t border-border-gray/50 pt-6">
                    <p className="text-center text-xs text-outline mb-4 font-medium">
                      或通过以下社交平台登入
                    </p>
                    <div className="flex gap-4 max-w-sm mx-auto">
                      <button 
                        onClick={() => setAuthSuccess('通过微信认证登录成功！')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-border-gray hover:border-jiang-blue hover:bg-river-bg/50 transition-all cursor-pointer group text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-[#07C160] text-sm group-hover:scale-105 transition-transform">chat</span>
                        微信登录
                      </button>
                      <button 
                        onClick={() => setAuthSuccess('通过QQ认证登录成功！')}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full border border-border-gray hover:border-jiang-blue hover:bg-river-bg/50 transition-all cursor-pointer group text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-[#12B7F5] text-sm group-hover:scale-105 transition-transform">alternate_email</span>
                        QQ 登录
                      </button>
                    </div>
                  </div>

                  {/* Copyright footnote */}
                  <footer className="mt-8 text-center text-[11px] text-outline">
                    <p>© 2024 Wuhu Travel platform. Exploring the spirit of the Yangtze.</p>
                  </footer>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* -------------------- DYNAMIC FLOATING ChatBot Messenger -------------------- */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
        
        {/* Chat window panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-border-gray/55 overflow-hidden flex flex-col mb-4 origin-bottom-right"
            >
              {/* Box Top title */}
              <div className="bg-jiang-blue px-5 py-4 flex justify-between items-center text-white shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] material-symbols-fill">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-wide leading-tight">江城旅伴 AI 助手</h4>
                    <span className="text-[10px] text-white/70 block">24小时随行智能旅游管家</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/90"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Box Message rows */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-river-bg/30 hui-pattern h-[280px]">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : ''}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-jiang-blue/10 flex items-center justify-center shrink-0 text-jiang-blue">
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                      </div>
                    )}
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-jiang-blue text-white rounded-tr-none shadow-sm' 
                        : 'bg-white text-ink-black rounded-tl-none border border-border-gray/30 shadow-subtle'
                    }`}>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Box suggestion chips & Text Input */}
              <div className="p-4 bg-white border-t border-border-gray/30">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
                  <button 
                    onClick={() => handleSendChat('🍜 美食推荐')}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-cuisine-orange/10 hover:bg-cuisine-orange/20 text-cuisine-orange text-xs font-semibold cursor-pointer transition-colors"
                  >
                    🍜 搜罗美食
                  </button>
                  <button 
                    onClick={() => handleSendChat('🗺️ 一日游经典推荐')}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-nature-green/10 hover:bg-nature-green/20 text-nature-green text-xs font-semibold cursor-pointer transition-colors"
                  >
                    🗺️ 探索一日游
                  </button>
                  <button 
                    onClick={() => handleSendChat('📸 热门打卡机位')}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-photo-purple/10 hover:bg-photo-purple/20 text-photo-purple text-xs font-semibold cursor-pointer transition-colors"
                  >
                    📸 打卡出片
                  </button>
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                    placeholder="请输入您的问题..."
                    className="w-full bg-river-bg/70 border border-border-gray/50 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-jiang-blue focus:ring-1 focus:ring-jiang-blue transition-all"
                  />
                  <button 
                    onClick={() => handleSendChat(chatInput)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-jiang-blue hover:scale-105 transition-transform cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Action FAB */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-jiang-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer text-center relative"
          title="江城旅伴"
        >
          {isChatOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        </button>
      </div>

      {/* -------------------- UNIVERSAL FOOTER BLOCK -------------------- */}
      <footer className="w-full py-16 px-6 bg-white border-t border-border-gray mt-auto font-sans">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-xl font-bold font-display text-jiang-blue tracking-wide mb-2 flex items-center justify-center md:justify-start gap-1">
              <span className="material-symbols-outlined text-lg">waves</span>
              Wuhu Travel
            </h4>
            <p className="text-on-surface-variant text-sm max-w-sm">
              © 2024 Wuhu Travel platform. Exploring the spirit of the Yangtze. 半城山水半城诗，记录每一份温暖美好的徽地旅程记忆。
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-[15px] font-medium text-on-surface-variant">
            <button onClick={() => setCurrentPage('home')} className="hover:text-jiang-blue transition-colors cursor-pointer">关于我们</button>
            <button onClick={() => setCurrentPage('scenery')} className="hover:text-jiang-blue transition-colors cursor-pointer">联系方式</button>
            <button onClick={() => setCurrentPage('stats')} className="hover:text-jiang-blue transition-colors cursor-pointer">数据政策</button>
            <button onClick={() => setCurrentPage('login')} className="hover:text-jiang-blue transition-colors cursor-pointer">使用条款</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
