import React, { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, Users, Plus, CheckCircle, Trash2, Clock, ChefHat, Sparkles } from 'lucide-react';
import { Recipe } from './store';
import localforage from 'localforage';

type Props = {
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
};

export function CreateRecipeOverlay({ onClose, onSave }: Props) {
  // Request persistent storage
  useEffect(() => {
    async function requestPersist() {
      if (navigator.storage && navigator.storage.persist) {
        try {
          await navigator.storage.persist();
        } catch (e) {
          // Ignore
        }
      }
    }
    requestPersist();
  }, []);

  const [title, setTitle] = useState('');
  const [servings, setServings] = useState<number | ''>('');
  const [time, setTime] = useState('');
  
  const [ingredients, setIngredients] = useState([{ id: Date.now().toString(), text: '' }]);
  const [steps, setSteps] = useState([{ id: Date.now().toString(), text: '' }]);
  
  const [image, setImage] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; // Increased a bit for crispness
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setImage(canvas.toDataURL('image/webp', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), text: '' }]);
  };

  const updateIngredient = (index: number, val: string) => {
    const newArr = [...ingredients];
    newArr[index].text = val;
    setIngredients(newArr);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return;
    const newArr = [...ingredients];
    newArr.splice(index, 1);
    setIngredients(newArr);
  };

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), text: '' }]);
  };

  const updateStep = (index: number, val: string) => {
    const newArr = [...steps];
    newArr[index].text = val;
    setSteps(newArr);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const newArr = [...steps];
    newArr.splice(index, 1);
    setSteps(newArr);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorDetails("Please give your magical creation a name!");
      return;
    }
    
    const validIngredients = ingredients.filter(i => i.text.trim());
    if (validIngredients.length === 0) {
      setErrorDetails("A recipe needs at least one ingredient!");
      return;
    }
    
    setErrorDetails('');
    setIsSaving(true);
    
    const validSteps = steps.filter(s => s.text.trim()).map(s => s.text.trim());
    const finalSteps = validSteps.length > 0 ? validSteps : ["Cook with love."];
    
    const parsedIngredients = validIngredients.map(i => ({
      amount: 1,
      unit: '',
      name: i.text.trim(),
    }));
    
    const recipe: Recipe = {
      id: "custom-" + Date.now(),
      title: trimmedTitle,
      image: image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800",
      time: time.trim() || "30 min",
      difficulty: "Medium",
      baseServings: servings === '' ? 4 : typeof servings === 'string' ? parseInt(servings, 10) || 4 : servings,
      region: 'Custom',
      ingredients: parsedIngredients,
      steps: finalSteps,
    };
    
    try {
      // Save offline context via localforage
      const existing = await localforage.getItem<Recipe[]>('customRecipesOfflineStore') || [];
      existing.push(recipe);
      await localforage.setItem('customRecipesOfflineStore', existing);
      
      // Simulate slight delay for smoothness
      setTimeout(() => {
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => {
          onSave(recipe);
          onClose();
        }, 1500); // Route back after showing success popup
      }, 1000);
    } catch (e) {
      console.error(e);
      setErrorDetails("Failed to save via the offline database.");
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#0A0A0A] text-[#E5E5EA] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4A2E4B]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1e3427]/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none z-0"></div>

      {/* Header */}
      <header className="px-6 py-5 shrink-0 flex items-center justify-between relative bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-white/5 z-10 shadow-lg">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 text-white/50 hover:text-white transition-all duration-300 ease-in-out rounded-full hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="font-bold tracking-widest uppercase text-sm text-[#F3C4B3] flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> Recipe Builder
        </h2>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-40 relative z-10 scrollbar-hide">
        <div className="space-y-6 max-w-xl mx-auto">
          
          {/* Cover Image Upload (Card approach) */}
          <div className="relative">
             <label className="relative block w-full h-56 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden bg-gradient-to-br from-[#2D3047] to-[#1B1D2C] border border-white/10 cursor-pointer group shadow-2xl transition-transform active:scale-[0.98]">
               <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isSaving} />
               
               {image ? (
                 <>
                   <img src={image} alt="Cover" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center">
                     <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium flex items-center gap-2">
                       <ImageIcon className="w-4 h-4" /> Change Cover
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                   <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 ease-in-out shadow-inner">
                     <ImageIcon className="w-7 h-7 text-[#E2A68D]" />
                   </div>
                   <span className="text-sm font-medium text-white/70 tracking-wide">Upload Masterpiece</span>
                 </div>
               )}
             </label>
          </div>

          <div className="bg-[#2C2C2E]/60 backdrop-blur-lg border border-white/5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-5 shadow-xl">
             
             {/* General Info */}
             <div className="flex flex-col gap-5">
               {/* Recipe Title */}
               <div className="flex flex-col">
                 <input 
                   type="text"
                   value={title}
                   onChange={e => { setTitle(e.target.value); setErrorDetails(''); }}
                   placeholder="Recipe Title"
                   className="w-full bg-transparent text-2xl md:text-3xl font-bold tracking-tight text-white placeholder-white/20 outline-none transition-all duration-300 ease-in-out border-b border-transparent focus:border-[#E2A68D]/40 pb-2"
                   disabled={isSaving}
                 />
                 {errorDetails && <p className="text-[#F3C4B3] text-sm mt-1">{errorDetails}</p>}
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                   <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Prep Time</label>
                   <div className="flex items-center bg-black/20 border border-white/5 rounded-full p-3 focus-within:border-[#0D9488]/50 transition-all duration-300 ease-in-out">
                     <Clock className="w-4 h-4 text-[#0D9488] mr-2" />
                     <input 
                       type="text"
                       value={time}
                       onChange={e => setTime(e.target.value)}
                       placeholder="e.g. 45 min"
                       className="w-full bg-transparent outline-none text-white text-sm font-semibold"
                       disabled={isSaving}
                     />
                   </div>
                 </div>
                 
                 <div className="relative">
                   <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Servings</label>
                   <div className="flex items-center bg-black/20 border border-white/5 rounded-full p-3 focus-within:border-[#0D9488]/50 transition-all duration-300 ease-in-out">
                     <Users className="w-4 h-4 text-[#0D9488] mr-2" />
                     <input 
                       type="number"
                       value={servings}
                       onChange={e => setServings(e.target.value ? parseInt(e.target.value) : '')}
                       placeholder="e.g. 4"
                       className="w-full bg-transparent outline-none text-white text-sm font-semibold"
                       disabled={isSaving}
                     />
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="h-px bg-white/5 w-full my-6"></div>
             
             {/* Dynamic Ingredients */}
             <div className="flex flex-col gap-3">
               <label className="text-xs font-medium text-white/50 uppercase tracking-wider block">Ingredients</label>
               {ingredients.map((ing, idx) => (
                 <div key={ing.id} className="flex items-center gap-2 animate-in slide-in-from-left-2 fade-in duration-300">
                   <div className="flex-1 bg-black/20 border border-white/5 rounded-full p-3 flex items-center focus-within:border-[#0D9488]/50 transition-all duration-300 ease-in-out">
                     <div className="w-1.5 h-1.5 bg-[#E2A68D] rounded-full mr-3 shrink-0"></div>
                     <input 
                       type="text"
                       value={ing.text}
                       onChange={e => updateIngredient(idx, e.target.value)}
                       placeholder="e.g. 2 cups of flour"
                       className="w-full bg-transparent outline-none text-white text-sm font-medium"
                       disabled={isSaving}
                     />
                   </div>
                   <button 
                     onClick={() => removeIngredient(idx)}
                     disabled={ingredients.length <= 1 || isSaving}
                     className="p-3 text-white/30 hover:text-[#F3C4B3] hover:bg-white/5 rounded-full transition-all disabled:opacity-30"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button 
                 onClick={addIngredient}
                 disabled={isSaving}
                 className="self-start mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 text-sm font-medium flex items-center gap-2 transition-all duration-300 ease-in-out border border-white/5"
               >
                 <Plus className="w-4 h-4" /> Add Ingredient
               </button>
             </div>
             
             <div className="h-px bg-white/5 w-full my-6"></div>
             
             {/* Dynamic Instructions */}
             <div className="flex flex-col gap-3">
               <label className="text-xs font-medium text-white/50 uppercase tracking-wider block">Instructions</label>
               {steps.map((step, idx) => (
                 <div key={step.id} className="flex gap-2 animate-in slide-in-from-left-2 fade-in duration-300 group">
                   <div className="mt-2 w-6 h-6 shrink-0 bg-[#0D9488]/20 text-[#0D9488] flex items-center justify-center rounded-full text-xs font-medium border border-[#0D9488]/30">
                     {idx + 1}
                   </div>
                   <div className="flex-1 bg-black/20 border border-white/5 rounded-full p-3 focus-within:border-[#0D9488]/50 transition-all duration-300 ease-in-out">
                     <textarea 
                       value={step.text}
                       onChange={e => updateStep(idx, e.target.value)}
                       placeholder={`Step ${idx + 1} instructions...`}
                       className="w-full bg-transparent outline-none text-white text-sm font-medium resize-none min-h-[60px]"
                       disabled={isSaving}
                     />
                   </div>
                   <button 
                     onClick={() => removeStep(idx)}
                     disabled={steps.length <= 1 || isSaving}
                     className="p-3 self-start text-white/30 hover:text-[#F3C4B3] hover:bg-white/5 rounded-full transition-all disabled:opacity-30 mt-1"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button 
                 onClick={addStep}
                 disabled={isSaving}
                 className="self-start mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 text-sm font-medium flex items-center gap-2 transition-all duration-300 ease-in-out border border-white/5"
               >
                 <Plus className="w-4 h-4" /> Add Step
               </button>
             </div>
             
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/5 z-40">
        <div className="max-w-xl mx-auto flex gap-3">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-4 text-white/60 font-medium hover:text-white rounded-full bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-4 rounded-full font-medium bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white hover:from-[#0F766E] hover:to-[#647161] shadow-[0_0_20px_rgba(138,154,134,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2 animate-pulse">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                Saving to Vault...
              </span>
            ) : "Save Custom Recipe"}
          </button>
        </div>
      </footer>
      
      {/* Success Overlay Popup */}
      {showSuccess && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-hidden">
           <div className="bg-[#0A0A0A] border border-[#38383A] rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-8 max-w-xs w-full flex flex-col items-center text-center shadow-[0_0_50px_rgba(138,154,134,0.2)] animate-in zoom-in-90 duration-300">
             <div className="w-20 h-20 bg-[#0D9488]/20 border border-[#0D9488]/50 text-[#0D9488] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#0D9488]/20 animate-in bounce-in duration-500 delay-100">
               <CheckCircle className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-white tracking-tight mb-2">Recipe Saved!</h3>
             <p className="text-white/60 font-medium text-sm">Your masterpiece is now in the Vault for offline access.</p>
           </div>
         </div>
      )}
    </div>
  );
}

