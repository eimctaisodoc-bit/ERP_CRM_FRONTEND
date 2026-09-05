import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, RefreshCw } from 'lucide-react';

const fontStyle = { fontFamily: "'Roboto Slab', serif", fontWeight: 700 };

export const HR = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, staggerChildren: 0.15, ease: "easeOut" }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div 
      className="w-full h-full min-h-[75vh] bg-white flex flex-col items-center justify-center text-slate-800 antialiased px-6" 
      style={fontStyle}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center max-w-xl w-full"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div className="w-8 h-[2px] bg-slate-200" />
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/50">
            <Briefcase className="w-6 h-6 text-amber-500" />
          </div>
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-2xl md:text-3xl tracking-tight mb-3 text-slate-800"
        >
          HR Records & Analytics <span className="text-orange-500">Not Available</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants} 
          className="text-[14px] text-slate-500 leading-relaxed font-normal max-w-md mb-8"
        >
          There are currently no active employee profiles, payroll records, or HR reports to display for this workspace. 
        </motion.p>

        <motion.button 
          variants={itemVariants}
          whileTap={{ scale: 0.96, opacity: 0.8 }}
          className="flex items-center gap-2.5 px-6 py-3 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl transition-all duration-200 group cursor-pointer border-none outline-none"
        >
          <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500 text-orange-500" />
          <span className="text-[12px] uppercase tracking-widest font-bold">Check for Updates</span>
        </motion.button>
      </motion.div>
    </div>
  );
};