import React from 'react';
import { motion } from 'motion/react';
import { Video, Target, Award, Sparkles } from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      title: 'دورات أونلاين تفاعلية',
      description: 'محتوى فيديو وتمارين عملية مع تنظيم وحدات يسهل متابعتها.',
      icon: <Video size={32} className="text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'مسارات تعلم حسب الهدف',
      description: 'خطط جاهزة (أو مخصصة) تقودك من المستوى الحالي إلى الهدف خلال مدة محددة.',
      icon: <Target size={32} className="text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000'
    },
    {
      title: 'اختبارات وشهادات إتمام',
      description: 'قياس مستمر للفهم مع شهادات بعد اجتياز المتطلبات لتعزيز سيرتك الذاتية.',
      icon: <Award size={32} className="text-blue-600" />,
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  return (
    <section id="services" className="py-32 bg-white font-ibm overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-4 uppercase tracking-widest"
            >
              <Sparkles size={16} /> ماذا نقدم؟
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-6xl font-bold text-gray-900 tracking-tighter"
            >
              خدمات تعليمية <span className="text-blue-600">بمعايير عالمية</span>
            </motion.h2>
          </div>
          <p className="text-gray-500 text-xl font-medium max-w-md text-right leading-relaxed">
            نحن لا نقدم مجرد دروس، بل نبني تجربة تعليمية متكاملة تضمن لك التفوق والتميز في مسارك الدراسي والمهني.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-slate-900 rounded-[3rem] overflow-hidden relative group h-[500px]"
          >
            <img 
              src={services[0].image} 
              alt={services[0].title} 
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-12 text-right">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-500/20">
                {services[0].icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">{services[0].title}</h3>
              <p className="text-slate-300 text-xl font-medium max-w-lg leading-relaxed">{services[0].description}</p>
            </div>
          </motion.div>

          {/* Side Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-between h-[500px] shadow-2xl shadow-blue-100"
          >
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
              {services[1].icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">{services[1].title}</h3>
              <p className="text-blue-50 text-lg font-medium leading-relaxed">{services[1].description}</p>
            </div>
          </motion.div>

          {/* Bottom Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col justify-between h-[400px] shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600">
              {services[2].icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{services[2].title}</h3>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">{services[2].description}</p>
            </div>
          </motion.div>

          {/* Bottom Card 2 (Image Focus) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 bg-gray-100 rounded-[3rem] overflow-hidden relative group h-[400px]"
          >
            <img 
              src={services[2].image} 
              alt="Learning" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/20 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-start p-12">
              <div className="text-right">
                <h3 className="text-3xl font-bold text-white mb-2">شهادات معتمدة</h3>
                <p className="text-gray-300 font-medium">وثق نجاحك بشهادات احترافية</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
