import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Sparkles, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-32 bg-slate-50 font-ibm overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6 uppercase tracking-widest"
          >
            <Sparkles size={16} /> تواصل معنا
          </motion.div>
          <h2 className="text-6xl font-bold text-gray-900 tracking-tighter">نحن هنا <span className="text-blue-600">لمساعدتك</span></h2>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch gap-12">
          {/* Map and Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white flex flex-col"
          >
            <div className="h-80 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3478.4746401490226!2d48.0664!3d29.3375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fcf9c0000000000%3A0x0!2zMjnCsDIwJzE1LjAiTiA0OMKwMDMnNTkuMCJF!5e0!3m2!1sen!2skw!4v1711180000000!5m2!1sen!2skw" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
            
            <div className="p-12 text-right flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="flex items-center gap-4 justify-end group">
                    <div className="text-right">
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">البريد الإلكتروني</p>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">youssiff198219821982@gmail.com</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><Mail size={24} /></div>
                  </div>
                  <div className="flex items-center gap-4 justify-end group">
                    <div className="text-right">
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">معلومات الاتصال</p>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">+965-66609234</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><Phone size={24} /></div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4 justify-end group">
                    <div className="text-right">
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">العنوان</p>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">الكويت، حولي، السالمية</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><MapPin size={24} /></div>
                  </div>
                  <div className="flex items-center gap-4 justify-end group">
                    <div className="text-right">
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">ساعات العمل</p>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">الاثنين - الجمعة: 08:00 - 19:00</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"><Clock size={24} /></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 bg-white rounded-[4rem] p-12 md:p-16 shadow-2xl border-8 border-white"
          >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-right font-bold text-gray-400 text-xs uppercase tracking-widest mr-2">الاسم الكامل</label>
                  <input type="text" className="w-full bg-slate-50 px-8 py-5 rounded-3xl border-4 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-right" placeholder="أدخل اسمك هنا" />
                </div>
                <div className="space-y-3">
                  <label className="block text-right font-bold text-gray-400 text-xs uppercase tracking-widest mr-2">رقم الهاتف</label>
                  <input type="tel" className="w-full bg-slate-50 px-8 py-5 rounded-3xl border-4 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-right" placeholder="965+ 0000 0000" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-right font-bold text-gray-400 text-xs uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-slate-50 px-8 py-5 rounded-3xl border-4 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-right" placeholder="example@mail.com" />
              </div>
              <div className="space-y-3">
                <label className="block text-right font-bold text-gray-400 text-xs uppercase tracking-widest mr-2">الرسالة</label>
                <textarea rows={4} className="w-full bg-slate-50 px-8 py-5 rounded-3xl border-4 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-right resize-none" placeholder="كيف يمكننا مساعدتك اليوم؟"></textarea>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white px-12 py-6 rounded-3xl text-xl font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group"
              >
                <Send size={24} className="group-hover:translate-x-[-4px] group-hover:translate-y-[-4px] transition-transform" />
                إرسال الرسالة
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
