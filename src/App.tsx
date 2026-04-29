/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, Home, GraduationCap, MapPin, 
  Instagram, MessageCircle, ArrowRight, Menu, X,
  LayoutDashboard, Bell, Settings, LogOut, Plus, Edit2, Trash2,
  ChevronLeft, ClipboardList, CheckCircle2, Lock, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ODI_CONTENT } from './constants/content';
import { db, auth, signInWithPassword } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  limit,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import emailjs from '@emailjs/browser';

const FORM_NOTIFICATION_EMAIL = 'rlawlgml0437@gmail.com';

// --- Firebase Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Shared Components ---

// --- News Components ---
const NewsModal = ({ isOpen, onClose, initialData }: { isOpen: boolean; onClose: () => void; initialData?: any }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    status: '게시중'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        imageUrl: initialData.imageUrl || '',
        status: initialData.status || '게시중'
      });
    } else {
      setFormData({ title: '', content: '', imageUrl: '', status: '게시중' });
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsResizing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize logic: max width 1000px
        const MAX_WIDTH = 1000;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to JPEG with 0.7 quality to reduce size
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setFormData(prev => ({ ...prev, imageUrl: base64 }));
        }
        setIsResizing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const today = new Date().toLocaleDateString('ko-KR');
    const newsData = {
      ...formData,
      date: today,
      updatedAt: serverTimestamp()
    };

    try {
      if (initialData?.id) {
        await setDoc(doc(db, 'news', initialData.id), {
          ...newsData,
          createdAt: initialData.createdAt || serverTimestamp()
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'news'), {
          ...newsData,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err) {
      handleFirestoreError(err, initialData ? OperationType.UPDATE : OperationType.CREATE, 'news');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-text/30 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold">{initialData ? '게시글 수정' : '새 게시글 작성'}</h2>
            <p className="text-gray-400 text-sm">소식을 전해보세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">제목</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="예: 4월 먼슬리뷰 모임 안내"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">대표 이미지 업로드</label>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="news-image-upload"
              />
              <label 
                htmlFor="news-image-upload"
                className="flex items-center justify-center w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-10 cursor-pointer hover:border-brand-point/50 hover:bg-brand-blue-light/10 transition-all group"
              >
                {isResizing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-point border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Processing...</span>
                  </div>
                ) : formData.imageUrl ? (
                  <div className="flex flex-col items-center space-y-3">
                    <img src={formData.imageUrl} alt="Preview" className="h-32 rounded-xl border border-gray-100" />
                    <span className="text-[10px] text-brand-point font-bold uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">이미지 교체하기</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="text-gray-300 group-hover:text-brand-point" size={32} />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">사진파일 선택</span>
                  </div>
                )}
              </label>
            </div>
            {formData.imageUrl && !isResizing && (
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-500 transition-colors ml-2"
              >
                이미지 삭제
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">내용</label>
            <textarea 
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="게시글 내용을 입력하세요..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30 transition-all font-light leading-relaxed"
            />
          </div>

          <div className="flex gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">게시 상태</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30 appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                >
                  <option value="게시중">게시중</option>
                  <option value="보관됨">보관됨</option>
                </select>
             </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full bg-brand-point text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-point/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {isSubmitting ? '저장 중...' : (initialData ? '수정 완료' : '게시하기')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const DEFAULT_NEWS = [
  {
    id: 'welcome',
    title: '오디워크룸 공지 및 소식 페이지가 열렸습니다',
    content: '앞으로 공간 운영 안내, 커뮤니티 프로그램, 이벤트 소식을 이곳에서 확인하실 수 있습니다.',
    date: '상시 안내',
    imageUrl: '/IMG_0180.JPG',
    status: '게시중',
    isDefault: true
  },
  {
    id: 'trial',
    title: '1일 무료체험 신청 안내',
    content: '오디워크룸이 궁금하다면 홈페이지 신청폼을 통해 1일 무료체험을 신청해보세요. 공간 분위기와 좌석을 직접 확인하실 수 있습니다.',
    date: '이용 안내',
    imageUrl: '/IMG_1057.JPG',
    status: '게시중',
    isDefault: true
  }
];

const sendRegistrationEmail = async (templateParams: Record<string, string>) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS settings are missing. Registration was saved without an email notification.');
    return;
  }

  await emailjs.send(serviceId, templateId, {
    to_email: FORM_NOTIFICATION_EMAIL,
    ...templateParams,
  }, publicKey);
};

const NewsView = ({ onBack }: { onBack: () => void }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'news'), 
      where('status', '==', '게시중'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setLoadError(false);
    }, (err) => {
      console.error('News list error:', err);
      setLoadError(true);
      setLoading(false);
    });
    return unsub;
  }, []);

  const visibleNews = news.length > 0 ? news : DEFAULT_NEWS;

  return (
    <motion.div 
      key="news"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pt-32 pb-24"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand-point font-bold tracking-widest text-sm mb-4 uppercase">NEWS & NOTICE</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">오디워크룸의 <br />어제와 오늘</h1>
        </div>

        {selectedPost ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mb-24"
          >
            {selectedPost.imageUrl && (
              <div className="w-full h-80 overflow-hidden">
                <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-10">
              <button 
                onClick={() => setSelectedPost(null)}
                className="flex items-center space-x-2 text-gray-400 hover:text-brand-point mb-8 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                <ArrowRight className="rotate-180" size={14} />
                <span>Back to List</span>
              </button>
              <h2 className="text-3xl font-bold mb-4">{selectedPost.title}</h2>
              <p className="text-gray-400 font-mono text-sm mb-10 pb-10 border-b border-gray-50">{selectedPost.date}</p>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-light">
                {selectedPost.content}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-6 mb-24">
            {loading ? (
               <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center text-gray-300">소식을 불러오는 중...</div>
            ) : loadError ? (
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 text-center mb-4">
                <p className="text-gray-500 font-light leading-relaxed">
                  현재 실시간 공지를 불러오지 못해 기본 안내를 보여드리고 있습니다.
                </p>
              </div>
            ) : null}

            {!loading && visibleNews.map((post) => (
              <motion.div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-xl hover:border-brand-point/20 group"
              >
                {post.imageUrl && (
                  <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  </div>
                )}
                <div className="p-8 flex flex-col justify-center flex-1">
                  <span className="text-[10px] text-brand-point font-bold uppercase tracking-widest mb-2">Notice</span>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-brand-point transition-colors">{post.title}</h3>
                  <p className="text-gray-500 text-sm font-light mb-4 line-clamp-2">{post.content}</p>
                  <p className="text-gray-400 font-mono text-xs">{post.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer onViewChange={(view) => { if(view === 'home') onBack(); }} />
    </motion.div>
  );
};

const RegistrationModal = ({ 
  program, 
  isOpen, 
  onClose, 
}: { 
  program: string; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [formData, setFormData] = useState({ name: '', contact: '', reason: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const registrationData = {
        ...formData,
        program,
        date: new Date().toLocaleDateString(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'registrations'), registrationData);
      
      // Send Email Notification
      try {
        await sendRegistrationEmail({
          program_name: program,
          user_name: formData.name,
          user_contact: formData.contact,
          user_reason: formData.reason,
          submit_date: registrationData.date
        });
      } catch (mailError) {
        console.error("Email notification failed:", mailError);
      }
      
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({ name: '', contact: '', reason: '' });
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-bold">{program} 신청하기</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">이름</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="성함을 입력해주세요"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">연락처</label>
                <input 
                  required
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">신청 동기 (자유롭게)</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="어떤 기대를 가지고 신청하시나요?"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30 resize-none" 
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-5 text-base shadow-xl shadow-brand-point/20 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>신청 완료하기</span>
                )}
              </button>
            </form>
          ) : (
            <div className="py-20 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">신청이 접수되었습니다!</h4>
                <p className="text-gray-500">확인 후 연락드리겠습니다.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const TrialApplicationModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    trialDate: '',
    job: '',
    referral: '',
    questions: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitWarning, setSubmitWarning] = useState('');

  if (!isOpen) return null;

  const resetAndClose = () => {
    onClose();
    setIsSubmitted(false);
    setSubmitError('');
    setSubmitWarning('');
    setFormData({
      name: '',
      contact: '',
      trialDate: '',
      job: '',
      referral: '',
      questions: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitWarning('');

    const submitDate = new Date().toLocaleDateString('ko-KR');
    const detailMessage = [
      `성함: ${formData.name}`,
      `연락처: ${formData.contact}`,
      `체험 날짜: ${formData.trialDate}`,
      `하시는 일: ${formData.job}`,
      `유입 경로: ${formData.referral}`,
      `궁금하신 점: ${formData.questions || '없음'}`,
    ].join('\n');

    try {
      const registrationData = {
        program: '1일 무료체험',
        name: formData.name,
        contact: formData.contact,
        reason: detailMessage,
        date: submitDate,
        trialDate: formData.trialDate,
        job: formData.job,
        referral: formData.referral,
        questions: formData.questions,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'registrations'), registrationData);

      try {
        await sendRegistrationEmail({
          program_name: '1일 무료체험',
          user_name: formData.name,
          user_contact: formData.contact,
          trial_date: formData.trialDate,
          user_job: formData.job,
          referral_path: formData.referral,
          user_questions: formData.questions || '없음',
          user_reason: detailMessage,
          submit_date: submitDate,
        });
      } catch (mailError) {
        console.error('Trial application email failed:', mailError);
        setSubmitWarning('신청은 접수되었지만 메일 발송에 실패했습니다. EmailJS 설정을 확인해주세요.');
      }

      setIsSubmitted(true);
      setTimeout(resetAndClose, 2200);
    } catch (error) {
      console.error('Trial application failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(
        message.includes('permission') || message.includes('Missing or insufficient permissions')
          ? '신청 저장 권한이 거절되었습니다. Firestore 보안 규칙 배포가 필요합니다.'
          : '신청 접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-6 md:p-10">
          <div className="flex justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-bold text-brand-point uppercase tracking-widest mb-2">Free Trial</p>
              <h3 className="text-2xl md:text-3xl font-bold">1일 무료체험 신청</h3>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              aria-label="신청폼 닫기"
              className="h-10 w-10 flex-shrink-0 inline-flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">성함</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="성함을 입력해주세요"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">연락처</label>
                  <input
                    required
                    type="tel"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">체험 날짜</label>
                  <input
                    required
                    type="date"
                    value={formData.trialDate}
                    onChange={(e) => setFormData({ ...formData, trialDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">하시는 일</label>
                  <input
                    required
                    type="text"
                    value={formData.job}
                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                    placeholder="예: 디자이너, 개발자, 프리랜서"
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">유입 경로</label>
                <input
                  required
                  type="text"
                  value={formData.referral}
                  onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                  placeholder="예: 인스타그램, 네이버 검색, 지인 추천"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">궁금하신 점</label>
                <textarea
                  rows={5}
                  value={formData.questions}
                  onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  placeholder="궁금하신 점을 자유롭게 적어주세요"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30 resize-none"
                />
              </div>

              {submitError && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-500">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-5 text-base shadow-xl shadow-brand-point/20 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>신청폼 제출하기</span>
                )}
              </button>
            </form>
          ) : (
            <div className="py-16 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">무료체험 신청이 접수되었습니다!</h4>
                <p className="text-gray-500">확인 후 연락드리겠습니다.</p>
                {submitWarning && (
                  <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-700">
                    {submitWarning}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12 text-center">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl mb-4"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-gray-500 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

// --- Page Sections ---

const Navbar = ({ onViewChange, currentView }: { onViewChange: (view: 'home' | 'admin' | 'space-detail' | 'pricing-detail' | 'news') => void; currentView: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (view: 'home' | 'admin' | 'space-detail' | 'pricing-detail' | 'news') => {
    onViewChange(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 bg-white shadow-sm py-4`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={() => handleNav('home')}>
          <img 
            src="/logo.svg" 
            alt="OD workroom Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback to text logo if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-point rounded-lg rotate-12 flex items-center justify-center">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className="text-xl font-bold text-brand-text tracking-tight">
              {ODI_CONTENT.brand.name}
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <button onClick={() => handleNav('home')} className={`hover:text-brand-point transition-colors ${currentView === 'home' ? 'text-brand-point' : ''}`}>홈</button>
          <button onClick={() => handleNav('space-detail')} className={`hover:text-brand-point transition-colors ${currentView === 'space-detail' ? 'text-brand-point' : ''}`}>공간 소개</button>
          <button onClick={() => handleNav('pricing-detail')} className={`hover:text-brand-point transition-colors ${currentView === 'pricing-detail' ? 'text-brand-point' : ''}`}>이용권 안내</button>
          <button onClick={() => handleNav('news')} className={`hover:text-brand-point transition-colors ${currentView === 'news' ? 'text-brand-point' : ''}`}>공지 및 소식</button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-brand-text" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl py-8 px-6 flex flex-col space-y-4 md:hidden"
          >
            <button className="text-left py-2 font-medium" onClick={() => handleNav('home')}>홈</button>
            <button className="text-left py-2 font-medium" onClick={() => handleNav('space-detail')}>공간 소개</button>
            <button className="text-left py-2 font-medium" onClick={() => handleNav('pricing-detail')}>이용권 안내</button>
            <button className="text-left py-2 font-medium" onClick={() => handleNav('news')}>공지 및 소식</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onSpaceTour, onTrialApply }: { onSpaceTour: () => void; onTrialApply: () => void }) => (
  <section className="relative min-h-screen flex items-end justify-center overflow-hidden pb-12 md:pb-16">
    <div className="absolute inset-0 z-0">
      <video 
        src="/main%20video.mp4" 
        autoPlay 
        muted 
        playsInline
        className="w-full h-full object-cover"
      />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl md:text-2xl mb-6 max-w-3xl mx-auto font-medium leading-relaxed"
      >
        혼자 일하는 사람들을 위한 김포 운양동의 커뮤니티형 오픈 작업실
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
      >
        <button onClick={onSpaceTour} className="btn-primary bg-white border-white text-brand-point hover:bg-brand-point hover:text-white w-full sm:w-auto cursor-pointer">공간 둘러보기</button>
        <button type="button" onClick={onTrialApply} className="btn-secondary bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-brand-point w-full sm:w-auto">1일 무료체험 신청</button>
      </motion.div>
    </div>
  </section>
);

const SpaceDetail = ({ onTrialApply }: { onTrialApply: () => void }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-brand-bg relative pb-24 pt-24"
    >
      <div className="max-w-5xl mx-auto px-6 pt-16">
        <SectionTitle 
          title="가장 나다운 몰입이 시작되는 곳" 
          subtitle="오디워크룸의 모든 좌석은 당신의 성장을 위해 정교하게 설계되었습니다."
        />

        <div className="space-y-32">
          {ODI_CONTENT.pricing.map((plan: any, idx: number) => (
            <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-16 items-start`}>
              <div className="w-full md:w-1/2">
                <div className="aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl relative group">
                  <img 
                    src={plan.image} 
                    alt={plan.type} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-8 left-8">
                    <span className="badge-label bg-white text-brand-point mb-2 inline-block">Option {idx + 1}</span>
                    <h3 className="text-white text-3xl font-bold">{plan.type}</h3>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 space-y-8 py-4">
                <div>
                  <p className="text-brand-point text-sm font-bold uppercase tracking-widest mb-4">{plan.benefit}</p>
                  <h3 className="text-3xl font-bold mb-6 leading-tight">{plan.descriptionTitle}</h3>
                  <p className="text-gray-500 leading-relaxed whitespace-pre-line font-light">
                    {plan.descriptionBody}
                  </p>
                </div>

                <div className="space-y-8 pt-4">
                  {plan.details?.map((detail: any, dIdx: number) => (
                    <div key={dIdx} className="flex gap-4">
                      <div className="text-2xl pt-1">{detail.emoji}</div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">{detail.title}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed font-light">{detail.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex space-x-4">
                   <a href={ODI_CONTENT.brand.contact.kakao} className="btn-primary flex-1 text-center py-4">
                      {plan.buttonText}
                   </a>
                   <a href={ODI_CONTENT.brand.contact.instagram} className="btn-secondary px-6">
                      <Instagram size={20} />
                   </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-40 bg-white p-12 md:p-20 rounded-[60px] text-center border border-gray-100 shadow-sm">
           <SectionTitle 
              title="지금 바로 경험해보세요" 
              subtitle="백문이 불여일견, 오디워크룸의 온기를 직접 느껴보시는 건 어떨까요?"
           />
           <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button type="button" onClick={onTrialApply} className="btn-primary py-4 px-12">
                1일 무료체험 신청하기
              </button>
              <a href={ODI_CONTENT.brand.contact.kakao} className="btn-secondary py-4 px-12">
                이용권 상세 문의
              </a>
           </div>
        </div>
      </div>
      
      <div className="mt-24 text-center py-12 border-t border-gray-100">
          <p className="text-xs text-gray-300">© 2026 OD workroom. All rights reserved.</p>
      </div>
    </motion.div>
  );
};

const Introduction = () => (
  <section id="intro" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <img 
            src="/IMG_0504.JPG" 
            alt="Intro" 
            className="rounded-[40px] shadow-2xl brightness-95"
          />
        </motion.div>
        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl mb-2 text-left"
          >
            {ODI_CONTENT.intro.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-500 leading-relaxed"
          >
            {ODI_CONTENT.intro.description}
          </motion.p>
          <div className="pt-8 space-y-6 border-t border-gray-100">
            <div>
              <p className="text-xl text-brand-point font-bold">카페 콘센트 전쟁은 이제 그만</p>
            </div>
            <div>
              <p className="text-xl text-brand-point font-bold">24시간 언제든 내가 원하는 시간에 작업</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Audience = () => {
  const getIcon = (name: string) => {
    switch(name) {
      case 'User': return <User className="text-brand-point" />;
      case 'Briefcase': return <Briefcase className="text-brand-point" />;
      case 'Home': return <Home className="text-brand-point" />;
      case 'GraduationCap': return <GraduationCap className="text-brand-point" />;
      default: return null;
    }
  };

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle 
          title="어떤 분들이 오시나요?" 
          subtitle="우리는 서로 다른 일을 하지만, '성장'이라는 하나의 공통점으로 연결되어 있습니다."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ODI_CONTENT.targetAudience?.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card group hover:-translate-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-blue-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-xl mb-4">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Atmosphere = () => (
  <section id="atmosphere" className="py-24 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6">
      <SectionTitle 
        title={ODI_CONTENT.atmosphere.title}
        subtitle={ODI_CONTENT.atmosphere.highlight}
      />
      
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {ODI_CONTENT.atmosphere.images?.map((img, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lg"
          >
            <img src={img} alt="Atmosphere" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <div className="bg-brand-bg p-8 rounded-3xl border border-dashed border-brand-point/30 max-w-4xl mx-auto">
        <p className="text-brand-text/70 text-sm text-center leading-relaxed italic whitespace-nowrap">
          {ODI_CONTENT.atmosphere.notice}
        </p>
      </div>

      <div className="mt-20">
        <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-8 font-bold">오디 사람들의 직업</p>
        <div className="flex flex-wrap justify-center gap-3">
          {ODI_CONTENT.members?.map((member, i) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="px-4 py-2 rounded-full border border-gray-100 bg-white text-sm text-gray-600 shadow-sm hover:border-brand-point hover:text-brand-point transition-all cursor-default"
            >
              #{member}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Pricing = ({ onMoreDetail }: { onMoreDetail: () => void }) => (
  <section id="pricing" className="py-24 bg-brand-bg">
    <div className="max-w-7xl mx-auto px-6">
      <SectionTitle 
        title="나에게 딱 맞는 이용권"
        subtitle="나의 작업 스타일과 루틴에 맞춰 최적의 옵션을 선택하세요."
      />
      
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <p className="inline-block bg-white px-6 py-2 rounded-full text-brand-point text-xs font-bold border border-brand-point/20 shadow-sm">
          💡 {ODI_CONTENT.pricingProps.disclaimer}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        {ODI_CONTENT.pricing.slice(0, 2).map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`card relative overflow-hidden flex flex-col h-full ${i === 1 ? 'border-brand-point ring-1 ring-brand-point' : ''}`}
          >
            {i === 1 && (
              <div className="absolute top-0 right-0 bg-brand-point text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <p className="text-brand-point text-sm font-bold uppercase tracking-widest mb-2">{plan.benefit}</p>
              <h3 className="text-3xl mb-4">{plan.type}</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-400 ml-2">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {plan.features?.map((f: string, j: number) => (
                <li key={j} className="flex items-start text-sm text-gray-600">
                  <ArrowRight size={16} className="text-brand-point mt-0.5 mr-3 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={onMoreDetail} className={`text-center py-4 rounded-2xl font-bold transition-all ${i === 1 ? 'bg-brand-point text-white hover:shadow-lg' : 'bg-brand-blue-light text-brand-point hover:bg-brand-point/20'}`}>
              상세 정보 확인하기
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Location = () => (
  <section id="location" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <SectionTitle title="오시는 길" />
      <div className="max-w-2xl mx-auto space-y-12 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-brand-blue-light rounded-3xl text-brand-point mb-2">
            <MapPin size={32} />
          </div>
          <div>
            <h4 className="font-bold text-2xl mb-2">{ODI_CONTENT.brand.location}</h4>
            <p className="text-gray-500">운양역 4번 출구 도보 1분 (현대센트럴스퀘어)</p>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <a href={ODI_CONTENT.brand.contact.naverMap} target="_blank" rel="noopener noreferrer" className="btn-secondary py-5 flex items-center justify-center space-x-2 w-full text-lg">
            <span>네이버 지도에서 보기</span>
          </a>
          <a href={ODI_CONTENT.brand.contact.kakao} target="_blank" rel="noopener noreferrer" className="btn-primary py-5 flex items-center justify-center space-x-2 w-full text-lg">
            <MessageCircle size={20} />
            <span>카카오톡으로 예약 상담</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ onViewChange }: { onViewChange: (view: any) => void }) => {
  const handleExploreClick = (sectionId: string) => {
    onViewChange('home');
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
  <footer className="bg-brand-text text-white/80 py-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
        <div className="col-span-2 flex flex-col items-start text-left">
          <div className="mb-6 cursor-pointer text-left md:-translate-x-[23px]">
            <img 
              src="/logo.svg" 
              alt="OD workroom Logo" 
              className="h-10 w-auto object-contain brightness-0 invert block"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-point rounded-lg rotate-12 flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {ODI_CONTENT.brand.name}
              </span>
            </div>
          </div>
          <p className="text-white/60 text-sm max-w-sm mb-6 leading-relaxed">
            {ODI_CONTENT.brand.concept} - {ODI_CONTENT.brand.slogan}
          </p>
          <div className="flex space-x-4">
            <a href={ODI_CONTENT.brand.contact.instagram} className="p-3 bg-white/5 rounded-full hover:bg-brand-point transition-colors">
              <Instagram size={20} />
            </a>
            <a href={ODI_CONTENT.brand.contact.kakao} className="p-3 bg-white/5 rounded-full hover:bg-brand-point transition-colors">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Explore</h4>
          <ul className="space-y-4 text-sm font-light">
            <li>
              <button type="button" onClick={() => handleExploreClick('intro')} className="hover:text-brand-point">
                스토리
              </button>
            </li>
            <li>
              <button type="button" onClick={() => handleExploreClick('atmosphere')} className="hover:text-brand-point">
                공간 확인
              </button>
            </li>
            <li>
              <button type="button" onClick={() => handleExploreClick('pricing')} className="hover:text-brand-point">
                이용권 안내
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6">Contact</h4>
          <ul className="space-y-4 text-sm font-light">
            <li className="flex items-center space-x-2">
               <MapPin size={14} className="text-brand-point" />
               <span>{ODI_CONTENT.brand.location}</span>
            </li>
            <li className="flex items-center space-x-2">
               <span className="text-brand-point text-xs">@</span>
               <span>{ODI_CONTENT.brand.contact.email}</span>
            </li>
            <li className="text-white/40 italic">평일 10:00 - 19:00 (문의 상담)</li>
          </ul>
        </div>
      </div>
      <div className="pt-12 text-xs flex justify-between items-center text-white/30">
        <p>
          © 2026 {ODI_CONTENT.brand.engName}. All rights reserved
          <button
            type="button"
            onClick={() => onViewChange('admin')}
            aria-label="관리자 로그인"
            title="관리자 로그인"
            className="inline-flex h-6 w-6 translate-y-1 items-center justify-center text-white/30 hover:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            .
          </button>
        </p>
        <p>Design by OD workroom</p>
      </div>
    </div>
  </footer>
  );
};

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- Admin UI ---

const ADMIN_LOGIN_ID = 'odworkroom';
const ADMIN_LOGIN_EMAIL = 'odworkroom@odworkroom.local';

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'registrations' | 'analytics'>('analytics');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<any | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [isInitializingAdmin, setIsInitializingAdmin] = useState(false);
  const [adminSetupError, setAdminSetupError] = useState('');
  const [isPreparingLogin, setIsPreparingLogin] = useState(true);

  useEffect(() => {
    auth.signOut().finally(() => setIsPreparingLogin(false));
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNewsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'news'));
    return unsub;
  }, [user, isAdmin]);

  const handleDeleteNews = async (post: any) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    if (post.isDefault) {
      const hiddenIds = JSON.parse(localStorage.getItem('hiddenDefaultNewsIds') || '[]');
      const nextHiddenIds = Array.from(new Set([...hiddenIds, post.id]));
      localStorage.setItem('hiddenDefaultNewsIds', JSON.stringify(nextHiddenIds));
      setHiddenDefaultNewsIds(nextHiddenIds);
      return;
    }

    try {
      await deleteDoc(doc(db, 'news', post.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `news/${post.id}`);
    }
  };
  const [hiddenDefaultNewsIds, setHiddenDefaultNewsIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hiddenDefaultNewsIds') || '[]');
    } catch {
      return [];
    }
  });
  const [stats, setStats] = useState([
    { label: '오늘 방문자', value: '0', change: '-' },
    { label: '7일 방문 합계', value: '0', change: '-' },
    { label: '누적 신청 건수', value: '0', change: '-' }
  ]);
  const visibleNewsList = newsList.length > 0 ? newsList : DEFAULT_NEWS.filter(post => !hiddenDefaultNewsIds.includes(post.id));

  useEffect(() => {
    if (isPreparingLogin) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAdmin(adminDoc.exists());
        } catch (error) {
          console.error("Admin check failed", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
        setRegistrations([]);
      }
    });
    return () => unsubscribe();
  }, [isPreparingLogin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchAnalytics = async () => {
      const days = [];
      const todayStr = new Date().toISOString().split('T')[0];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
      }

      const results = await Promise.all(days.map(day => getDoc(doc(db, 'analytics', day))));
      const chartData = results.map((snap, i) => ({
        name: days[i].slice(5),
        visits: snap.exists() ? snap.data().count : 0
      }));
      
      setAnalyticsData(chartData);

      const todayVisits = chartData[chartData.length - 1].visits;
      const totalVisits = chartData.reduce((acc, curr) => acc + curr.visits, 0);
      
      setStats([
        { label: '오늘 방문자', value: String(todayVisits), change: '오늘' },
        { label: '7일 방문 합계', value: String(totalVisits), change: '최근 7일' },
        { label: '누적 신청 건수', value: String(registrations.length), change: '전체' }
      ]);
    };

    fetchAnalytics();
  }, [user, isAdmin, registrations.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      if (loginForm.id.trim() !== ADMIN_LOGIN_ID) {
        setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      await signInWithPassword(ADMIN_LOGIN_EMAIL, loginForm.password);
    } catch (error) {
      console.error("Login failed", error);
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : '';

      if (code.includes('invalid-email')) {
        setLoginError('아이디는 Firebase에 등록된 이메일 형식이어야 합니다.');
      } else if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
        setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (code.includes('too-many-requests')) {
        setLoginError('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else if (code.includes('operation-not-allowed')) {
        setLoginError('Firebase Authentication에서 이메일/비밀번호 로그인이 아직 활성화되지 않았습니다.');
      } else {
        setLoginError(message || '로그인하지 못했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInitializeAdmin = async () => {
    if (!user) return;
    setIsInitializingAdmin(true);
    setAdminSetupError('');
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        createdAt: serverTimestamp()
      });
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin initialization failed:', error);
      const message = error instanceof Error ? error.message : String(error);
      setAdminSetupError(
        message.includes('Missing or insufficient permissions')
          ? '관리자 등록 권한이 거절되었습니다. Firestore 보안 규칙이 최신으로 배포되어 있는지 확인해주세요.'
          : message || '관리자 등록에 실패했습니다. 잠시 후 다시 시도해주세요.'
      );
    } finally {
      setIsInitializingAdmin(false);
    }
  };

  if (isPreparingLogin) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-12 h-12 border-2 border-brand-point border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h1 className="text-2xl font-bold mb-2">로그인 화면 준비 중</h1>
            <p className="text-gray-500 text-sm">보안을 위해 이전 로그인 상태를 초기화하고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-brand-blue-light rounded-[30px] flex items-center justify-center mx-auto rotate-12">
            <Lock className="text-brand-point" size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Admin Login</h1>
            <p className="text-gray-500">설정한 아이디와 비밀번호로 로그인하세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">아이디</label>
              <input
                required
                type="text"
                autoComplete="username"
                value={loginForm.id}
                onChange={(e) => setLoginForm({ ...loginForm, id: e.target.value })}
                placeholder="관리자 아이디"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">비밀번호</label>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="비밀번호"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-point/30"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-brand-point text-white py-4 rounded-2xl font-bold hover:bg-brand-point-hover transition-all shadow-lg shadow-brand-point/20 disabled:opacity-60 disabled:cursor-wait"
            >
              {isLoggingIn ? '로그인 중...' : '로그인하기'}
            </button>
          </form>
          {loginError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-left text-sm leading-relaxed text-red-500">
              {loginError}
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-brand-text text-sm underline">메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-12 h-12 border-2 border-brand-point border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <h1 className="text-2xl font-bold mb-2">관리자 권한 확인 중</h1>
            <p className="text-gray-500 text-sm">로그인 계정의 접근 권한을 확인하고 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center mx-auto">
            <Lock className="text-red-500" size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">접근 권한이 없습니다</h1>
            <p className="text-gray-500">관리자로 등록되지 않은 계정입니다. ({user.email})</p>
          </div>
          {user.email === ADMIN_LOGIN_EMAIL && (
            <button 
              onClick={handleInitializeAdmin}
              disabled={isInitializingAdmin}
              className="w-full bg-brand-point text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              {isInitializingAdmin ? '관리자로 등록 중...' : '현재 계정을 관리자로 등록하기'}
            </button>
          )}
          {adminSetupError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-left text-sm leading-relaxed text-red-500">
              {adminSetupError}
            </div>
          )}
          <button onClick={() => auth.signOut()} className="text-gray-400 hover:text-brand-text text-sm underline block w-full px-4">다른 계정으로 로그인</button>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-text text-sm underline block w-full px-4">메인으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[100] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col p-6 space-y-8 bg-gray-50/50">
        <div className="flex items-center space-x-2 px-2">
          <div className="w-8 h-8 bg-brand-point rounded-lg rotate-12 flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="text-xl font-bold text-brand-text">Admin</span>
        </div>

        <nav className="flex-grow space-y-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-brand-point text-white shadow-lg shadow-brand-point/30' : 'text-gray-500 hover:bg-white hover:text-brand-text'}`}
          >
            <LayoutDashboard size={18} />
            <span>방문자 통계</span>
          </button>
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === 'registrations' ? 'bg-brand-point text-white shadow-lg shadow-brand-point/30' : 'text-gray-500 hover:bg-white hover:text-brand-text'}`}
          >
            <ClipboardList size={18} />
            <span>신청 내역 관리</span>
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === 'posts' ? 'bg-brand-point text-white shadow-lg shadow-brand-point/30' : 'text-gray-500 hover:bg-white hover:text-brand-text'}`}
          >
            <Edit2 size={18} />
            <span>공지사항 관리</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-200">
          <div className="px-4 py-3 mb-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Signed in as</p>
            <p className="text-xs font-medium truncate">{user.email}</p>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">로그아웃</span>
          </button>
          <button 
            onClick={onClose}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-brand-text transition-colors"
          >
            <Home size={18} />
            <span className="text-sm font-medium">홈으로</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto bg-white p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl mb-2">관리자 대시보드</h1>
            <p className="text-gray-500 text-sm">운양동 오디워크룸의 현황을 한눈에 확인하세요.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-bold">{s.label}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">{s.value}</span>
                <span className="text-[10px] text-brand-point font-bold">{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Content */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-xl font-bold">방문자 트렌드</h2>
                    <p className="text-gray-400 text-sm">최근 7일간의 일별 방문자 수입니다.</p>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#9ca3af'}} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#9ca3af'}} 
                      />
                      <Tooltip 
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{
                          borderRadius: '16px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="visits" radius={[6, 6, 0, 0]} barSize={40}>
                        {analyticsData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === analyticsData.length - 1 ? '#F17D83' : '#FDECEC'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6">최근 신청 리스트</h2>
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">신청 항목</th>
                    <th className="px-6 py-4">신청자</th>
                    <th className="px-6 py-4">연락처</th>
                    <th className="px-6 py-4">일자</th>
                    <th className="px-6 py-4">상세 내용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.length > 0 ? registrations.map((reg, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-point">{reg.program}</td>
                      <td className="px-6 py-4 font-medium">{reg.name}</td>
                      <td className="px-6 py-4 font-mono text-gray-500">{reg.contact}</td>
                      <td className="px-6 py-4 text-gray-400">{reg.trialDate || reg.date}</td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-sm">
                        {reg.trialDate ? (
                          <div className="space-y-1">
                            <p><span className="font-bold text-gray-700">일:</span> {reg.job}</p>
                            <p><span className="font-bold text-gray-700">유입:</span> {reg.referral}</p>
                            <p className="truncate"><span className="font-bold text-gray-700">문의:</span> {reg.questions || '없음'}</p>
                          </div>
                        ) : (
                          <span className="line-clamp-2">{reg.reason}</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-light">신청 내역이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">공지사항 & 소식</h2>
              <button 
                onClick={() => { setEditingNews(null); setIsNewsModalOpen(true); }}
                className="flex items-center space-x-2 bg-brand-point text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-point/20 hover:scale-105 transition-all"
              >
                <Plus size={16} />
                <span>새 게시글 작성</span>
              </button>
            </div>
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">제목</th>
                    <th className="px-6 py-4">작성일</th>
                    <th className="px-6 py-4">상태</th>
                    <th className="px-6 py-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleNewsList.length > 0 ? visibleNewsList.map((post, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{post.title}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono">{post.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${post.isDefault ? 'bg-blue-50 text-blue-500' : post.status === '게시중' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {post.isDefault ? '기본 안내' : post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingNews(post); setIsNewsModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:border-brand-point/30 hover:text-brand-point"
                          >
                            <Edit2 size={14} />
                            <span>수정</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteNews(post)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                            <span>삭제</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-light">작성된 게시글이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <NewsModal 
              isOpen={isNewsModalOpen}
              onClose={() => setIsNewsModalOpen(false)}
              initialData={editingNews}
            />
          </div>
        )}

      </main>
    </div>
  );
};

const PricingDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-brand-bg relative pb-24 pt-24"
    >
      <div className="max-w-5xl mx-auto px-6 pt-16">
        <SectionTitle 
          title="나에게 딱 맞는 이용권" 
          subtitle="합리적인 가격으로 최상의 업무 환경을 누리세요."
        />

        <div className="max-w-2xl mx-auto mb-16 text-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block bg-white px-8 py-4 rounded-3xl text-brand-point border-2 border-brand-point/10 shadow-lg shadow-brand-point/5"
          >
            <p className="text-sm font-bold flex items-center justify-center gap-2">
              <span className="text-xl">✨</span> {ODI_CONTENT.pricingProps.disclaimer}
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-24">
          {ODI_CONTENT.pricing.filter((p: any) => p.type !== '휴게 라운지').map((plan: any, i: number) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card relative overflow-hidden flex flex-col h-full border-2 ${i === 1 ? 'border-brand-point shadow-2xl shadow-brand-point/10 scale-105 z-10' : 'border-white'}`}
            >
              {i === 1 && (
                <div className="absolute top-0 right-0 bg-brand-point text-white text-[10px] font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <div className="mb-8">
                <p className="text-brand-point text-xs font-bold uppercase tracking-widest mb-3">{plan.benefit}</p>
                <h3 className="text-4xl font-bold mb-4">{plan.type}</h3>
              </div>

              <div className="space-y-4 mb-8">
                {plan.periods?.map((p: any, pIdx: number) => (
                  <div key={pIdx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700">{p.label}</span>
                      {p.tag && <span className="text-[10px] bg-brand-point/10 text-brand-point font-bold px-2 py-0.5 rounded-full">{p.tag}</span>}
                    </div>
                    <span className="font-bold text-brand-text">{p.price} <span className="text-[10px] text-gray-400 font-normal">/월</span></span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 flex-grow mb-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">기본 제공 혜택</p>
                <ul className="grid grid-cols-1 gap-2">
                  {plan.features?.map((f: string, j: number) => (
                    <li key={j} className="flex items-center text-xs text-gray-600">
                       <ArrowRight size={10} className="text-brand-point mr-2 flex-shrink-0" />
                       <span className="font-light">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href={ODI_CONTENT.brand.contact.kakao} 
                className={`text-center py-4 rounded-2xl font-bold transition-all text-sm tracking-tight ${i === 1 ? 'bg-brand-point text-white shadow-xl shadow-brand-point/30 hover:scale-[1.02]' : 'bg-brand-blue-light text-brand-point hover:bg-brand-point/10'}`}
              >
                {plan.buttonText}
              </a>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <SectionTitle 
            title="부가 서비스" 
            subtitle="필요에 따라 더 편리하게 이용하세요."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {ODI_CONTENT.extraServices?.map((service: any, sIdx: number) => (
              <div key={sIdx} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <h4 className="font-bold text-base text-gray-800 whitespace-nowrap">{service.name}</h4>
                  <p className="text-xs text-gray-400 font-light truncate">{service.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-brand-point whitespace-nowrap">{service.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "24시간 연중무휴", desc: "나의 라이프스타일에 맞춰 언제든 자유로운 이용" },
             { title: "초고속 무선 인터넷", desc: "끊김 없는 화상 회의와 대용량 파일 전송까지" },
             { title: "무제한 시음 서비스", desc: "매칭된 스페셜티 원두 커피와 다양한 차/다과" }
           ].map((item, idx) => (
             <div key={idx} className="text-center p-8 rounded-3xl bg-white/50 border border-gray-100">
               <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
               <p className="text-xs text-gray-500 font-light">{item.desc}</p>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<'home' | 'admin' | 'space-detail' | 'pricing-detail' | 'news'>('home');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isTrialApplicationOpen, setIsTrialApplicationOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');

  useEffect(() => {
    const syncViewFromHash = () => {
      const hashView = window.location.hash.replace('#', '');
      if (['home', 'admin', 'space-detail', 'pricing-detail', 'news'].includes(hashView)) {
        setView(hashView as 'home' | 'admin' | 'space-detail' | 'pricing-detail' | 'news');
      }
    };

    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);
    return () => window.removeEventListener('hashchange', syncViewFromHash);
  }, []);

  const handleViewChange = (newView: 'home' | 'admin' | 'space-detail' | 'pricing-detail' | 'news') => {
    setView(newView);
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    window.history.pushState(null, '', newView === 'home' ? baseUrl : `${baseUrl}#${newView}`);
    window.scrollTo(0, 0);
  };

  const openRegistration = (programName: string) => {
    setSelectedProgram(programName);
    setIsRegistrationOpen(true);
  };

  useEffect(() => {
    if (view === 'home' || view === 'space-detail' || view === 'pricing-detail') {
      const trackVisit = async () => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const visitRef = doc(db, 'analytics', today);
        try {
          await setDoc(visitRef, { 
            count: increment(1),
            lastUpdated: serverTimestamp() 
          }, { merge: true });
        } catch (e) {
          console.error("Visit tracking error:", e);
        }
      };
      trackVisit();
    }
  }, [view]);

  return (
    <div className="bg-brand-bg font-sans overflow-x-hidden">
      {view !== 'admin' && <Navbar onViewChange={handleViewChange} currentView={view} />}
      
      <RegistrationModal 
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
        program={selectedProgram}
      />
      <TrialApplicationModal
        isOpen={isTrialApplicationOpen}
        onClose={() => setIsTrialApplicationOpen(false)}
      />

      <AnimatePresence mode="wait">
        {view === 'admin' && (
          <motion.div 
            key="admin"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <AdminDashboard 
              onClose={() => handleViewChange('home')} 
            />
          </motion.div>
        )}
        
        {view === 'news' && (
          <NewsView onBack={() => handleViewChange('home')} />
        )}

        {view === 'space-detail' && (
          <motion.div 
            key="space-detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <SpaceDetail onTrialApply={() => setIsTrialApplicationOpen(true)} />
          </motion.div>
        )}

        {view === 'pricing-detail' && (
          <motion.div 
            key="pricing-detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <PricingDetail />
          </motion.div>
        )}

        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero onSpaceTour={() => setView('space-detail')} onTrialApply={() => setIsTrialApplicationOpen(true)} />
            <Introduction />
            <Audience />
            <Atmosphere />
            <Pricing onMoreDetail={() => setView('pricing-detail')} />
            {/* Community Section Integration */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <SectionTitle 
                  title={ODI_CONTENT.community.title}
                  subtitle="우리는 '단순한 옆자리 사람'을 넘어, 건강한 자극을 주는 동료가 됩니다."
                />
                <div className="grid md:grid-cols-2 gap-12">
                   {ODI_CONTENT.community.programs?.map((p: any, i: number) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        onClick={() => openRegistration(p.name)}
                        className="bg-brand-blue-light/50 p-10 rounded-[40px] flex flex-col items-center text-center cursor-pointer hover:bg-brand-blue-light hover:scale-[1.02] transition-all group"
                     >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                           <LayoutDashboard className="text-brand-point" />
                        </div>
                        <h4 className="text-2xl mb-4">{p.name}</h4>
                        <p className="text-gray-500 leading-relaxed font-light mb-6">{p.desc}</p>
                        <span className="text-brand-point font-bold text-sm flex items-center space-x-2">
                           <span>지금 신청하기</span>
                           <ArrowRight size={14} />
                        </span>
                     </motion.div>
                   ))}
                </div>
              </div>
            </section>
            {/* Instagram Feed Section */}
            <section className="py-24 bg-gray-50 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                  <div>
                    <p className="text-brand-point font-bold tracking-widest text-sm mb-3">INSTAGRAM</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      오디워크룸의 기록
                    </h2>
                  </div>
                  <a 
                    href={ODI_CONTENT.brand.contact.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 text-gray-500 hover:text-brand-point transition-colors font-medium"
                  >
                    <span>@od.workroom 팔로우하기</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    "DUSmSYDkUIG",
                    "DUHswg1EYVt",
                    "DWYapkOidTm"
                  ].map((shortcode, id) => (
                    <motion.div
                      key={shortcode}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: id * 0.1 }}
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex justify-center"
                    >
                      <iframe
                        src={`https://www.instagram.com/p/${shortcode}/embed`}
                        width="100%"
                        height="480"
                        frameBorder="0"
                        scrolling="no"
                        allow="encrypted-media"
                        className="max-w-full"
                      ></iframe>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <Location />

            <Footer onViewChange={handleViewChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
