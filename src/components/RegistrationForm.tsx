import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, MapPin, BookOpen, Award, FileText, Calendar, Globe, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: Role | null;
  onComplete: (role: Role) => void;
}

type Role = 'student' | 'teacher';

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ isOpen, onClose, initialRole = null, onComplete }) => {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Update role when initialRole changes or when form opens
  React.useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setStep(1);
      setIsSubmitted(false);
    }
  }, [isOpen, initialRole]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    country: '',
    location: '',
    address: '',
    religion: '',
    // Teacher specific
    subject: '',
    certificates: '',
    cv: '',
    // Student specific
    school: '',
    grade: '',
    other: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) {
      setIsSubmitted(true);
      // In a real app, you would send this to a backend
      console.log('Form Submitted:', { role, ...formData });
    }
  };

  const resetForm = () => {
    setRole(null);
    setStep(1);
    setIsSubmitted(false);
    setFormData({
      name: '', email: '', phone: '', age: '', gender: '', country: '',
      location: '', address: '', religion: '', subject: '', certificates: '',
      cv: '', school: '', grade: '', other: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 font-cairo">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">إنشاء حساب جديد</h2>
              <p className="text-sm font-bold text-gray-400">انضم إلى مجتمعنا التعليمي المتميز</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div 
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <button 
                  onClick={() => setRole('teacher')}
                  className="group p-10 rounded-[2.5rem] border-4 border-gray-100 hover:border-blue-600 transition-all text-right flex flex-col items-center md:items-end gap-6 hover:bg-blue-50/50"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Award size={40} />
                  </div>
                  <div className="text-center md:text-right">
                    <h3 className="text-3xl font-black mb-2">أنا معلم</h3>
                    <p className="text-gray-500 font-bold">انضم كمعلم وشارك معرفتك مع آلاف الطلاب</p>
                  </div>
                </button>

                <button 
                  onClick={() => setRole('student')}
                  className="group p-10 rounded-[2.5rem] border-4 border-gray-100 hover:border-indigo-600 transition-all text-right flex flex-col items-center md:items-end gap-6 hover:bg-indigo-50/50"
                >
                  <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <BookOpen size={40} />
                  </div>
                  <div className="text-center md:text-right">
                    <h3 className="text-3xl font-black mb-2">أنا طالب</h3>
                    <p className="text-gray-500 font-bold">ابدأ رحلتك التعليمية واستكشف آفاقاً جديدة</p>
                  </div>
                </button>
              </motion.div>
            ) : isSubmitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={64} />
                </div>
                <h3 className="text-4xl font-black mb-4">تم التسجيل بنجاح!</h3>
                <p className="text-xl text-gray-500 font-bold mb-10">شكراً لانضمامك إلينا. يمكنك الآن البدء في استخدام السبورة الذكية.</p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => {
                      if (role) onComplete(role);
                    }}
                    className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 transition-all hover:bg-blue-700"
                  >
                    دخول السبورة الذكية
                  </button>
                  <button 
                    onClick={onClose}
                    className="bg-gray-100 text-gray-500 px-12 py-4 rounded-2xl font-black text-xl transition-all hover:bg-gray-200"
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-12">
                  <button 
                    type="button"
                    onClick={() => setRole(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                  </div>
                  <span className="text-sm font-black text-blue-600">الخطوة {step} من 2</span>
                </div>

                {step === 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                        <User size={16} /> الاسم الكامل
                      </label>
                      <input 
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="أدخل اسمك الكامل" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                        <Mail size={16} /> البريد الإلكتروني
                      </label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="example@mail.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                        <Phone size={16} /> رقم الهاتف
                      </label>
                      <input 
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="+965 XXXXXXXX" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                        <Calendar size={16} /> العمر
                      </label>
                      <input 
                        required
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="أدخل عمرك" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                        <Globe size={16} /> البلد
                      </label>
                      <input 
                        required
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="مثال: الكويت" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                         الجنس
                      </label>
                      <select 
                        required
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold"
                      >
                        <option value="">اختر الجنس</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {role === 'teacher' ? (
                      <>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <BookOpen size={16} /> المادة الدراسية
                          </label>
                          <input 
                            required
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="مثال: اللغة العربية" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <Award size={16} /> الشهادات التعليمية
                          </label>
                          <input 
                            required
                            name="certificates"
                            value={formData.certificates}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="أهم الشهادات الحاصل عليها" 
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <FileText size={16} /> نبذة عن السيرة الذاتية
                          </label>
                          <textarea 
                            required
                            rows={3}
                            name="cv"
                            value={formData.cv}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="تحدث عن خبراتك التعليمية باختصار" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <MapPin size={16} /> الموقع / المنطقة
                          </label>
                          <input 
                            required
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="المنطقة السكنية" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                             الديانة
                          </label>
                          <input 
                            name="religion"
                            value={formData.religion}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="اختياري" 
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <BookOpen size={16} /> المدرسة
                          </label>
                          <input 
                            required
                            name="school"
                            value={formData.school}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="اسم مدرستك الحالية" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                             الصف الدراسي
                          </label>
                          <input 
                            required
                            name="grade"
                            value={formData.grade}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="مثال: الصف العاشر" 
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                            <MapPin size={16} /> العنوان بالتفصيل
                          </label>
                          <input 
                            required
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                            placeholder="المنطقة، القطعة، الشارع" 
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-2 text-gray-400 font-black text-sm uppercase mr-2">
                         بيانات إضافية
                      </label>
                      <textarea 
                        rows={2}
                        name="other"
                        value={formData.other}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold" 
                        placeholder="أي معلومات أخرى تود إضافتها" 
                      />
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
                    <ShieldCheck size={20} />
                    <span className="text-sm font-black">نحن نضمن السرية التامة لمعلوماتك الشخصية</span>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {step === 2 && (
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all"
                      >
                        السابق
                      </button>
                    )}
                    <button 
                      type={step === 1 ? 'button' : 'submit'}
                      onClick={() => step === 1 && setStep(2)}
                      className="flex-1 md:flex-none bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {step === 1 ? (
                        <>التالي <ChevronLeft size={20} /></>
                      ) : (
                        'تأكيد التسجيل'
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
