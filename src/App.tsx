import React, { useState, useRef, useEffect } from 'react';
import localforage from 'localforage';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Sparkles, ShoppingBag, Settings, Plus, Minus, Lock, Camera, X, Clock, ChefHat, Heart, BookOpen, ShoppingCart, CheckCircle2, Circle, Globe, Star, ChevronDown, ChevronLeft, ArrowLeft, Check, ClipboardList, Calendar, Search, Image as ImageIcon, Trash2, Ruler, Activity, Flame, Download, Moon, Bell, Utensils, Share, Crown, CreditCard } from 'lucide-react';
import { useAppStore, Recipe, convertAmountAndUnit } from './store';
import { Onboarding } from './Onboarding';
import { useTranslation } from './i18n';
import { supabase } from './supabaseClient';

// Helper to resolve detailed steps
function resolveStepDetails(stepObj: any, recipe: any, servings: number, isMetric: boolean) {
  if (typeof stepObj === 'string') return { text: stepObj, time: null, refs: [] };
  let { text, time, refs } = stepObj;
  
  let resolvedText = text;
  if (refs && Array.isArray(refs)) {
    refs.forEach((refIndex: number) => {
      const ing = recipe.ingredients[refIndex];
      if (ing) {
        const { amountStr, unitStr } = convertAmountAndUnit(ing.amount, ing.unit, servings, recipe.baseServings, isMetric);
        const nameLowerCase = ing.name.toLowerCase();
        resolvedText = resolvedText.replace(new RegExp(`\\{${refIndex}\\}`, 'g'), `${amountStr} ${unitStr} ${nameLowerCase}`.trim().replace(/\s+/g, ' '));
      }
    });
  }
  return { text: resolvedText, time, refs };
}

import { CameraCapture } from './CameraCapture';
import { CreateRecipeOverlay } from './CreateRecipeOverlay';
import { SplashLoginScreen } from './SplashLoginScreen';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORTS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'discover' | 'grocery' | 'favorites' | 'settings' | 'history'>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [guestMode, setGuestMode] = useState<boolean | null>(null);

  useEffect(() => {
    localforage.getItem('ss_guest_mode').then((val) => {
      setGuestMode(val === 'true');
    });
  }, []);

  const { favorites, toggleFavorite, userState, mealPlan, recipes, session, showPaywall, setShowPaywall } = useAppStore();
  const { t } = useTranslation(userState.language);

  useEffect(() => {
    if (!userState.notificationsEnabled || !('Notification' in window)) return;

    const checkAndNotify = () => {
      const now = new Date();
      const todayDayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      const mealId = mealPlan[todayDayName];
      const todayDateStr = now.toDateString();

      const targetTime = userState.notificationTime || "16:00";
      const [targetHour, targetMin] = targetTime.split(':').map(Number);
      const isTimeToNotify = now.getHours() > targetHour || (now.getHours() === targetHour && now.getMinutes() >= targetMin);

      if (isTimeToNotify) {
        localforage.getItem('ss_last_notified').then((lastNotified) => {
          if (lastNotified !== todayDateStr) {
            if (Notification.permission === 'granted') {
              const recipe = recipes.find(r => r.id === mealId);
              const title = "Tonight's Dinner";
              const body = recipe 
                ? `Don't forget to check your Command Center! Tonight you're having ${recipe.title}.`
                : "Don't forget to check your Command Center to plan tonight's dinner!";
              
              new Notification(title, { body, icon: '/vite.svg' });
              localforage.setItem('ss_last_notified', todayDateStr);
            }
          }
        });
      }
    };

    // Check immediately and then every minute
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [userState.notificationsEnabled, mealPlan, recipes]);

  if (guestMode === null) return null; // loading state

  if (!session && !guestMode) {
    return <SplashLoginScreen onContinueAsGuest={() => {
      localforage.setItem('ss_guest_mode', 'true');
      setGuestMode(true);
    }} />;
  }

  if (!userState.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className={`w-full min-h-screen bg-gray-100 dark:bg-black flex justify-center font-sans tracking-tight text-[#333333] dark:text-[#E5E5EA] ${userState.theme === "dark" ? "dark" : ""}`}>
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-[#FAFAFA] dark:bg-[#0A0A0A] min-h-screen relative shadow-2xl flex flex-col transition-all duration-300 ease-in-out duration-300">
        


        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          {currentView === 'home' && <HomeView onSelectRecipe={setSelectedRecipe} onViewHistory={() => setCurrentView('history')} />}
          {currentView === 'discover' && <DiscoverView onSelectRecipe={setSelectedRecipe} />}
          {currentView === 'favorites' && <FavoritesView onSelectRecipe={setSelectedRecipe} />}
          {currentView === 'grocery' && <GroceryView />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'history' && <HistoryView onSelectRecipe={setSelectedRecipe} onBack={() => setCurrentView('home')} />}
        </div>

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
        )}

        {/* Premium Paywall Modal */}
        {showPaywall && (
          <PaywallModal onClose={() => setShowPaywall(false)} />
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-[#FAFAFA] dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-white/10 px-2 py-4 flex justify-evenly items-center z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <NavItem 
            icon={<Home className="w-6 h-6" />} 
            label={t("home")} 
            isActive={currentView === 'home'} 
            onClick={() => setCurrentView('home')} 
          />
          <NavItem 
            icon={<Sparkles className="w-6 h-6" />} 
            label={t("discover")} 
            isActive={currentView === 'discover'} 
            onClick={() => setCurrentView('discover')} 
          />
          <NavItem 
            icon={<ShoppingBag className="w-6 h-6" />} 
            label={t("planAndPrep")} 
            isActive={currentView === 'grocery'} 
            onClick={() => setCurrentView('grocery')} 
          />
          <NavItem 
            icon={<Heart className="w-6 h-6" />} 
            label={t("favorites")} 
            isActive={currentView === 'favorites'} 
            onClick={() => setCurrentView('favorites')} 
          />
          <NavItem 
            icon={<Settings className="w-6 h-6" />} 
            label={t("settings")} 
            isActive={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')} 
          />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-start gap-1 transition-all duration-300 flex-1 min-w-0 px-1 h-full ${isActive ? 'text-[#0D9488]' : 'text-gray-400 dark:text-gray-500 hover:text-[#0D9488]'}`}
    >
      <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>{icon}</div>
      <span className="text-[9px] font-semibold uppercase tracking-wide w-full text-center whitespace-normal leading-[1.1] line-clamp-2 flex items-center justify-center h-6">{label}</span>
    </button>
  );
}

// --- VIEWS ---

function HomeView({ onSelectRecipe, onViewHistory }: { onSelectRecipe: (r: Recipe) => void, onViewHistory: () => void }) {
  const { mealPlan, recipes, addMealToDay, removeMealFromDay, swapToPlanB, cookedHistory, userState, session, showPaywall, setShowPaywall } = useAppStore();
  const { t } = useTranslation(userState.language);
  const [showPickerForDay, setShowPickerForDay] = useState<string | null>(null);
  const [showDayPickerForRecipe, setShowDayPickerForRecipe] = useState<Recipe | null>(null);
  const [animatingDay, setAnimatingDay] = useState<string | null>(null);
  
  const handleAssignMeal = (day: string) => {
    if (!session) {
      alert("Please sign in or create an account to plan your meals.");
      return;
    }
    setShowPickerForDay(day);
  };

  const handleAddRecipeToDay = (recipe: Recipe) => {
    if (!session) {
      alert("Please sign in or create an account to plan your meals.");
      return;
    }
    setShowDayPickerForRecipe(recipe);
  };

  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = new Date();
  const todayDayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const realToday = DAY_NAMES.includes(todayDayName) ? todayDayName : 'Monday';
  const realTodayDateKey = getLocalDateStr(todayDate);

  const [selectedDay, setSelectedDay] = useState<string>(realTodayDateKey);

  // Dynamically compute WEEK_DAYS based on the current week
  const currentDayIndex = todayDate.getDay(); // Sunday is 0, Monday is 1...
  const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  const mondayDate = new Date(todayDate);
  mondayDate.setDate(todayDate.getDate() + mondayOffset);

  const WEEK_DAYS = DAY_NAMES.map((day, ix) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + ix);
    const dateNum = d.getDate();
    let ordinal = 'th';
    if (dateNum % 10 === 1 && dateNum !== 11) ordinal = 'st';
    else if (dateNum % 10 === 2 && dateNum !== 12) ordinal = 'nd';
    else if (dateNum % 10 === 3 && dateNum !== 13) ordinal = 'rd';

    const dateKey = getLocalDateStr(d);

    return {
      dayShort: DAY_SHORTS[ix],
      dayName: day,
      dateKey,
      date: dateNum + ordinal,
      recipes: (mealPlan[dateKey] || []).map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[],
    };
  });

  const todayRecipeId = (mealPlan[realTodayDateKey] && mealPlan[realTodayDateKey].length > 0) ? mealPlan[realTodayDateKey][0] : null;
  const tonightRecipe = recipes.find(r => r.id === todayRecipeId) || recipes[0];

  const handlePlanBSwap = (e: React.MouseEvent, dayName: string, index?: number) => {
    e.stopPropagation();
    
    if (!session) {
      alert("Please sign in or create an account to plan your meals.");
      return;
    }

    if (!userState.isPremium) {
      setShowPaywall(true);
      return;
    }

    swapToPlanB(dayName, index);
    setAnimatingDay(dayName);
    
    setTimeout(() => {
      setAnimatingDay(null);
    }, 1000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-10">
      <header className="px-6 pt-10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] tracking-tight flex items-center gap-2">
            {t("goodEvening")} 👋
            {userState.isPremium && (
              <Crown className="w-6 h-6 text-yellow-400 drop-shadow-sm inline-block" />
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">{t("letsGetCooking")}</p>
        </div>
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-none flex items-center justify-center bg-[#0D9488] text-white font-bold text-xl">
          {session?.user?.email ? session.user.email[0].toUpperCase() : 'G'}
        </div>
      </header>

      {/* Grid Calendar System */}
      <section className="px-6 mb-12">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl md:text-2xl font-extrabold text-[#333333] dark:text-[#E5E5EA]">Meal Plan</h3>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-6">
          {WEEK_DAYS.map((day, i) => {
            const isSelected = selectedDay === day.dateKey;
            const hasMeals = day.recipes.length > 0;
            return (
              <button 
                key={i}
                onClick={() => setSelectedDay(day.dateKey)}
                className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-full transition-all duration-300 ${
                  isSelected 
                    ? 'bg-[#0D9488] text-white shadow-lg scale-105 md:scale-110 z-10' 
                    : 'bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-[#38383A]'
                }`}
              >
                <span className={`text-[9px] md:text-xs font-medium uppercase ${isSelected ? 'text-white/90' : ''}`}>
                  {day.dayShort}
                </span>
                <span className={`text-base md:text-xl font-black mt-0.5 md:mt-1 leading-none ${isSelected ? 'text-white' : 'text-[#333333] dark:text-[#E5E5EA]'}`}>
                  {day.date.replace(/\D/g, '')}
                </span>
                <div className="flex gap-0.5 mt-1.5 h-1.5">
                   {hasMeals ? day.recipes.map((_, idx) => (
                      <span key={idx} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#C27D5F]'}`}></span>
                   )) : <span className="w-1.5 h-1.5"></span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Day Details */}
        <div className="mt-2 min-h-[160px] animate-in fade-in slide-in-from-right-4 duration-300">
          {(() => {
            const dayObj = WEEK_DAYS.find(d => d.dateKey === selectedDay);
            if (!dayObj) return null;
            const isAnimating = animatingDay === selectedDay;
            
            return (
              <div 
                className={`flex flex-col p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 ${
                  isAnimating ? 'bg-[#FAFAFA] dark:bg-[#0A0A0A] ring-2 ring-[#0D9488]/50 shadow-lg scale-[1.02]' : 
                  dayObj.recipes.length > 0 ? 'bg-white dark:bg-white/5 backdrop-blur-md shadow-lg shadow-black/5 border border-gray-100/50 dark:border-white/10' : 
                  'bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-dashed border-gray-300 dark:border-[#48484A]'
                }`} 
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="font-extrabold text-[#333333] dark:text-[#E5E5EA] text-lg">
                    {selectedDay}'s Menu
                  </h4>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-[#38383A] px-3 py-1 rounded-full">
                    {dayObj.recipes.length} Meals
                  </span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {dayObj.recipes.map((r, rIx) => (
                    <div 
                      key={r.id + rIx} 
                      className="flex flex-row items-center cursor-pointer group/meal bg-gray-50/80 dark:bg-[#262628]/80 rounded-full p-3 pr-4 transition-all hover:bg-[#0D9488]/5 dark:hover:bg-[#0D9488]/10 border border-transparent hover:border-[#0D9488]/20"
                      onClick={(e) => { e.stopPropagation(); onSelectRecipe(r); }}
                    >
                       <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm mr-4 flex-none relative">
                        <img 
                          src={r.image} 
                          alt={r.title} 
                          className="w-full h-full object-cover group-hover/meal:scale-105 transition-transform"
                        />
                       </div>
                      <div className="flex flex-col flex-1 min-w-0 mr-2">
                        <span className="font-extrabold text-base text-[#333333] dark:text-[#E5E5EA] mb-1 line-clamp-1">
                          {r.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0A0A0A] px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider shadow-sm dark:border-white/10">
                            <Clock className="w-3 h-3" /> {r.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-2 opacity-100 sm:opacity-0 group-hover/meal:opacity-100 transition-opacity flex-none">
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlanBSwap(e, selectedDay, rIx); }}
                          className="w-8 h-8 rounded-full bg-[#fcece5] dark:bg-[#3d271e] text-[#C27D5F] flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                          title="Swap for something faster"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeMealFromDay(selectedDay, rIx); }}
                          className="w-8 h-8 rounded-full bg-white dark:bg-[#38383A] text-gray-400 dark:text-gray-300 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 border border-gray-100 dark:border-transparent transition-all duration-300 ease-in-out shadow-sm"
                          title="Remove meal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {dayObj.recipes.length === 0 && (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-sm mb-3 border border-gray-200 dark:border-white/10">
                        <Utensils className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">No meals planned yet</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAssignMeal(selectedDay); }}
                        className="bg-[#0D9488] text-white px-6 py-3 rounded-full text-xs font-medium hover:bg-[#0F766E] transition-all duration-300 ease-in-out flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform origin-center"
                      >
                        <Plus className="w-4 h-4" /> Assign Meal
                      </button>
                    </div>
                  )}
                  
                  {dayObj.recipes.length > 0 && dayObj.recipes.length < 3 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAssignMeal(selectedDay); }}
                      className="text-[#0D9488] text-xs font-extrabold flex items-center justify-center gap-1.5 w-full mt-2 py-3 hover:bg-[#0D9488]/5 rounded-full transition-all duration-300 ease-in-out uppercase tracking-widest border border-dashed border-[#0D9488]/30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Meal ({dayObj.recipes.length}/3)
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Recipe Picker Modal */}
      {showPickerForDay && (
        <div className="fixed inset-0 z-[60] flex justify-center bg-[#333333]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] relative overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-2xl flex flex-col pt-12 px-6">
            <button 
              onClick={() => setShowPickerForDay(null)}
              className="absolute top-6 right-6 p-2 bg-gray-200 dark:bg-[#38383A] hover:bg-gray-300 transition-all duration-300 ease-in-out rounded-full"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-2xl font-bold text-[#333333] dark:text-[#E5E5EA] mb-6">Assign meal to {showPickerForDay}</h2>
            <div className="space-y-4 pb-32">
              {(recipes || []).map(recipe => (
                <div key={recipe.id} onClick={() => { addMealToDay(showPickerForDay, recipe.id); setShowPickerForDay(null); }} className="flex gap-4 p-4 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm dark:border-white/10 cursor-pointer hover:shadow-md transition-shadow">
                  <img src={recipe.image} alt={recipe.title} className="w-20 h-20 rounded-full object-cover" />
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-[#333333] dark:text-[#E5E5EA]">{recipe.title}</h3>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-medium mt-1">
                      <Clock className="w-3 h-3" /> {recipe.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Day Picker Modal for History */}
      {showDayPickerForRecipe && (
        <div className="fixed inset-0 z-[60] flex justify-center bg-[#333333]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] relative overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 shadow-2xl flex flex-col pt-12 px-6">
            <button 
              onClick={() => setShowDayPickerForRecipe(null)}
              className="absolute top-6 right-6 p-2 bg-gray-200 dark:bg-[#38383A] hover:bg-gray-300 transition-all duration-300 ease-in-out rounded-full"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-xl font-bold text-[#333333] dark:text-[#E5E5EA] mb-6">When do you want to cook {showDayPickerForRecipe.title}?</h2>
            <div className="space-y-3 pb-32">
              {WEEK_DAYS.map(day => (
                <button 
                  key={day.dateKey} 
                  onClick={() => { addMealToDay(day.dateKey, showDayPickerForRecipe.id); setShowDayPickerForRecipe(null); }} 
                  className="w-full justify-between flex font-bold px-6 py-4 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm dark:border-white/10 hover:shadow-md transition-shadow text-[#333333] dark:text-[#E5E5EA]"
                >
                  <span>{day.dayName}</span>
                  <span className="text-sm font-medium text-gray-400">{day.dateKey}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StarRating({ 
  rating, 
  onRate 
}: { 
  rating: number; 
  onRate: (rating: number) => void; 
}) {
  return (
    <div className="flex items-center gap-1 mt-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={(e) => {
            e.stopPropagation();
            onRate(star);
          }}
          className="focus:outline-none"
        >
          <Star
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function DiscoverView({ onSelectRecipe }: { onSelectRecipe: (r: Recipe) => void }) {
  const { recipes, addRecipe, userState, favorites, toggleFavorite, ratings, rateRecipe, removeRecipe, session, checkUsageLimit, incrementUsage } = useAppStore();
  const { t } = useTranslation(userState.language);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [showCamera, setShowCamera] = useState(false);
  const [generatedRecipeModal, setGeneratedRecipeModal] = useState<Recipe | null>(null);

  const REGIONS = [
    { name: 'All', icon: '🌍' },
    { name: 'Indian', icon: '🥘' },
    { name: 'Mexican', icon: '🌮' },
    { name: 'Italian', icon: '🍝' },
    { name: 'American', icon: '🍔' },
    { name: 'Mediterranean', icon: '🫒' },
  ];

  const generateRecipe = async (input: string, imageBase64?: string, imageMimeType?: string) => {
    setIsGenerating(true);
    setInputError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session?.access_token}`;
      }

      console.log("Sending Token:", session?.access_token);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/generate-recipe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          text: input, 
          imageBase64, 
          imageMimeType,
          language: userState.language
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error: ${response.statusText}`);
      }

      const generatedData = await response.json();
      
      const newRecipe: Recipe = {
         id: 'gen_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 10),
         ...generatedData
      };

      addRecipe(newRecipe);
      setInputText('');
      setGeneratedRecipeModal(newRecipe);
    } catch (e: any) {
      setInputError(e.message || "Failed to generate recipe.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAuth = () => {
    if (!session) {
      alert("Please sign in or create an account to use the Magic Generator.");
      return false;
    }
    return true;
  };

  const handleGenerateClick = () => {
    if (!checkAuth()) return;
    setInputError(null);
    if (!inputText.trim()) {
      alert("Please enter some ingredients first!");
      return;
    }
    if (!checkUsageLimit('text')) return;
    incrementUsage('text');
    generateRecipe(inputText);
  };

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSnapPhotoClick = () => {
    if (!checkAuth()) return;
    if (!checkUsageLimit('camera')) return;
    setShowCamera(true);
  };

  const handleGalleryClick = () => {
    if (!checkAuth()) return;
    if (!checkUsageLimit('gallery')) return;
    galleryInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const [meta, base64] = dataUrl.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        incrementUsage('gallery');
        generateRecipe("", base64, mimeType);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = ''; // reset so same file can be selected again
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tracker = userState.usageTracker?.date === todayStr ? userState.usageTracker : { textGenerations: 0, cameraScans: 0, galleryScans: 0 };
  const isPremium = userState.isPremium;
  const textLeft = isPremium ? Math.max(0, 4 - tracker.textGenerations) : Math.max(0, 2 - tracker.textGenerations);
  const textTotal = isPremium ? 4 : 2;
  const photoTextLeft = isPremium 
    ? `${Math.max(0, 2 - tracker.cameraScans)} camera, ${Math.max(0, 2 - tracker.galleryScans)} gallery scans`
    : `${Math.max(0, 1 - (tracker.cameraScans + tracker.galleryScans))} photo scans`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {showCamera && (
        <CameraCapture 
          onCapture={(base64, mimeType) => {
            setShowCamera(false);
            incrementUsage('camera');
            generateRecipe("", base64, mimeType);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
      <header className="px-6 pt-10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] tracking-tight">The Magic Generator</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Remaining today: <span className="text-[#0D9488] font-medium">{textLeft}/{textTotal} text limits, {photoTextLeft}</span>
          </p>
        </div>
      </header>

      {/* Generator Input Section */}
      <section className="px-6 mb-10 relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2D3047] via-[#1B1D2C] to-[#4A2E4B] p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] shadow-2xl border border-white/10 isolate">
          {/* Light Blooms */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E2A68D]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0D9488]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
          
          <h2 className="text-sm font-medium text-[#E2A68D] uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
            <Sparkles className="w-4 h-4 text-[#F3C4B3]" /> AI Magic Generator
          </h2>
          
          <div className="flex flex-col mb-5 relative z-10">
            <div className="flex bg-white/5 backdrop-blur-md rounded-full border border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#E2A68D]/50 transition-all shadow-inner">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (inputError) setInputError(null);
                }}
                placeholder={t("fridgePlaceholder")}
                className="w-full px-5 py-4 outline-none text-white placeholder-white/40 bg-transparent font-medium"
                disabled={isGenerating}
              />
            </div>
            {inputError && (
               <p className="text-[#F3C4B3] text-sm mt-2 font-medium">
                 {inputError}
               </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:flex gap-3 relative z-10">
            <button 
              onClick={handleGenerateClick}
              disabled={isGenerating || !inputText.trim()}
              className="col-span-2 lg:flex-1 bg-[#0D9488] hover:bg-[#0F766E] shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3.5 px-3 rounded-full transition-all duration-300 ease-in-out active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white">{isGenerating ? t("thinking") : t("generate")}</span>
            </button>
            <button 
              onClick={handleSnapPhotoClick}
              disabled={isGenerating}
              className="lg:flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3.5 px-3 rounded-full transition-all duration-300 ease-in-out active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span className="truncate">{t("camera")}</span>
            </button>
            <button 
              onClick={handleGalleryClick}
              disabled={isGenerating}
              className="lg:flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-3.5 px-3 rounded-full transition-all duration-300 ease-in-out active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t("gallery")}</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={galleryInputRef} 
              onChange={handleFileChange}
            />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              ref={cameraInputRef} 
              onChange={handleFileChange}
            />
          </div>

          {/* Loading Animation Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 z-20 bg-[#1B1D2C]/80 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center border border-white/10">
               <div className="relative">
                 <div className="w-16 h-16 border-4 border-[#0D9488]/30 rounded-full animate-spin"></div>
                 <div className="w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                 <Sparkles className="w-6 h-6 text-[#E2A68D] absolute inset-0 m-auto animate-pulse" />
               </div>
               <p className="mt-4 text-white font-medium tracking-widest text-sm animate-pulse uppercase">Crafting Recipe...</p>
            </div>
          )}
        </div>
      </section>

      {/* Recipe Ready Modal */}
      {generatedRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col items-center p-6 text-center">
            <div className="w-20 h-20 bg-[#0D9488]/20 text-[#0D9488] rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg border-4 border-white dark:border-[#0A0A0A]">
              <Sparkles className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-black text-[#333333] dark:text-[#E5E5EA] mb-2 relative z-10 tracking-tight">RECIPE READY!</h2>
            <p className="text-gray-500 font-medium mb-6 relative z-10">We've crafted a magical dish just for you.</p>
            
            <div className="w-full relative justify-center rounded-full overflow-hidden shadow-md mb-6 z-10 border border-gray-200 dark:border-white/10">
              <img src={generatedRecipeModal.image} alt={generatedRecipeModal.title} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                 <span className="text-white font-medium leading-tight line-clamp-1">{generatedRecipeModal.title}</span>
              </div>
            </div>
            
            <div className="w-full relative z-10 flex flex-col gap-3">
              <button 
                onClick={() => {
                  const r = generatedRecipeModal;
                  setGeneratedRecipeModal(null);
                  onSelectRecipe(r);
                }}
                className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold py-4 rounded-full shadow-lg shadow-[#0D9488]/20 transition-transform active:scale-[0.98]"
              >
                View Recipe Details
              </button>
              <button 
                onClick={() => setGeneratedRecipeModal(null)}
                className="w-full py-4 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-[#2C2C2E] rounded-full transition-all duration-300 ease-in-out"
               >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cuisines Section */}
      <section className="px-6 mb-8">
        <h3 className="text-xl font-bold text-[#333333] dark:text-[#E5E5EA] mb-4">Cuisines</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {REGIONS.map((region) => (
            <button
              key={region.name}
              onClick={() => setSelectedRegion(region.name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
                selectedRegion === region.name 
                ? 'bg-[#0D9488] border-[#0D9488] text-white shadow-md' 
                : 'bg-white dark:bg-white/5 backdrop-blur-md border-gray-200 dark:border-white/10 text-[#333333] dark:text-[#E5E5EA] hover:bg-gray-50 dark:bg-[#262628]'
              }`}
            >
              <span className="text-lg">{region.icon}</span>
              <span className="text-sm font-medium">{region.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="px-6 mb-10">
        <div className="mb-5 space-y-4">
          <h3 className="text-xl font-bold text-[#333333] dark:text-[#E5E5EA]">Recommended for you</h3>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 dark:text-gray-500">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder={t("searchRecipes")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/50 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-shadow text-sm font-medium"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {(recipes || [])
            .filter(recipe => {
              const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesRegion = selectedRegion === 'All' || recipe.region === selectedRegion;
              return matchesSearch && matchesRegion;
            })
            .map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => onSelectRecipe(recipe)}
              className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col"
            >
              <div className="relative h-36 w-full overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                {recipe.id.startsWith('custom-') && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      removeRecipe(recipe.id);
                    }}
                    className="absolute top-3 left-3 p-2 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-red-500/80 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out z-20 text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    toggleFavorite(recipe.id); 
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/40 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out z-20 text-white"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(recipe.id) ? 'fill-current text-[#C27D5F]' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1 pointer-events-none">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    recipe.difficulty === 'Easy' ? 'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-[#0D9488]' : 
                    recipe.difficulty === 'Medium' ? 'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-yellow-600' : 
                    'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-[#C27D5F]'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-[#333333] dark:text-[#E5E5EA] leading-snug text-sm mb-1 line-clamp-2">{recipe.title}</h4>
                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-medium mb-2">
                  <Clock className="w-3.5 h-3.5" /> {recipe.time}
                </div>
                <div className="mt-auto">
                  <StarRating 
                    rating={ratings[recipe.id] || 0} 
                    onRate={(rating) => rateRecipe(recipe.id, rating)} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FavoritesView({ onSelectRecipe }: { onSelectRecipe: (r: Recipe) => void }) {
  const { recipes, favorites, toggleFavorite, ratings, rateRecipe, clearFavorites, userState, removeRecipe } = useAppStore();
  const { t } = useTranslation(userState.language);
  const [showConfirm, setShowConfirm] = useState(false);

  const favoriteRecipes = (recipes || []).filter(recipe => favorites.has(recipe.id));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] tracking-tight">{t("yourFavorites")}</h1>
        {favoriteRecipes.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all duration-300 ease-in-out"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </header>

      {showConfirm && (
        <div className="px-6 mb-6 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-red-50 border border-red-100 rounded-full p-4 flex flex-col items-center text-center">
            <h3 className="font-bold text-red-700 mb-1">Clear all favorites?</h3>
            <p className="text-sm text-red-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 font-medium bg-white dark:bg-white/5 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-3xl hover:bg-gray-50 dark:bg-[#262628] transition-all duration-300 ease-in-out border border-gray-200 dark:border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  clearFavorites();
                  setShowConfirm(false);
                }}
                className="flex-1 py-2 font-bold bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 ease-in-out shadow-sm shadow-red-500/20"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="px-6 mb-10">
        {favoriteRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-24 h-24 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[#C27D5F]" />
            </div>
            <h3 className="text-xl font-bold text-[#333333] dark:text-[#E5E5EA] mb-3">No favorites yet</h3>
            <p className="text-gray-400 dark:text-gray-500 font-medium leading-relaxed max-w-xs">
              Tap the heart on any recipe to save it for later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {favoriteRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                onClick={() => onSelectRecipe(recipe)}
                className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                {recipe.id.startsWith('custom-') && (
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      removeRecipe(recipe.id);
                    }}
                    className="absolute top-3 left-3 p-2 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-red-500/80 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out z-20 text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    toggleFavorite(recipe.id); 
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/40 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out z-20 text-white"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(recipe.id) ? 'fill-current text-[#C27D5F]' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1 pointer-events-none">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      recipe.difficulty === 'Easy' ? 'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-[#0D9488]' : 
                      recipe.difficulty === 'Medium' ? 'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-yellow-600' : 
                      'bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/90 text-[#C27D5F]'
                    }`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-[#333333] dark:text-[#E5E5EA] leading-snug text-sm mb-1 line-clamp-2">{recipe.title}</h4>
                  <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 font-medium mb-2">
                    <Clock className="w-3.5 h-3.5" /> {recipe.time}
                  </div>
                  <div className="mt-auto">
                    <StarRating 
                      rating={ratings[recipe.id] || 0} 
                      onRate={(rating) => rateRecipe(recipe.id, rating)} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GroceryView() {
  const { groceryList, toggleGroceryCheck, userState, mealPlan, recipes, addCustomGrocery, removeGroceryItem, addRecipe, removeRecipe } = useAppStore();
  const { t } = useTranslation(userState.language);
  const [customItemName, setCustomItemName] = React.useState('');
  const [customItemCategory, setCustomItemCategory] = React.useState('Other');
  const [showCreateRecipe, setShowCreateRecipe] = React.useState(false);
  const [selectedCustomRecipe, setSelectedCustomRecipe] = React.useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = React.useState<'groceries' | 'recipes'>('groceries');
  const isMetric = userState.preferredUnits === 'India';

  const customRecipes = recipes.filter(r => r.id.startsWith('custom-'));

  const SORT_ORDER = ['Produce', 'Meat', 'Dairy', 'Frozen', 'Pantry', 'Other'];
  const categories = Array.from(new Set(groceryList.map(item => item.category)))
    .filter((c): c is string => typeof c === 'string')
    .sort((a, b) => {
      const aIndex = SORT_ORDER.indexOf(a);
      const bIndex = SORT_ORDER.indexOf(b);
      const aScore = aIndex === -1 ? 999 : aIndex;
      const bScore = bIndex === -1 ? 999 : bIndex;
      if (aScore !== bScore) return aScore - bScore;
      return a.localeCompare(b);
    });

  const exportGroceryList = () => {
    let text = 'GROCERY LIST\n====================\n\n';
    
    if (groceryList.length === 0) {
      text += 'Your grocery list is empty.\n';
    } else {
      categories.forEach(category => {
        text += `${category.toUpperCase()}\n--------------------\n`;
        const items = groceryList.filter(item => item.category === category);
        items.forEach(item => {
          const { amountStr, unitStr } = convertAmountAndUnit(item.amount, item.unit, 1, 1, isMetric);
          const checked = item.checked ? '[x]' : '[ ]';
          text += `${checked} ${amountStr} ${unitStr} ${item.name}`.trim().replace(/\s+/g, ' ') + '\n';
        });
        text += '\n';
      });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const tracker = userState.usageTracker?.date === todayStr ? userState.usageTracker : { textGenerations: 0, cameraScans: 0, galleryScans: 0 };
  const isPremium = userState.isPremium;
  const textLeft = isPremium ? Math.max(0, 4 - tracker.textGenerations) : Math.max(0, 2 - tracker.textGenerations);
  const textTotal = isPremium ? 4 : 2;
  const photoTextLeft = isPremium 
    ? `${Math.max(0, 2 - tracker.cameraScans)} camera, ${Math.max(0, 2 - tracker.galleryScans)} gallery scans`
    : `${Math.max(0, 1 - (tracker.cameraScans + tracker.galleryScans))} photo scans`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
       <header className="px-6 pt-10 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] tracking-tight">{t("planAndPrep")}</h1>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Remaining today: <span className="text-[#0D9488] font-medium">{textLeft}/{textTotal} text limits, {photoTextLeft}</span>
            </p>
          </div>
          {activeTab === 'groceries' && groceryList.length > 0 && (
            <button 
              onClick={exportGroceryList}
              className="p-2 bg-[#0D9488]/10 text-[#0D9488] hover:bg-[#0D9488]/20 rounded-full transition-all duration-300 ease-in-out mt-1"
              title="Export Grocery List"
            >
              <Download className="w-6 h-6 p-0.5" />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-[#0A0A0A] p-1 rounded-full mb-2">
          <button
            onClick={() => setActiveTab('groceries')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
              activeTab === 'groceries' 
                ? 'bg-white dark:bg-white/5 backdrop-blur-md text-[#333333] dark:text-[#E5E5EA] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Shopping List
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${
              activeTab === 'recipes' 
                ? 'bg-white dark:bg-white/5 backdrop-blur-md text-[#333333] dark:text-[#E5E5EA] shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            My Recipes
          </button>
        </div>
       </header>

       {activeTab === 'groceries' ? (
         <>
           {/* Add Custom Item */}
           <section className="px-6 mb-8">
             <form 
               onSubmit={(e) => {
                 e.preventDefault();
                 if (customItemName.trim()) {
                   addCustomGrocery(customItemName.trim(), customItemCategory);
                   setCustomItemName('');
                 }
               }} 
               className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-white/5 backdrop-blur-md p-4 rounded-3xl shadow-sm dark:border-white/10"
             >
               <input 
                 type="text" 
                 placeholder="Add custom item... (e.g. Paper towels)" 
                 value={customItemName}
                 onChange={(e) => setCustomItemName(e.target.value)}
                 className="flex-1 min-w-0 w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-full px-4 py-3 text-sm font-medium text-[#333333] dark:text-[#E5E5EA] outline-none focus:border-[#0D9488] transition-all duration-300 ease-in-out"
               />
               <select 
                 value={customItemCategory}
                 onChange={(e) => setCustomItemCategory(e.target.value)}
                 className="bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 outline-none focus:border-[#0D9488] transition-all duration-300 ease-in-out appearance-none w-full sm:w-auto sm:min-w-[120px] flex-shrink-0"
               >
                 {SORT_ORDER.map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
               <button 
                 type="submit"
                 disabled={!customItemName.trim()}
                 className="bg-[#0D9488] text-white rounded-full px-6 py-3 font-bold text-sm hover:bg-[#0F766E] transition-all duration-300 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
               >
                 <Plus className="w-4 h-4" /> Add Item
               </button>
             </form>
           </section>

           {/* Checklist */}
           <section className="px-6 mb-12 space-y-8">
             {categories.map(category => (
               <div key={category}>
                 <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-200 dark:border-white/10 pb-2">{category}</h4>
                 <div className="space-y-3">
                   {groceryList.filter(item => item.category === category).map(item => {
                     const { amountStr, unitStr } = convertAmountAndUnit(item.amount, item.unit, 1, 1, isMetric);
                     return (
                     <label key={item.id} className={`flex items-center gap-4 p-3 rounded-full transition-all duration-300 ease-in-out cursor-pointer group ${item.checked ? 'bg-[#FAFAFA] dark:bg-[#0A0A0A] opacity-60' : 'bg-white dark:bg-white/5 backdrop-blur-md shadow-sm dark:border-white/10 hover:border-[#0D9488]/30'}`}>
                        <button 
                          onClick={(e) => { e.preventDefault(); toggleGroceryCheck(item.id); }}
                          className="focus:outline-none"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-6 h-6 text-[#0D9488]" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300" />
                          )}
                        </button>
                        <span className={`text-base font-medium flex-1 ${item.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-[#333333] dark:text-[#E5E5EA]'}`}>
                          {amountStr} {unitStr} {item.name}
                        </span>
                        {item.isCustom && (
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeGroceryItem(item.id); }}
                            className="text-gray-300 hover:text-red-500 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                            title="Remove custom item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                     </label>
                     );
                   })}
                 </div>
               </div>
             ))}
             {groceryList.length === 0 && (
               <div className="text-center text-gray-400 dark:text-gray-500 font-medium py-10">
                 Your meal plan is empty.<br/>Add recipes to generate groceries!
               </div>
             )}
            </section>
         </>
       ) : (
         <section className="px-6 mb-12 space-y-8">
           {/* Create Your Own Recipe Banner */}
           <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)]  border border-gray-200 dark:border-white/10 text-center space-y-3 mb-8">
             <h3 className="text-lg font-bold text-[#333333] dark:text-[#E5E5EA]">Have your own secret recipe?</h3>
             <button 
               onClick={() => setShowCreateRecipe(true)}
               className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold py-3.5 px-4 rounded-full shadow-md transition-transform active:scale-[0.98] text-sm flex items-center justify-center gap-2">
               <Plus className="w-5 h-5 block" /> Create Recipe
             </button>
           </div>

           {/* My Created Recipes */}
           {customRecipes.length > 0 && (
             <div className="mb-8">
               <h4 className="text-sm font-medium text-[#0D9488] uppercase tracking-widest mb-4">My Created Recipes</h4>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 {customRecipes.map(recipe => (
                   <div
                     key={recipe.id}
                     onClick={() => setSelectedCustomRecipe(recipe)}
                     className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-white/10 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col relative"
                   >
                     <div className="relative h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                       <img 
                         src={recipe.image} 
                         alt={recipe.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                       <div className="absolute top-2 right-2 flex gap-2 z-20">
                         <button 
                           onClick={(e) => { 
                             e.preventDefault();
                             e.stopPropagation(); 
                             const link = `${window.location.origin}/recipe/${recipe.id}`;
                             if (navigator.share) {
                               navigator.share({ title: recipe.title, url: link }).catch(() => {});
                             } else {
                               navigator.clipboard.writeText(link);
                             }
                           }}
                           className="p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-blue-500/80 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out text-white shadow-sm"
                           title="Share Recipe"
                         >
                           <Share className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={(e) => { 
                             e.preventDefault();
                             e.stopPropagation(); 
                             removeRecipe(recipe.id);
                           }}
                           className="p-1.5 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 hover:bg-red-500/80 backdrop-blur-md rounded-full transition-all duration-300 ease-in-out text-white shadow-sm"
                           title="Delete Recipe"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </div>
                     <div className="p-3">
                       <h3 className="text-sm font-medium text-[#333333] dark:text-[#E5E5EA] leading-tight line-clamp-1">{recipe.title}</h3>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
         </section>
       )}

        {showCreateRecipe && (
          <CreateRecipeOverlay
            onClose={() => setShowCreateRecipe(false)}
            onSave={(recipe) => {
              addRecipe(recipe);
            }}
          />
        )}
        
        {selectedCustomRecipe && (
          <RecipeModal
            recipe={selectedCustomRecipe}
            onClose={() => setSelectedCustomRecipe(null)}
          />
        )}
    </div>
  )
}

function SettingsDropdown({
  value,
  options,
  onChange,
  className = ""
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-w-[160px] flex items-center justify-between gap-3 bg-[#FAFAFA] dark:bg-[#0A0A0A] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-[#333333] dark:text-[#E5E5EA] text-sm font-medium rounded-full pl-4 pr-3 py-2.5 outline-none transition-colors"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute left-0 w-full top-full mt-1 bg-white dark:bg-[#1a1a1c] border border-gray-100 dark:border-white/10 rounded-2xl shadow-lg z-50 overflow-hidden py-1 max-h-60 overflow-y-auto"
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {options.map((opt) => (
              <button 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${value === opt.value ? 'text-[#0D9488] font-bold bg-[#FAFAFA] dark:bg-white/5' : 'text-[#333333] dark:text-[#E5E5EA]'}`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsView() {
  const { userState, setLanguage, setPremium, setPreferredUnits, setTheme, setNotificationsEnabled, setNotificationTime, session, signOut } = useAppStore();
  const { t } = useTranslation(userState.language);

  const tLabel = (key: string) => {
    const defaultLabels: Record<string, string> = {
      measurements: "Measurements",
      preferredRecipeUnits: "Preferred Recipe Units",
      usSystem: "US System",
      metricIndia: "Metric (India)",
      darkMode: "Dark Mode",
      toggleDarkAppearance: "Toggle Dark Appearance",
      preferences: "Preferences",
      appInterfaceLanguage: "App Interface Language",
      dailyReminders: "Daily Reminders",
      alertTonight: "Alert for tonight's dinner",
      language: "Language",
      controlRoom: "Control Room",
      gallery: "Gallery",
      upgradeToPremium: "Upgrade to Premium",
      premiumSubtitle: "Unlock cooking superpowers",
      premiumActive: "Premium Active",
      enjoyingPremium: "You are enjoying Premium benefits",
      checkoutButtonUsd: "Unlock Premium ($4.99/mo)",
      checkoutButtonInr: "Unlock Premium (₹399/mo)"
    };
    const translated = t(key);
    return translated === key ? (defaultLabels[key] || key) : translated;
  };

  const handleSignOut = async () => {
    if (session) {
      await signOut();
      await localforage.removeItem('ss_guest_mode');
      window.location.reload();
    }
  };

  const handleGuestLoginClick = async () => {
    await localforage.removeItem('ss_guest_mode');
    window.location.reload();
  };

  const handleToggleNotifications = async () => {
    if (!userState.notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        } else {
          alert('Notification permission was denied.');
        }
      } else {
        alert('Notifications are not supported in this environment.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-extrabold text-[#333333] dark:text-[#E5E5EA] tracking-tight">{tLabel("controlRoom")}</h1>
      </header>

      <div className="px-6 space-y-8 mb-12">
        {/* Premium Section */}
        <section>
          <h3 className="text-sm font-medium text-[#0D9488] uppercase tracking-widest mb-4">Sage & Savory Premium</h3>
          <div className="bg-gradient-to-br from-[#0D9488] to-[#6b7a67] p-6 rounded-3xl shadow-sm text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-yellow-300 drop-shadow-md" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{userState.isPremium ? tLabel("premiumActive") : tLabel("upgradeToPremium")}</h4>
                <p className="text-white/80 text-xs">{tLabel("premiumSubtitle")}</p>
              </div>
            </div>
            
            <ul className="space-y-2 text-sm text-white/90 mb-6 font-medium">
               <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-white" /> 4 Daily Text Generations</li>
               <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-white" /> 2 Camera Scans</li>
               <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-white" /> 2 Gallery Scans</li>
               <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-white" /> Interactive Cook Mode</li>
               <li className="flex gap-2 items-center"><CheckCircle2 className="w-4 h-4 text-white" /> Instant Plan B Swapping</li>
            </ul>

            {!userState.isPremium ? (
              <button 
                disabled
                className="w-full bg-white/50 text-[#0D9488] font-bold py-3 rounded-full flex justify-center items-center gap-2 cursor-not-allowed opacity-80"
               >
                 <Crown className="w-5 h-5" />
                 Premium Tier (Coming Soon)
               </button>
            ) : (
               <div className="bg-white/20 rounded-full p-3 text-center text-sm font-medium flex justify-center items-center gap-2 border border-white/30">
                 <Sparkles className="w-4 h-4 text-yellow-300" />
                 {tLabel("enjoyingPremium")}
               </div>
            )}
          </div>
        </section>

        {/* Cloud Sync */}
        <section>
          <h3 className="text-sm font-medium text-[#0D9488] uppercase tracking-widest mb-4">Cloud Sync & Account</h3>
          <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-3xl shadow-sm dark:border-white/10">
             {session ? (
               <div className="flex flex-col gap-3">
                 <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                   Logged in as {session.user?.email}
                   {userState.isPremium && <Crown className="w-5 h-5 text-yellow-400 drop-shadow-sm" />}
                 </p>
                 <button onClick={handleSignOut} className="bg-gray-100 dark:bg-[#38383A] text-gray-700 dark:text-gray-300 font-bold py-3 rounded-full transition-all duration-300 ease-in-out hover:bg-gray-200">
                   Sign Out
                 </button>
               </div>
             ) : (
               <div className="flex flex-col gap-3 items-center text-center">
                 <p className="text-sm text-gray-500 mb-2">You are currently using Saga & Savory as a guest. All data is saved locally.</p>
                 <button onClick={handleGuestLoginClick} className="w-full bg-[#0D9488] text-white font-bold py-3 rounded-full hover:bg-[#0F766E] transition-all duration-300 ease-in-out shadow-md">
                   Sign In / Create Account
                 </button>
               </div>
             )}
          </div>
        </section>

        {/* Language & Units Section */}
        <section>
          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{tLabel("preferences")}</h3>
          <div className="bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-3xl shadow-sm dark:border-white/10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center text-[#0D9488]">
                   <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#333333] dark:text-[#E5E5EA]">{tLabel("language")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tLabel("appInterfaceLanguage")}</div>
                </div>
              </div>
              <div className="relative w-full sm:w-auto">
                <SettingsDropdown 
                  value={userState.language}
                  onChange={(val) => setLanguage(val)}
                  options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español (Spanish)" },
                    { value: "fr", label: "Français (French)" },
                    { value: "de", label: "Deutsch (German)" },
                    { value: "it", label: "Italiano (Italian)" },
                    { value: "pt", label: "Português (Portuguese)" },
                    { value: "zh", label: "中文 (Chinese)" },
                    { value: "ja", label: "日本語 (Japanese)" },
                    { value: "ko", label: "한국어 (Korean)" },
                    { value: "ru", label: "Русский (Russian)" },
                    { value: "hi", label: "Hindi (हिन्दी)" },
                    { value: "bn", label: "Bengali (বাংলা)" },
                    { value: "ta", label: "Tamil (தமிழ்)" },
                    { value: "ml", label: "Malayalam (മലയാളം)" }
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center text-[#0D9488]">
                   <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#333333] dark:text-[#E5E5EA]">{tLabel("measurements")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tLabel("preferredRecipeUnits")}</div>
                </div>
              </div>
              <div className="relative w-full sm:w-auto">
                <SettingsDropdown 
                  value={userState.preferredUnits || 'US'}
                  onChange={(val) => setPreferredUnits(val as 'US' | 'India')}
                  options={[
                    { value: "US", label: tLabel("usSystem") },
                    { value: "India", label: tLabel("metricIndia") }
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center text-[#0D9488]">
                   <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#333333] dark:text-[#E5E5EA]">{tLabel("darkMode")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tLabel("toggleDarkAppearance")}</div>
                </div>
              </div>
              <button
                onClick={() => setTheme(userState.theme === 'dark' ? 'light' : 'dark')}
                className={`flex items-center w-12 h-6 rounded-full p-1 transition-all duration-300 ease-in-out ${userState.theme === 'dark' ? 'bg-[#0D9488]' : 'bg-gray-300 dark:bg-[#38383A]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userState.theme === 'dark' ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center text-[#0D9488]">
                   <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#333333] dark:text-[#E5E5EA]">{tLabel("dailyReminders")}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tLabel("alertTonight")}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {userState.notificationsEnabled && (
                  <input
                    type="time"
                    value={userState.notificationTime || "16:00"}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#333333] dark:text-[#E5E5EA] text-sm font-medium rounded-lg px-3 py-1.5 outline-none focus:border-[#0D9488] transition-all duration-300 ease-in-out"
                  />
                )}
                <button
                  onClick={handleToggleNotifications}
                  className={`flex items-center w-12 h-6 rounded-full p-1 transition-all duration-300 ease-in-out ${userState.notificationsEnabled ? 'bg-[#0D9488]' : 'bg-gray-300 dark:bg-[#38383A]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${userState.notificationsEnabled ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  )
}

function getIngredientIcon(category?: string, name?: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('chicken') || n.includes('turkey')) return '🍗';
  if (n.includes('beef') || n.includes('steak') || n.includes('meat')) return '🥩';
  if (n.includes('fish') || n.includes('salmon')) return '🐟';
  if (n.includes('egg')) return '🥚';
  if (n.includes('cheese') || n.includes('paneer')) return '🧀';
  if (n.includes('milk') || n.includes('cream')) return '🥛';
  if (n.includes('butter')) return '🧈';
  if (n.includes('bread') || n.includes('muffin') || n.includes('tortilla') || n.includes('bun')) return '🍞';
  if (n.includes('potato')) return '🥔';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('onion') || n.includes('garlic')) return '🧄';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('spinach') || n.includes('lettuce') || n.includes('kale')) return '🥬';
  if (n.includes('broccoli')) return '🥦';
  if (n.includes('oil')) return '🫒';
  if (n.includes('salt') || n.includes('pepper') || n.includes('sugar') || n.includes('spice')) return '🧂';
  if (n.includes('bean') || n.includes('lentil')) return '🫘';
  if (n.includes('lemon') || n.includes('lime')) return '🍋';
  if (n.includes('avocado')) return '🥑';
  if (n.includes('rice') || n.includes('pasta') || n.includes('macaroni') || n.includes('noodle')) return '🥣';
  
  if (category === 'Meat') return '🥩';
  if (category === 'Dairy') return '🧀';
  if (category === 'Produce') return '🥬';
  if (category === 'Pantry') return '🥫';
  return '🛒';
}


function IngredientsList({ recipe, servings, onDecrease, onIncrease }: { recipe: any; servings: number; onDecrease: () => void; onIncrease: () => void }) {
  const { userState, setPreferredUnits } = useAppStore();
  const isMetric = userState.preferredUnits === 'India';

  const handleSetMetric = (metric: boolean) => {
    setPreferredUnits(metric ? 'India' : 'US');
  };

  return (
    <>
      <section className="flex items-center justify-between bg-white dark:bg-white/5 backdrop-blur-md p-5 rounded-3xl shadow-sm dark:border-white/10">
        <span className="font-medium text-[#333333] dark:text-[#E5E5EA] text-lg">Serves {servings}</span>
        <div className="flex items-center gap-5">
          <button 
            onClick={onDecrease} 
            className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0D9488] flex items-center justify-center hover:bg-[#0D9488] hover:text-white hover:border-[#0D9488] transition-all duration-300 ease-in-out focus:outline-none shadow-sm active:scale-95"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-[#333333] dark:text-[#E5E5EA] text-xl w-6 text-center">{servings}</span>
          <button 
            onClick={onIncrease} 
            className="w-10 h-10 rounded-full bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0D9488] flex items-center justify-center hover:bg-[#0D9488] hover:text-white hover:border-[#0D9488] transition-all duration-300 ease-in-out focus:outline-none shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#333333] dark:text-[#E5E5EA]">
            <BookOpen className="w-5 h-5 text-[#0D9488]" /> Ingredients
          </h2>
          <div className="flex bg-gray-100 dark:bg-[#38383A] p-1 rounded-full">
            <button 
              onClick={() => handleSetMetric(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-in-out ${!isMetric ? 'bg-white dark:bg-white/5 backdrop-blur-md text-[#333333] dark:text-[#E5E5EA] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#333333] dark:text-[#E5E5EA]'}`}
            >
              US
            </button>
            <button 
              onClick={() => handleSetMetric(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ease-in-out ${isMetric ? 'bg-white dark:bg-white/5 backdrop-blur-md text-[#333333] dark:text-[#E5E5EA] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-[#333333] dark:text-[#E5E5EA]'}`}
            >
              India
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm dark:border-white/10 overflow-hidden">
          {(recipe.ingredients || []).map((ing: any, i: number) => {
            const { amountStr, unitStr } = convertAmountAndUnit(ing.amount, ing.unit, servings, recipe.baseServings, isMetric);
            const isLast = i === (recipe.ingredients || []).length - 1;
            const icon = getIngredientIcon(ing.category, ing.name);
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className={`flex items-start p-4 ${!isLast ? 'border-b border-gray-100 dark:border-white/10' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#fdf8ed] flex items-center justify-center flex-shrink-0 mr-4 shadow-sm mt-0.5">
                  <span className="text-lg leading-none">{icon}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-row items-center justify-between">
                    <span className="font-medium text-[#0D9488] text-[15px]">
                      {amountStr} {unitStr}
                    </span>
                    <span className="font-extrabold text-[#333333] dark:text-[#E5E5EA] text-right ml-4 text-[15px]">
                      {ing.name}
                    </span>
                  </div>
                  {ing.notes && (
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-right mt-1.5">
                      {ing.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function CookModeOverlay({ recipe, steps, servings, onClose }: { recipe: any; steps: any[]; servings: number; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { addCookedRecipe, userState } = useAppStore();
  const isMetric = userState.preferredUnits === 'India';

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      addCookedRecipe(recipe.id);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const progressPercent = ((currentStep + 1) / steps.length) * 100;
  
  const stepObj = steps[currentStep] || "";
  const { text: stepText, time } = resolveStepDetails(stepObj, recipe, servings, isMetric);
  const pickyHack = recipe.pickyHack || recipe.kid_plating_hack;
  const showPickyHack = pickyHack && (currentStep === steps.length - 1 || stepText.toLowerCase().includes('serve') || stepText.toLowerCase().includes('plate'));

  return (
    <div className="fixed inset-0 z-[70] bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <header className="px-6 py-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md shadow-sm shrink-0 flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 dark:bg-[#38383A] text-gray-500 dark:text-gray-400 hover:text-[#333333] dark:text-[#E5E5EA] hover:bg-gray-200 transition-all duration-300 ease-in-out flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-[#333333] dark:text-[#E5E5EA] font-bold text-lg leading-tight truncate max-w-[200px]">
              {recipe.title}
            </h2>
          </div>
          <div className="w-9"></div> {/* Spacer */}
        </div>

        {/* Progress Tracking */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-[#38383A] rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="bg-[#0D9488] h-full rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center items-center">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-xl w-full"
        >
          {/* Step Number Badge */}
          <div className="flex flex-col items-center justify-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 flex items-center justify-center font-black text-2xl">
              {currentStep + 1}
            </div>
            {time && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#C27D5F] bg-[#C27D5F]/10 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                {time} min
              </div>
            )}
          </div>

          <p className="text-3xl md:text-4xl lg:text-5xl text-center font-extrabold text-[#333333] dark:text-[#E5E5EA] leading-tight md:leading-tight lg:leading-tight">
            {stepText}
          </p>

          {/* Picky Eater Plating Hack */}
          <AnimatePresence>
            {showPickyHack && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mt-12 bg-gradient-to-br from-[#FFF8F3] to-[#FFEBE0] border-[1.5px] border-[#FFD0B3] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-6 relative overflow-hidden shadow-sm"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FFD0B3]/40 to-transparent rounded-full blur-2xl"></div>
                <h3 className="text-lg font-extrabold text-[#C27D5F] flex items-center gap-2 mb-2 relative z-10">
                  <Star className="w-5 h-5 fill-[#C27D5F] text-[#C27D5F]" /> Parent Tip
                </h3>
                <p className="text-[#8c5a42] font-semibold text-lg leading-relaxed relative z-10">
                  {pickyHack}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer Controls */}
      <footer className="p-6 bg-white dark:bg-white/5 backdrop-blur-md border-t border-gray-100 dark:border-white/10 shrink-0 shadow-[0_-4px_20px_rgb(0,0,0,0.03)] grid grid-cols-2 gap-4 relative z-10">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="w-full py-4 rounded-full font-bold text-lg border-2 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-[#333333] dark:text-[#E5E5EA] hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
        >
          Previous
        </button>
        <button 
          onClick={handleNext}
          className="w-full py-4 rounded-full font-bold text-lg border-2 border-[#0D9488] bg-[#0D9488] text-white hover:bg-[#0F766E] hover:border-[#0F766E] shadow-lg shadow-[#0D9488]/30 transition-all duration-300 ease-in-out"
        >
          {currentStep === steps.length - 1 ? 'Done' : 'Next'}
        </button>
      </footer>
    </div>
  );
}

function RecipeModal({ recipe, onClose }: { recipe: any, onClose: () => void }) {
  const [isCooking, setIsCooking] = useState(false);
  const [servings, setServings] = useState(recipe.baseServings || 4);
  const [nutrition, setNutrition] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(true);
  const { favorites, toggleFavorite, userState, removeRecipe } = useAppStore();

  useEffect(() => {
    setLoadingNutrition(true);
    const timer = setTimeout(() => {
      // Generate deterministic mock data based on recipe title length, so it stays consistent per recipe
      const length = recipe.title.length;
      setNutrition({
        calories: 300 + (length * 15),
        protein: 10 + (length % 20),
        carbs: 20 + (length % 30),
        fat: 5 + (length % 15)
      });
      setLoadingNutrition(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [recipe.title]);

  const steps = recipe.detailedSteps || recipe.steps || recipe.instructions || [];
  const isMetric = userState.preferredUnits === 'India';

  if (isCooking) {
    return <CookModeOverlay recipe={recipe} steps={steps} servings={servings} onClose={() => setIsCooking(false)} />;
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-[#333333]/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Constrain modal size on desktop */}
      <div className="w-full max-w-md h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] relative overflow-hidden animate-in slide-in-from-bottom-8 duration-300 shadow-2xl flex flex-col">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto relative w-full flex flex-col">
        {/* Hero Image */}
        <div className="relative h-[40vh] min-h-[300px] w-full shrink-0">
          {/* Back button */}
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 z-50 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all duration-300 ease-in-out flex items-center gap-2 pr-4 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">Back</span>
          </button>

          <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
            {/* Share button (for custom recipes) */}
            {recipe.id.startsWith("custom-") && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const link = `${window.location.origin}/recipe/${recipe.id}`;
                  if (navigator.share) {
                    navigator.share({ title: recipe.title, url: link }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(link);
                  }
                }}
                className="p-2.5 bg-black/20 hover:bg-blue-500/80 backdrop-blur-md rounded-full text-white transition-all duration-300 ease-in-out shadow-sm"
                title="Share Recipe"
              >
                <Share className="w-5 h-5" />
              </button>
            )}

            {/* Favorite button */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
              className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all duration-300 ease-in-out shadow-sm"
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ease-in-out ${favorites.has(recipe.id) ? 'fill-current text-[#C27D5F]' : 'text-white'}`} />
            </button>

            {/* Delete button (for custom recipes) */}
            {recipe.id.startsWith("custom-") && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  removeRecipe(recipe.id); 
                  onClose(); 
                }}
                className="p-2.5 bg-black/20 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-all duration-300 ease-in-out shadow-sm"
                title="Delete Custom Recipe"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 w-full px-6 pt-16 pb-12 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <span className="inline-block text-[11px] font-medium px-3 py-1.5 rounded-full mb-3 bg-white/20 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10/20 backdrop-blur-md text-white shadow-sm tracking-wider uppercase border border-white/10">
              {recipe.difficulty} • {recipe.time}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-white drop-shadow-lg">{recipe.title}</h1>
          </div>
        </div>

        <div className="p-6 space-y-10 pb-32 bg-[#FAFAFA] dark:bg-[#0A0A0A] -mt-6 rounded-t-3xl relative z-30">
          
          <IngredientsList 
            recipe={recipe} 
            servings={servings}
            onDecrease={() => servings > 1 && setServings(servings - 1)}
            onIncrease={() => setServings(servings + 1)}
          />

          {/* Nutrition Info */}
          {!recipe.id.startsWith('custom-') && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-[#0D9488]" />
                <h2 className="text-xl font-bold text-[#333333] dark:text-[#E5E5EA]">Nutrition (Est.)</h2>
              </div>
              {loadingNutrition ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488]"></div>
                </div>
              ) : nutrition ? (
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-white/5 backdrop-blur-md border text-center border-gray-100 dark:border-white/10 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Cals</div>
                    <div className="text-lg font-extrabold text-[#333333] dark:text-[#E5E5EA] flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      {nutrition.calories}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-white/5 backdrop-blur-md border text-center border-gray-100 dark:border-white/10 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Protein</div>
                    <div className="text-lg font-extrabold text-[#333333] dark:text-[#E5E5EA]">{nutrition.protein}g</div>
                  </div>
                  <div className="bg-white dark:bg-white/5 backdrop-blur-md border text-center border-gray-100 dark:border-white/10 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Carbs</div>
                    <div className="text-lg font-extrabold text-[#333333] dark:text-[#E5E5EA]">{nutrition.carbs}g</div>
                  </div>
                  <div className="bg-white dark:bg-white/5 backdrop-blur-md border text-center border-gray-100 dark:border-white/10 rounded-3xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Fat</div>
                    <div className="text-lg font-extrabold text-[#333333] dark:text-[#E5E5EA]">{nutrition.fat}g</div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* Instructions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#333333] dark:text-[#E5E5EA]">
                <ChefHat className="w-5 h-5 text-[#0D9488]" /> Instructions
              </h2>
            </div>
            
            <div className="space-y-4">
              {steps.map((stepObj: any, i: number) => {
                const { text, time } = resolveStepDetails(stepObj, recipe, servings, isMetric);
                return (
                  <div 
                    key={i} 
                    className="flex gap-4 p-4 rounded-full border border-transparent"
                  >
                    <div className="flex-none pt-0.5">
                      <div className="w-9 h-9 rounded-full bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      {time && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#C27D5F] mb-1.5 uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          {time} {time === 1 ? 'min' : 'mins'}
                        </div>
                      )}
                      <p className="text-[#333333] dark:text-[#E5E5EA] font-medium leading-relaxed">
                        {text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Picky Eater Plating Hack */}
          {(recipe.pickyHack || recipe.kid_plating_hack) && (
            <section className="mt-8 mb-4">
              <div className="bg-gradient-to-br from-[#FFF8F3] to-[#FFEBE0] border-[1.5px] border-[#FFD0B3] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-7 relative overflow-hidden shadow-[0_8px_30px_rgb(194,125,95,0.12)]">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#FFD0B3]/40 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute -bottom-6 -right-2 text-7xl opacity-20 rotate-[-15deg]">
                  🪄
                </div>
                <h3 className="text-xl font-extrabold text-[#C27D5F] flex items-center gap-2.5 mb-3 relative z-10">
                  <Star className="w-5 h-5 fill-[#C27D5F] text-[#C27D5F]" /> Picky Eater Magic
                </h3>
                <p className="text-[#8c5a42] font-semibold text-[15px] leading-relaxed relative z-10">
                  {recipe.pickyHack || recipe.kid_plating_hack}
                </p>
              </div>
            </section>
          )}

        </div>
        </div>

        {/* Floating Action Bar */}
        <div className="shrink-0 w-full p-6 bg-gradient-to-t from-[#FAFAFA] dark:from-[#0A0A0A] via-[#FAFAFA] dark:via-[#0A0A0A] to-[#FAFAFA] dark:to-[#0A0A0A] z-40 border-t border-gray-100 dark:border-white/10 shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
          <button 
            onClick={() => setIsCooking(true)}
            className="w-full py-4 rounded-full font-bold text-lg shadow-lg transition-transform active:scale-[0.98] flex justify-center items-center gap-2 bg-[#0D9488] text-white shadow-[#0D9488]/30"
          >
            Start Cooking
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ onSelectRecipe, onBack }: { onSelectRecipe: (r: Recipe) => void, onBack: () => void }) {
  const { cookedHistory, recipes } = useAppStore();
  const cookedRecipes = (cookedHistory || []).slice(0, 20).map(id => recipes.find(r => r.id === id)).filter(Boolean) as Recipe[];

  return (
    <div className="animate-in fade-in duration-300">
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2C2C2E] rounded-full transition-all duration-300 ease-in-out"
          >
            <ArrowLeft className="w-6 h-6 text-[#333333] dark:text-[#E5E5EA]" />
          </button>
          <h2 className="text-2xl font-extrabold text-[#333333] dark:text-[#E5E5EA]">Cooked History</h2>
        </div>
      </header>

      <div className="px-6 pb-6">
        {cookedRecipes.length > 0 ? (
          <div className="space-y-4">
            {cookedRecipes.map((recipe, index) => (
              <div 
                key={recipe.id + '-' + index}
                className="flex items-center gap-4 p-3 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl shadow-sm dark:border-white/10 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectRecipe(recipe)}
              >
                <img src={recipe.image} alt={recipe.title} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-[#333333] dark:text-[#E5E5EA]">{recipe.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{recipe.region || recipe.time}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-300 dark:text-[#38383A] rotate-180" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] dark:text-[#E5E5EA]">No history yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Start cooking meals to build your history!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PaywallModal({ onClose }: { onClose: () => void }) {
  const { setPremium, userState } = useAppStore();

  return (
    <div className="fixed inset-0 z-[100] flex justify-center bg-[#333333]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-auto mt-auto mb-0 sm:my-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] relative animate-in slide-in-from-bottom-8 duration-300 shadow-2xl flex flex-col p-8 sm:rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-t-3xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-[#38383A] hover:bg-gray-300 transition-all duration-300 ease-in-out rounded-full"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {userState.isPremium ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-orange-200 dark:border-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-black text-[#333333] dark:text-[#E5E5EA]">Limit Reached!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium mb-6">You've reached your Premium daily limit for today! Your slots will automatically reset at midnight. Why not look over your saved meal plans?</p>
            <button
              onClick={onClose}
              className="w-full bg-[#C27D5F] hover:bg-[#a66a50] text-white font-bold py-4 rounded-full transition-all duration-300 ease-in-out shadow-lg shadow-[#C27D5F]/30"
            >
              Okay, Got It
            </button>
            <button 
              disabled
              className="w-full mt-3 bg-gray-200 text-gray-500 font-bold py-4 rounded-full cursor-not-allowed opacity-70"
            >
              Premium Tier (Coming Soon)
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-orange-200 dark:border-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-black text-[#333333] dark:text-[#E5E5EA]">You've reached your daily magic limit! 🪄</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">We are currently in Early Access and our Premium features are launching very soon. Your free limits will automatically reset at midnight.</p>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-[#C27D5F] hover:bg-[#a66a50] text-white font-bold py-4 rounded-full transition-all duration-300 ease-in-out shadow-lg shadow-[#C27D5F]/30"
            >
              Okay, Got It
            </button>
            <button 
              disabled
              className="w-full mt-3 bg-gray-200 dark:bg-[#38383A] text-gray-400 dark:text-gray-500 font-bold py-4 rounded-full cursor-not-allowed opacity-70"
            >
              Premium Tier (Coming Soon)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

