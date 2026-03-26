import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-32 bg-slate-50 overflow-hidden font-ibm relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              
              <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white group">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                  alt="About Us" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent mix-blend-overlay"></div>
              </div>

              {/* Stats Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-12 -right-12 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 z-20 hidden md:block"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">+150</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">دورة تدريبية</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-indigo-600">+50k</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">طالب مسجل</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-right"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6 uppercase tracking-widest">
              <Sparkles size={16} /> من نحن؟
            </div>
            <h2 className="text-6xl font-bold text-gray-900 mb-8 tracking-tighter leading-tight">
              نحن نعيد تعريف <span className="text-blue-600">مستقبل التعليم</span> الرقمي
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed font-medium mb-10">
              المنصة التعليمية ليست مجرد موقع، بل هي رؤية طموحة لتمكين كل متعلم. نحن نجمع بين التكنولوجيا المتقدمة وأفضل المناهج التعليمية لنخلق تجربة تعلم فريدة، مرنة، وممتعة. سواء كنت طالباً يسعى للتفوق أو معلماً يطمح للتميز، نحن هنا لنكون شريكك في النجاح.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { title: 'تعلم مرن', desc: 'ادرس في أي وقت ومن أي مكان.' },
                { title: 'محتوى متطور', desc: 'مناهج تواكب أحدث المعايير.' },
                { title: 'دعم مستمر', desc: 'فريق متخصص لمساعدتك دائماً.' },
                { title: 'شهادات معتمدة', desc: 'وثق مهاراتك بشهادات احترافية.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              اكتشف قصتنا
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
