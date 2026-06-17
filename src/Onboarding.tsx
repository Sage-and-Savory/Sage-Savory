import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Calendar, ShoppingCart, ArrowRight, Check } from 'lucide-react';
import { useAppStore } from './store';

export function Onboarding() {
  const { completeOnboarding, setPreferredUnits } = useAppStore();
  const [step, setStep] = useState(0);
  const [selectedUnits, setSelectedUnits] = useState<'US' | 'India'>('US');

  const steps = [
    {
      title: "Welcome to Chef's Mate",
      description: "Your personal sous-chef, meal planner, and grocery assistant all rolled into one.",
      icon: <ChefHat className="w-16 h-16 text-[#8A9A86]" />
    },
    {
      title: "Plan Your Week",
      description: "Discover new recipes and effortlessly build a personalized meal plan.",
      icon: <Calendar className="w-16 h-16 text-[#C27D5F]" />
    },
    {
      title: "Smart Groceries",
      description: "We automatically aggregate your ingredients into a categorized shopping list.",
      icon: <ShoppingCart className="w-16 h-16 text-[#8A9A86]" />
    },
    {
      title: "Let's Get Started",
      description: "How do you prefer to measure your ingredients?",
      icon: null
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setPreferredUnits(selectedUnits);
      completeOnboarding();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] dark:bg-[#1C1C1E] flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full flex flex-col items-center text-center"
        >
          {steps[step].icon && (
            <div className="bg-white dark:bg-[#2C2C2E] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-[#38383A] mb-8">
              {steps[step].icon}
            </div>
          )}
          
          <h1 className="text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] mb-4">
            {steps[step].title}
          </h1>
          <p className="text-[#8A9A86] dark:text-gray-400 text-lg mb-12 px-4">
            {steps[step].description}
          </p>

          {step === 3 && (
            <div className="flex flex-col gap-4 w-full mb-12">
              <button
                onClick={() => setSelectedUnits('US')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  selectedUnits === 'US' 
                    ? 'border-[#8A9A86] bg-[#8A9A86]/5 dark:bg-[#8A9A86]/10' 
                    : 'border-gray-200 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]'
                }`}
              >
                <div className="text-left">
                  <h3 className="font-bold text-[#333333] dark:text-[#E5E5EA]">US System</h3>
                  <p className="text-sm text-gray-500">Cups, Ounces, Pounds</p>
                </div>
                {selectedUnits === 'US' && <Check className="w-6 h-6 text-[#8A9A86]" />}
              </button>
              
              <button
                onClick={() => setSelectedUnits('India')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  selectedUnits === 'India' 
                    ? 'border-[#8A9A86] bg-[#8A9A86]/5 dark:bg-[#8A9A86]/10' 
                    : 'border-gray-200 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E]'
                }`}
              >
                <div className="text-left">
                  <h3 className="font-bold text-[#333333] dark:text-[#E5E5EA]">Metric System</h3>
                  <p className="text-sm text-gray-500">Grams, Liters, Kilos</p>
                </div>
                {selectedUnits === 'India' && <Check className="w-6 h-6 text-[#8A9A86]" />}
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 w-full px-6 max-w-md flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-[#8A9A86]' : 'w-2 bg-gray-200 dark:bg-[#38383A]'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full py-4 bg-[#8A9A86] hover:bg-[#768573] text-white rounded-2xl font-bold text-lg shadow-sm transition-all focus:outline-none flex items-center justify-center gap-2"
        >
          {step === steps.length - 1 ? 'Start Cooking' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
