import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Download, 
  Video, 
  Gamepad2, 
  Presentation, 
  FileText, 
  BookOpen, 
  PlayCircle, 
  Trophy,
  Plus,
  FileUp,
  FileDown,
  Sparkles,
  Share2,
  X,
  CheckCircle2
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  type: 'lesson' | 'video' | 'tutorial' | 'comment' | 'presentation' | 'game' | 'exercise' | 'interactive';
  url: string;
  author: string;
  date: string;
  fileName?: string;
}

const INITIAL_RESOURCES: ResourceItem[] = [
  { id: '1', title: 'درس اللغة العربية - المدود', type: 'lesson', url: '#', author: 'أ. عمر', date: '2024-03-20' },
  { id: '2', title: 'فيديو توضيحي للام الشمسية', type: 'video', url: '#', author: 'أ. سارة', date: '2024-03-21' },
  { id: '3', title: 'لعبة الحروف المبعثرة', type: 'game', url: '#', author: 'أ. محمد', date: '2024-03-22' },
  { id: '4', title: 'عرض تقديم عن الفصول الأربعة', type: 'presentation', url: '#', author: 'أ. ليلى', date: '2024-03-23' },
  { id: '5', title: 'تمارين تفاعلية على الحركات', type: 'interactive', url: '#', author: 'أ. نورة', date: '2024-03-24' },
  { id: '6', title: 'دليل المعلم للتعامل مع المنصة', type: 'tutorial', url: '#', author: 'أ. أحمد', date: '2024-03-25' },
  { id: '7', title: 'تنزيل الفيديوهات التعليمية', type: 'video', url: '#', author: 'المنصة', date: '2024-03-26' },
];

export const ServiceCorner: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ResourceItem['type']>('lesson');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', name: 'الكل', icon: <Sparkles size={18} /> },
    { id: 'lesson', name: 'حصص ودروس', icon: <BookOpen size={18} /> },
    { id: 'video', name: 'فيديوهات', icon: <Video size={18} /> },
    { id: 'presentation', name: 'عروض تقديمية', icon: <Presentation size={18} /> },
    { id: 'game', name: 'ألعاب تمارين', icon: <Gamepad2 size={18} /> },
    { id: 'interactive', name: 'ألعاب تفاعلية', icon: <Trophy size={18} /> },
    { id: 'tutorial', name: 'تعليات وشروحات', icon: <PlayCircle size={18} /> },
  ];

  const filteredResources = activeCategory === 'all' 
    ? resources 
    : resources.filter(r => r.type === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) setUploadTitle(file.name.split('.')[0]);
    }
  };

  const confirmUpload = () => {
    if (!uploadFile || !uploadTitle) return;

    const newResource: ResourceItem = {
      id: Math.random().toString(36).substring(7),
      title: uploadTitle,
      type: uploadType,
      url: URL.createObjectURL(uploadFile),
      author: 'زائر',
      date: new Date().toISOString().split('T')[0],
      fileName: uploadFile.name
    };

    setResources([newResource, ...resources]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsUploading(false);
      setUploadFile(null);
      setUploadTitle('');
    }, 2000);
  };

  const handleDownload = (resource: ResourceItem) => {
    // In a real app, this would be a link to a blob or a server URL
    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.fileName || `${resource.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Visual feedback
    alert(`جاري تحميل: ${resource.title}`);
  };

  return (
    <section id="resources" className="py-32 bg-slate-50 relative overflow-hidden font-ibm">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch gap-12">
          
          {/* Left Visual Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:flex flex-col gap-6 w-80"
          >
            <div className="flex-1 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500 group">
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=1000" 
                alt="Education" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="h-48 bg-emerald-600 rounded-[3rem] p-8 text-white flex flex-col justify-center shadow-xl shadow-emerald-100">
              <Trophy size={32} className="mb-3 text-emerald-300" />
              <p className="text-xl font-bold leading-tight">تميز في مسارك التعليمي</p>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[4rem] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-gray-50 pb-12">
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold mb-4 uppercase tracking-widest">
                    <Sparkles size={16} /> ركن الخبرات
                  </div>
                  <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tighter">حصص وخبرات مجانية</h2>
                  <p className="text-gray-500 text-xl font-medium max-w-xl leading-relaxed">
                    منصة تشاركية متكاملة لتبادل المعرفة. ارفع دروسك وشاركها مع زملائك في أكبر مكتبة تعليمية مفتوحة.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUploading(true)}
                    className="bg-emerald-600 text-white px-8 py-5 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
                  >
                    <FileUp size={22} />
                    رفع ملف جديد
                  </motion.button>
                </div>
              </div>

              {/* Filter Section */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">تصفح حسب التصنيف</h3>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <BookOpen size={18} /> {resources.length} ملف متاح
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-8 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-3 border-2 ${
                        activeCategory === cat.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                      }`}
                    >
                      {cat.icon}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Grid */}
              <div id="resources-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {filteredResources.length > 0 ? (
                    filteredResources.map((res) => (
                      <motion.div
                        key={res.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        className="bg-gray-50/50 border border-gray-100 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500"
                      >
                        <div className="flex items-center gap-5">
                          <div className="bg-white p-4 rounded-2xl text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                            {res.type === 'video' ? <Video size={24} /> : 
                             res.type === 'game' ? <Gamepad2 size={24} /> : 
                             res.type === 'presentation' ? <Presentation size={24} /> : 
                             <FileText size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{res.title}</h4>
                            <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                              <span className="flex items-center gap-1"><Plus size={12} /> {res.author}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>{res.date}</span>
                            </div>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDownload(res)}
                          className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all duration-500"
                        >
                          <Download size={20} />
                        </motion.button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-300 font-bold">
                      <div className="bg-gray-50 p-8 rounded-full mb-4">
                        <X size={48} />
                      </div>
                      <p className="text-xl">لا توجد ملفات في هذا القسم حالياً</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Right Visual Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:flex flex-col gap-6 w-80"
          >
            <div className="h-48 bg-blue-600 rounded-[3rem] p-8 text-white flex flex-col justify-center shadow-xl shadow-blue-100">
              <Sparkles size={32} className="mb-3 text-blue-300" />
              <p className="text-xl font-bold leading-tight">محتوى تعليمي متجدد يومياً</p>
            </div>
            <div className="flex-1 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500 group">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000" 
                alt="Management" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-[3rem] p-10 text-gray-900 relative"
            >
              <button 
                onClick={() => setIsUploading(false)}
                className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-bold mb-6 text-center">رفع ملف جديد</h3>
              
              {showSuccess ? (
                <div className="py-12 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="text-emerald-600 w-12 h-12" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-emerald-600">تم الرفع بنجاح!</h4>
                  <p className="text-gray-500 mt-2">سيظهر ملفك في المكتبة الآن</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-4 border-dashed border-emerald-100 rounded-[2rem] p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer group bg-emerald-50/30"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="text-emerald-600 w-10 h-10" />
                    </div>
                    <p className="font-bold text-gray-500">
                      {uploadFile ? uploadFile.name : 'اسحب الملف هنا أو اضغط للاختيار'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">الحد الأقصى للملف: 50 ميجابايت</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 mr-2">عنوان الملف</label>
                      <input 
                        type="text" 
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="أدخل عنواناً للملف..."
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2 mr-2">نوع المحتوى</label>
                      <select 
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value as any)}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-emerald-500 outline-none font-medium appearance-none bg-white"
                      >
                        {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setIsUploading(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={confirmUpload}
                      disabled={!uploadFile || !uploadTitle}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      تأكيد الرفع
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

