import { INITIAL_RECIPES } from './recipes';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localforage from 'localforage';
import { supabase } from './supabaseClient';

export type Ingredient = {
  amount: number | string;
  unit: string;
  name: string;
  category?: string;
  notes?: string;
};

export type Recipe = {
  id: string;
  title: string;
  image: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  baseServings: number;
  region?: string;
  ingredients: Ingredient[];
  steps?: string[];
  detailedSteps?: { text: string; time?: number; refs?: number[] }[];
  instructions?: string[];
  pickyHack?: string;
  kid_plating_hack?: string;
  isPlanB?: boolean;
};

export type UsageTracker = {
  date: string;
  textGenerations: number;
  cameraScans: number;
  galleryScans: number;
};

export type UserState = {
  isPremium: boolean;
  language: string;
  preferredUnits?: 'US' | 'India';
  theme?: 'light' | 'dark';
  notificationsEnabled?: boolean;
  notificationTime?: string;
  hasCompletedOnboarding?: boolean;
  usageTracker?: UsageTracker;
  currentWeekStart?: string;
  lastWeekReset?: string;
};

export type GroceryItem = {
  id: string;
  category: string;
  name: string;
  amount: number | string;
  unit: string;
  checked: boolean;
  isCustom?: boolean;
};

export type MealPlan = Record<string, string[]>;

type AppContextType = {

  userState: UserState;
  recipes: Recipe[];
  mealPlan: MealPlan;
  groceryList: GroceryItem[];
  favorites: Set<string>;
  ratings: Record<string, number>;
  cookedHistory: string[];
  setPremium: (val: boolean) => void;
  setLanguage: (lang: string) => void;
  setPreferredUnits: (unit: 'US' | 'India') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  completeOnboarding: () => void;
  addRecipe: (r: Recipe) => void;
  removeRecipe: (id: string) => void;
  addMealToDay: (day: string, recipeId: string) => void;
  updateMealForDay: (day: string, index: number, recipeId: string) => void;
  removeMealFromDay: (day: string, index: number) => void;
  swapToPlanB: (day: string, index?: number) => void;
  toggleFavorite: (id: string) => void;
  rateRecipe: (id: string, rating: number) => void;
  clearFavorites: () => void;
  toggleGroceryCheck: (id: string) => void;
  addCustomGrocery: (name: string, category: string) => void;
  removeGroceryItem: (id: string) => void;
  addCookedRecipe: (id: string) => void;
  checkUsageLimit: (action: 'text' | 'camera' | 'gallery') => boolean;
  incrementUsage: (action: 'text' | 'camera' | 'gallery') => Promise<void>;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  // Auth
  session: any;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};


const INITIAL_MEAL_PLAN: MealPlan = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {

  const [userState, setUserState] = useState<UserState>({ isPremium: false, language: 'en', theme: 'light' });
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [mealPlan, setMealPlan] = useState<MealPlan>(INITIAL_MEAL_PLAN);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [cookedHistory, setCookedHistory] = useState<string[]>(['mex_2', 'ame_2', 'ita_2']);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [recipesPage, setRecipesPage] = useState(0);
  const RECIPES_PER_PAGE = 50;

  // Supabase Auth Session
  const [session, setSession] = useState<any>(null);

  const checkUsageLimit = (action: 'text' | 'camera' | 'gallery'): boolean => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isPremium = userState.isPremium;

    // Shallow clone to avoid mutating React state directly
    const currentTracker = userState.usageTracker ? { ...userState.usageTracker } : {
      date: today,
      textGenerations: 0,
      cameraScans: 0,
      galleryScans: 0
    };

    // Reset if it's a new day
    if (currentTracker.date !== today) {
      currentTracker.date = today;
      currentTracker.textGenerations = 0;
      currentTracker.cameraScans = 0;
      currentTracker.galleryScans = 0;
    }

    // Limits
    let allowed = true;
    if (action === 'text') {
      const limit = isPremium ? 4 : 2;
      if (currentTracker.textGenerations >= limit) allowed = false;
    } else {
      // Free users share 1 photo scan between camera and gallery
      if (!isPremium) {
        if ((currentTracker.cameraScans + currentTracker.galleryScans) >= 1) allowed = false;
      } else {
        // Premium: 2 camera and 2 gallery separate limits
        if (action === 'camera') {
          if (currentTracker.cameraScans >= 2) allowed = false;
        } else if (action === 'gallery') {
          if (currentTracker.galleryScans >= 2) allowed = false;
        }
      }
    }

    if (!allowed) {
      setShowPaywall(true);
      return false;
    }

    return true;
  };

  const incrementUsage = async (action: 'text' | 'camera' | 'gallery') => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    // 1. Optimistic local update
    setUserState(prev => {
      const currentTracker = prev.usageTracker ? { ...prev.usageTracker } : {
        date: today,
        textGenerations: 0,
        cameraScans: 0,
        galleryScans: 0
      };

      if (currentTracker.date !== today) {
        currentTracker.date = today;
        currentTracker.textGenerations = 0;
        currentTracker.cameraScans = 0;
        currentTracker.galleryScans = 0;
      }

      if (action === 'text') currentTracker.textGenerations++;
      else if (action === 'camera') currentTracker.cameraScans++;
      else if (action === 'gallery') currentTracker.galleryScans++;

      return { ...prev, usageTracker: currentTracker };
    });

    // 2. Sync with user_usage table in Supabase
    if (session?.user?.id && supabase) {
      try {
        // Fetch current row. If it doesn't exist, we'll insert a new one
        const { data: currentData, error: fetchErr } = await supabase
          .from('user_usage')
          .select('*')
          .eq('id', session.user.id)
          .single();

        let newRow = {
          id: session.user.id,
          text_generations_used: 0,
          camera_scans_used: 0,
          gallery_scans_used: 0,
          last_reset_date: new Date().toISOString()
        };

        if (currentData) {
          newRow = { ...currentData };
        }

        if (action === 'text') newRow.text_generations_used++;
        else if (action === 'camera') newRow.camera_scans_used++;
        else if (action === 'gallery') newRow.gallery_scans_used++;

        await supabase.from('user_usage').upsert(newRow);
      } catch (err) {
        console.error("Failed to update user_usage table", err);
      }
    }
  };

  // Load from Supabase on session change, else fallback to local storage
  useEffect(() => {
    let active = true;

    const setupAuthAndLoadData = async () => {
      // 1. Init Auth Session
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) setSession(session);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (active) setSession(session);
        });

        // 2. Fetch User Cloud State if logged in
        if (session?.user?.id) {
           try {
             const { data, error } = await supabase
                .from('user_cloud_state')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
                
             // Fetch user_usage from supabase
             const { data: usageData, error: usageError } = await supabase
                .from('user_usage')
                .select('*')
                .eq('id', session.user.id)
                .single();

             // Fetch recipes from dedicated table
             const { data: recipesData, error: recipesError } = await supabase
                .from('recipes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(50);

             if (!error && data) {
                if (data.user_state) {
                   // Ensure initial load from cloud defaults to free tier until explicit user_usage tells us otherwise
                   setUserState({ ...data.user_state, isPremium: false });
                }
                
                // If we found recipes in the new table, use them. Otherwise fallback to the old JSON blob for backwards compatibility
                if (recipesData && recipesData.length > 0) {
                   // Map DB snake_case columns back to the Recipe type, handling the image_url alias
                   const mappedRecipes = recipesData.map(r => ({
                      ...r,
                      image: r.image_url || r.image,
                      baseServings: r.base_servings || r.baseServings,
                      pickyHack: r.picky_hack || r.pickyHack,
                      kid_plating_hack: r.kid_plating_hack || r.kid_plating_hack,
                      detailedSteps: r.detailed_steps || r.detailedSteps,
                      isPlanB: r.is_plan_b || r.isPlanB
                   }));
                   setRecipes(mappedRecipes);
                } else if (data.recipes) {
                   setRecipes(data.recipes);
                }

                if (data.meal_plan) setMealPlan(data.meal_plan);
                if (data.grocery_list) setGroceryList(data.grocery_list);
                if (data.favorites) setFavorites(new Set(data.favorites));
                if (data.ratings) setRatings(data.ratings);
                if (data.cooked_history) setCookedHistory(data.cooked_history);
             } else if (error && error.code === 'PGRST116') {
                // New User Hook: Initialize 2 starter recipes per regional cuisine
                const starterRecipes = INITIAL_RECIPES.reduce((acc, recipe) => {
                  const countInReg = acc.filter(r => r.region === (recipe as any).region).length;
                  if (countInReg < 2) {
                    acc.push(recipe);
                  }
                  return acc;
                }, [] as any[]);
                setRecipes(starterRecipes);
             }

             // Merge usage tracker from DB
             if (usageData && active) {
                const today = new Date().toISOString().split('T')[0];
                setUserState(prev => ({
                   ...prev,
                   isPremium: usageData.tier === 'premium',
                   usageTracker: {
                      date: today,
                      textGenerations: usageData.text_generations_used || 0,
                      cameraScans: usageData.camera_scans_used || 0,
                      galleryScans: usageData.gallery_scans_used || 0
                   }
                }));
             }

             if (active && (!error || error.code === 'PGRST116')) { // PGRST116 means no rows found
                setIsLoaded(true);
                return; // Loaded from cloud
             }

           } catch (err) {
             console.error("Error loading cloud state", err);
           }
        }
      }

      // 3. Fallback to Local Storage
      await loadFromLocalForage();
    };

    setupAuthAndLoadData();

    return () => { active = false; };
  }, []);

  const loadFromLocalForage = async () => {
    try {
      const storedUser = await localforage.getItem<string>('ss_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.isPremium = false; // default constraint while loading
        setUserState(parsed);
      }
      const storedRecipes = await localforage.getItem<string>('ss_recipes_v7');
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes));
      const storedMealPlan = await localforage.getItem<string>('ss_mealPlan_v7');
      if (storedMealPlan) {
        const parsed = JSON.parse(storedMealPlan);
        const migrated: MealPlan = {};
        for (const day in parsed) {
          if (Array.isArray(parsed[day])) {
            migrated[day] = parsed[day];
          } else if (typeof parsed[day] === 'string') {
            migrated[day] = [parsed[day]];
          } else {
            migrated[day] = [];
          }
        }
        setMealPlan(migrated);
      }
      const storedGroceries = await localforage.getItem<string>('ss_groceries_v7');
      if (storedGroceries) setGroceryList(JSON.parse(storedGroceries));
      const storedFavs = await localforage.getItem<string>('ss_favorites');
      if (storedFavs) setFavorites(new Set(JSON.parse(storedFavs)));
      const storedRatings = await localforage.getItem<string>('ss_ratings');
      if (storedRatings) setRatings(JSON.parse(storedRatings));
      const storedHistory = await localforage.getItem<string>('ss_history');
      if (storedHistory) setCookedHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error('Failed to load from localforage', e);
    }
    setIsLoaded(true);
  };

  // Real-time listener for tier changes
  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    const channel = supabase
      .channel('user_usage_realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_usage',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          const newUsage = payload.new as any;
          if (newUsage) {
            setUserState(prev => ({
              ...prev,
              isPremium: newUsage.tier === 'premium',
              usageTracker: prev.usageTracker ? {
                ...prev.usageTracker,
                textGenerations: newUsage.text_generations_used || prev.usageTracker.textGenerations,
                cameraScans: newUsage.camera_scans_used || prev.usageTracker.cameraScans,
                galleryScans: newUsage.gallery_scans_used || prev.usageTracker.galleryScans
              } : undefined
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Save to cloud, then local storage
  useEffect(() => {
    if (!isLoaded) return;
    
    // Cloud Persistence with debounce
    if (session?.user?.id && supabase) {
      const timeoutId = setTimeout(async () => {
        // Strip large base64 images from recipes to prevent "Failed to fetch" (payload too large)
        const safeRecipes = recipes.map(r => r.image && r.image.startsWith('data:image') 
          ? { ...r, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' } 
          : r
        );

        // Save scalar/JSON fields to user_cloud_state (excluding recipes to save space)
        try {
          const { error } = await supabase.from('user_cloud_state').upsert({
            user_id: session.user.id,
            user_state: userState,
            meal_plan: mealPlan,
            grocery_list: groceryList,
            favorites: Array.from(favorites),
            ratings: ratings,
            cooked_history: cookedHistory
          }, { onConflict: 'user_id' });
          if (error) console.error("Cloud State Save Error", error);
        } catch (err) {
          console.error("Cloud State Save Exception", err);
        }

        // Save recipes to dedicated table
        if (safeRecipes.length > 0) {
          const mappedRecipes = safeRecipes.map(r => ({
            id: r.id,
            user_id: session.user.id,
            title: r.title,
            image_url: r.image, // User requested image_url
            time: r.time,
            difficulty: r.difficulty,
            base_servings: r.baseServings,
            region: r.region,
            ingredients: r.ingredients,
            steps: r.steps,
            detailed_steps: r.detailedSteps,
            instructions: r.instructions,
            picky_hack: r.pickyHack,
            kid_plating_hack: r.kid_plating_hack || r.kid_plating_hack,
            is_plan_b: r.isPlanB
          }));
          
          try {
            const { error } = await supabase.from('recipes').upsert(mappedRecipes, { onConflict: 'id' });
            if (error) console.error("Cloud Recipes Save Error", error);
          } catch (err) {
            console.error("Cloud Recipes Save Exception", err);
          }
        }

        // Local Forage Persistence (async)
        try {
          const safeRecipesForLocal = recipes.map(r => r.image && r.image.startsWith('data:image') 
            ? { ...r, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' } 
            : r
          );
          await localforage.setItem('ss_user', JSON.stringify(userState));
          await localforage.setItem('ss_recipes_v7', JSON.stringify(safeRecipesForLocal));
          await localforage.setItem('ss_mealPlan_v7', JSON.stringify(mealPlan));
          await localforage.setItem('ss_groceries_v7', JSON.stringify(groceryList));
          await localforage.setItem('ss_favorites', JSON.stringify(Array.from(favorites)));
          await localforage.setItem('ss_ratings', JSON.stringify(ratings));
          await localforage.setItem('ss_history', JSON.stringify(cookedHistory));
        } catch (error) {
          console.error('Failed to save to localforage:', error);
        }
      }, 2000); // 2 second debounce

      return () => clearTimeout(timeoutId);
    } else {
      // Offline / Guest Local Forage
      const saveLocally = async () => {
        try {
          const safeRecipesForLocal = recipes.map(r => r.image && r.image.startsWith('data:image') 
            ? { ...r, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800' } 
            : r
          );
          await localforage.setItem('ss_user', JSON.stringify(userState));
          await localforage.setItem('ss_recipes_v7', JSON.stringify(safeRecipesForLocal));
          await localforage.setItem('ss_mealPlan_v7', JSON.stringify(mealPlan));
          await localforage.setItem('ss_groceries_v7', JSON.stringify(groceryList));
          await localforage.setItem('ss_favorites', JSON.stringify(Array.from(favorites)));
          await localforage.setItem('ss_ratings', JSON.stringify(ratings));
          await localforage.setItem('ss_history', JSON.stringify(cookedHistory));
        } catch (error) {
          console.error('Failed to save to localforage:', error);
        }
      };
      saveLocally();
    }
  }, [userState, recipes, mealPlan, groceryList, favorites, ratings, cookedHistory, isLoaded, session]);

  // Check and reset meal plan if it's a new week
  useEffect(() => {
    if (!isLoaded) return;
    
    const now = new Date();
    const day = now.getDay() || 7; // Convert Sunday(0) to 7
    const diff = now.getDate() - day + 1; // Monday of current week
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
    const expectedStr = `${weekStart.getFullYear()}-W${weekStart.getMonth() + 1}-${weekStart.getDate()}`;

    if (userState.lastWeekReset !== expectedStr) {
      setMealPlan({
        Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
      });
      setUserState(prev => ({ ...prev, lastWeekReset: expectedStr }));
    }
  }, [isLoaded, userState.lastWeekReset]);

  // Aggregate Groceries
  useEffect(() => {
    if (!isLoaded) return;
    const newItems: GroceryItem[] = [];
    
    // Aggregation logic
    Object.values(mealPlan).flat().forEach(recipeId => {
      if (!recipeId) return;
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;
      
      recipe.ingredients.forEach(ing => {
        // Attempt to aggregate by name
        const existing = newItems.find(i => i.name.toLowerCase() === ing.name.toLowerCase() && i.unit === ing.unit);
        if (existing && typeof existing.amount === 'number' && typeof ing.amount === 'number') {
          existing.amount += ing.amount;
        } else {
          newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            category: ing.category || 'Other',
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            checked: false,
          });
        }
      });
    });

    // Preserve checked state and custom items
    setGroceryList(prevList => {
      const derivedItems = newItems.map(item => {
        const prevItem = prevList.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        return prevItem ? { ...item, checked: prevItem.checked } : item;
      });
      const customItems = prevList.filter(p => p.isCustom);
      return [...derivedItems, ...customItems];
    });
  }, [mealPlan, recipes]);

  const setPremium = async (val: boolean) => {
    setUserState(prev => ({ 
       ...prev, 
       isPremium: val,
       usageTracker: val ? {
         date: new Date().toISOString().split('T')[0],
         textGenerations: 0,
         cameraScans: 0,
         galleryScans: 0
       } : prev.usageTracker
    }));

    if (val && session?.user?.id && supabase) {
      try {
        await supabase.from('user_usage').upsert({
          id: session.user.id,
          tier: 'premium',
          text_generations_used: 0,
          camera_scans_used: 0,
          gallery_scans_used: 0,
          last_reset_date: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to update premium tier in user_usage", err);
      }
    }
  };
  
  const setLanguage = (lang: string) => {
    if (lang === userState.language) return;
    setUserState(prev => ({ ...prev, language: lang }));
  };

  const setPreferredUnits = (unit: 'US' | 'India') => setUserState(prev => ({ ...prev, preferredUnits: unit }));
  const setTheme = (theme: 'light' | 'dark') => setUserState(prev => ({ ...prev, theme }));
  const setNotificationsEnabled = (enabled: boolean) => setUserState(prev => ({ ...prev, notificationsEnabled: enabled }));
  const setNotificationTime = (time: string) => setUserState(prev => ({ ...prev, notificationTime: time }));
  const completeOnboarding = () => setUserState(prev => ({ ...prev, hasCompletedOnboarding: true }));
  const addRecipe = (r: Recipe) => setRecipes(prev => [r, ...prev]);
  const removeRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));
  const addMealToDay = (day: string, recipeId: string) => setMealPlan(prev => ({ 
    ...prev, 
    [day]: [...(prev[day] || []), recipeId].slice(0, 3) 
  }));
  const updateMealForDay = (day: string, index: number, recipeId: string) => setMealPlan(prev => {
    const updated = [...(prev[day] || [])];
    updated[index] = recipeId;
    return { ...prev, [day]: updated };
  });
  const removeMealFromDay = (day: string, index: number) => setMealPlan(prev => {
    const updated = [...(prev[day] || [])];
    updated.splice(index, 1);
    return { ...prev, [day]: updated };
  });
  
  const swapToPlanB = (day: string, index?: number) => {
    const planBRecipes = recipes.filter(r => r.isPlanB);
    if (planBRecipes.length === 0) return; // Fallback if no recipes found

    // Find currently planned recipes for the week
    const plannedRecipeIds = Object.values(mealPlan).flat().filter(Boolean) as string[];

    // Prefer a Plan B recipe that isn't already planned this week
    const unusedPlanBRecipes = planBRecipes.filter(r => !plannedRecipeIds.includes(r.id));

    const pool = unusedPlanBRecipes.length > 0 ? unusedPlanBRecipes : planBRecipes;
    const randomPlanB = pool[Math.floor(Math.random() * pool.length)];

    setMealPlan(prev => {
      const updated = [...(prev[day] || [])];
      if (updated.length === 0) {
        updated.push(randomPlanB.id);
      } else {
        const targetIndex = index !== undefined ? index : updated.length - 1;
        updated[targetIndex] = randomPlanB.id;
      }
      return { ...prev, [day]: updated };
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFavorites = () => {
    setFavorites(new Set());
  };

  const rateRecipe = (id: string, rating: number) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

  const toggleGroceryCheck = (id: string) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addCustomGrocery = (name: string, category: string) => {
    setGroceryList(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      category,
      amount: '',
      unit: '',
      checked: false,
      isCustom: true
    }]);
  };

  const removeGroceryItem = (id: string) => {
    setGroceryList(prev => prev.filter(item => item.id !== id));
  };

  const addCookedRecipe = (id: string) => {
    setCookedHistory(prev => {
      const idx = prev.indexOf(id);
      if (idx !== -1) {
        // Move to front
        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(id);
        return next;
      }
      return [id, ...prev];
    });
  };

  // Auth Functions
  const signUp = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Supabase not configured') };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (e: any) {
      return { error: e };
    }
  };

  const signOut = async () => {
    if (supabase) {
       await supabase.auth.signOut();
    }
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{
      userState, recipes, mealPlan, groceryList, favorites, ratings, cookedHistory,
      setPremium, setLanguage, setPreferredUnits, setTheme, setNotificationsEnabled, setNotificationTime, completeOnboarding, addRecipe, removeRecipe, addMealToDay, updateMealForDay, removeMealFromDay, swapToPlanB, toggleFavorite, clearFavorites, rateRecipe, toggleGroceryCheck, addCustomGrocery, removeGroceryItem, addCookedRecipe,
      checkUsageLimit, incrementUsage, showPaywall, setShowPaywall,
      session, signUp, signIn, signOut
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function convertAmountAndUnit(baseAmount: number | string | null | undefined, baseUnit: string, currentServings: number, baseServings: number, isMetric: boolean) {
  if (baseAmount == null || baseAmount === 0 || baseAmount === "") return { amountStr: "", unitStr: baseUnit };
  
  const commonSenseWords = ['to taste', 'as needed', 'a pinch', 'pinch', 'dash'];
  if (typeof baseAmount === 'string' && (commonSenseWords.includes(baseAmount.toLowerCase()) || isNaN(Number(baseAmount)))) {
    return { amountStr: baseAmount, unitStr: baseUnit };
  }
  if (baseUnit && commonSenseWords.includes(baseUnit.toLowerCase())) {
     return { amountStr: "", unitStr: baseUnit };
  }

  let amount = typeof baseAmount === 'number' ? baseAmount : Number(baseAmount);
  if (isNaN(amount) || amount === 0) return { amountStr: "", unitStr: baseUnit };

  amount = amount * (currentServings / baseServings);
  let unit = (baseUnit || "").toLowerCase();

  // Helper flags
  let isVolume = false;
  let isWeight = false;

  const volUS = ['cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons', 'fl oz', 'fluid ounce', 'fluid ounces', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons'];
  const volMetric = ['ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters', 'katori', 'katoris', 'chammach', 'spoon', 'spoons'];
  const weightUS = ['oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds'];
  const weightMetric = ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms'];

  if (volUS.includes(unit) || volMetric.includes(unit)) isVolume = true;
  if (weightUS.includes(unit) || weightMetric.includes(unit)) isWeight = true;

  let baseMl = 0;
  let baseG = 0;
  
  if (isVolume) {
     if (unit.includes('gallon')) baseMl = amount * 3785.41;
     else if (unit.includes('quart')) baseMl = amount * 946.35;
     else if (unit.includes('pint')) baseMl = amount * 473.18;
     else if (unit.includes('cup')) baseMl = amount * 240;
     else if (unit.includes('tbsp') || unit.includes('tablespoon')) baseMl = amount * 15;
     else if (unit.includes('tsp') || unit.includes('teaspoon')) baseMl = amount * 5;
     else if (unit.includes('fl oz') || unit.includes('fluid ounce')) baseMl = amount * 29.57;
     else if (unit === 'l' || unit === 'liter' || unit === 'liters') baseMl = amount * 1000;
     else if (unit.includes('katori')) baseMl = amount * 150;
     else if (unit.includes('chammach') || unit.includes('spoon')) baseMl = amount * 15;
     else baseMl = amount; // assume ml
  }
  
  if (isWeight) {
     if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') baseG = amount * 28.35;
     else if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') baseG = amount * 453.59;
     else if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') baseG = amount * 1000;
     else baseG = amount; // assume g
  }

  if (isMetric) {
     const isHousehold = ['cup', 'cups', 'katori', 'katoris', 'chammach', 'spoon', 'spoons'].includes(unit);
     if (isVolume && !isHousehold) {
         if (baseMl >= 1000) { amount = baseMl / 1000; unit = 'L'; }
         else { amount = baseMl; unit = 'ml'; }
     } else if (isWeight) {
         if (baseG >= 1000) { amount = baseG / 1000; unit = 'kg'; }
         else { amount = baseG; unit = 'g'; }
     }
  } else {
     if (isVolume) {
         if (baseMl >= 3785) { amount = baseMl / 3785.41; unit = 'gallon'; }
         else if (baseMl >= 946) { amount = baseMl / 946.35; unit = 'quart'; }
         else if (baseMl >= 473) { amount = baseMl / 473.18; unit = 'pint'; }
         else if (baseMl >= 235) { amount = baseMl / 240; unit = 'cup'; }
         else if (baseMl >= 29) { amount = baseMl / 29.57; unit = 'fl oz'; }
         else if (baseMl >= 14) { amount = baseMl / 15; unit = 'tbsp'; }
         else { amount = baseMl / 5; unit = 'tsp'; }
     } else if (isWeight) {
         if (baseG >= 450) { amount = baseG / 453.59; unit = 'lb'; }
         else { amount = baseG / 28.35; unit = 'oz'; }
     }
  }

  // Metric standard handling
  const isMetricUnit = unit === 'g' || unit === 'ml' || unit === 'kg' || unit === 'L';
  
  if (isMetricUnit) {
    let roundedAmount = amount;
    if (unit === 'kg' || unit === 'L') {
      roundedAmount = Number(amount.toFixed(1)); // e.g. 1.5 kg
    } else {
      roundedAmount = Math.round(amount); // whole numbers for g and ml
    }
    return { amountStr: roundedAmount.toString(), unitStr: unit };
  }

  // US handling (fractions)
  const w = Math.floor(amount);
  const r = amount - w;

  const fractions = [
    { val: 0, str: "" },
    { val: 1 / 8, str: "1/8" },
    { val: 1 / 4, str: "1/4" },
    { val: 1 / 3, str: "1/3" },
    { val: 1 / 2, str: "1/2" },
    { val: 2 / 3, str: "2/3" },
    { val: 3 / 4, str: "3/4" },
    { val: 1, str: "" },
  ];

  let closest = fractions[0];
  let minDiff = Infinity;
  for (const f of fractions) {
    if (Math.abs(r - f.val) < minDiff) {
        minDiff = Math.abs(r - f.val);
        closest = f;
    }
  }

  let wholeNum = w;
  if (closest.val === 1) wholeNum += 1;

  let fractionString = closest.str;

  let amountStr = "";
  if (wholeNum === 0) {
    amountStr = fractionString === "" ? "1/8" : fractionString;
  } else if (fractionString === "") {
    amountStr = wholeNum.toString();
  } else {
    amountStr = `${wholeNum} ${fractionString}`;
  }

  // Pluralization
  const numValue = wholeNum + closest.val;
  if (unit === 'cup' && numValue !== 1) unit = 'cups';
  if (unit === 'lb' && numValue !== 1) unit = 'lbs';
  if (unit === 'tsp' && numValue !== 1) unit = 'tsp'; // usually written as tsp
  if (unit === 'tbsp' && numValue !== 1) unit = 'tbsp'; // usually written as tbsp
  if (unit === 'oz' && numValue !== 1) unit = 'oz'; 
  if (unit === 'katori' && numValue !== 1) unit = 'katoris';
  if (unit === 'spoon' && numValue !== 1) unit = 'spoons';

  return { amountStr, unitStr: unit };
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
