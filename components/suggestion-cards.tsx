'use client';

import { motion } from 'framer-motion';
import { BookOpen, Calculator, FileText, Calendar, Users, HelpCircle } from 'lucide-react';
import { useChatStore } from '@/lib/store';

export function SuggestionCards() {
  const { sendMessage, language } = useChatStore();

  const suggestions = {
    tr: [
      {
        icon: BookOpen,
        title: "Konu Anlatımı",
        description: "Matematik, Fizik, Kimya gibi derslerde yardım",
        prompt: "Matematik dersinde logaritma konusunu anlatır mısın?"
      },
      {
        icon: Calculator,
        title: "Soru Çözümü",
        description: "Adım adım soru çözüm yardımı",
        prompt: "Bu matematik sorusunu çözmeme yardım eder misin?"
      },
      {
        icon: FileText,
        title: "Özet Çıkarma",
        description: "Ders notlarından özet hazırlama",
        prompt: "Osmanlı İmparatorluğu'nun kuruluş dönemi hakkında özet hazırlar mısın?"
      },
      {
        icon: Calendar,
        title: "Sınav Hazırlığı",
        description: "Sınav programı ve çalışma planı",
        prompt: "YKS'ye nasıl hazırlanmalıyım? Çalışma programı önerir misin?"
      },
      {
        icon: Users,
        title: "Proje Önerileri",
        description: "Okul projeleri için yaratıcı fikirler",
        prompt: "Tarih dersi için proje konusu önerir misin?"
      },
      {
        icon: HelpCircle,
        title: "Genel Sorular",
        description: "Eğitim ve okul hakkında her şey",
        prompt: "Üniversite tercih sürecinde nelere dikkat etmeliyim?"
      }
    ],
    en: [
      {
        icon: BookOpen,
        title: "Subject Explanation",
        description: "Help with Math, Physics, Chemistry and other subjects",
        prompt: "Can you explain the logarithm topic in mathematics?"
      },
      {
        icon: Calculator,
        title: "Problem Solving",
        description: "Step-by-step problem solving assistance",
        prompt: "Can you help me solve this math problem?"
      },
      {
        icon: FileText,
        title: "Summary Creation",
        description: "Creating summaries from lesson notes",
        prompt: "Can you prepare a summary about the founding period of the Ottoman Empire?"
      },
      {
        icon: Calendar,
        title: "Exam Preparation",
        description: "Exam schedule and study plan",
        prompt: "How should I prepare for university entrance exams? Can you suggest a study program?"
      },
      {
        icon: Users,
        title: "Project Suggestions",
        description: "Creative ideas for school projects",
        prompt: "Can you suggest a project topic for history class?"
      },
      {
        icon: HelpCircle,
        title: "General Questions",
        description: "Everything about education and school",
        prompt: "What should I pay attention to during the university preference process?"
      }
    ]
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {suggestions[language].map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03, boxShadow: '0px 10px 20px rgba(0,0,0,0.05)' }}
          className="bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 sm:p-5 cursor-pointer flex items-start gap-4 transition-all duration-300 shadow-sm hover:border-gray-300/80"
          onClick={() => handleSuggestionClick(suggestion.prompt)}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <suggestion.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-gray-800 mb-1">{suggestion.title}</h4>
            <p className="text-xs sm:text-sm text-gray-500">{suggestion.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
