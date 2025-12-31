import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Sparkles, ChefHat } from 'lucide-react';
import { MENU_ITEMS, CATEGORIES } from './constants';
import { MenuItem, Category, CartItem } from './types';
import DishCard from './components/DishCard';
import CartDrawer from './components/CartDrawer';
import AIChat from './components/AIChat';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [highlightedItemIds, setHighlightedItemIds] = useState<string[]>([]);

  // Cart Logic
  const addToCart = useCallback((item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  const clearHighlight = useCallback(() => {
    if (highlightedItemIds.length > 0) {
      setHighlightedItemIds([]);
    }
  }, [highlightedItemIds]);

  // Filtering Logic
  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate total items for badge
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-paper text-gray-800 font-sans pb-20">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-imperial-red p-1.5 rounded-lg">
                <ChefHat className="text-white" size={24} />
              </div>
              <span className="font-bold text-xl tracking-wide text-gray-900">Dragon<span className="text-imperial-red">Palate</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-imperial-red transition-colors bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-full"
              >
                <Sparkles size={16} className="text-gold-accent" />
                AI 推薦
              </button>
              
              <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={24} className="text-gray-700 hover:text-imperial-red transition-colors" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-imperial-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                    {totalCartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Category Scroll */}
        <div className="border-t border-gray-50 overflow-x-auto hide-scrollbar">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-3 min-w-max">
            <button
              onClick={() => { setSelectedCategory('ALL'); clearHighlight(); }}
              className={`text-sm font-medium transition-colors whitespace-nowrap pb-1 border-b-2 ${selectedCategory === 'ALL' ? 'text-imperial-red border-imperial-red' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
            >
              全部餐點
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); clearHighlight(); }}
                className={`text-sm font-medium transition-colors whitespace-nowrap pb-1 border-b-2 ${selectedCategory === cat ? 'text-imperial-red border-imperial-red' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Header */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">午餐時光</h1>
            <p className="text-gray-500">
              {highlightedItemIds.length > 0 ? ' ✨ AI 為您精選的推薦餐點' : '享受正宗中式料理的極致美味'}
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜尋餐點..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-imperial-red/20 focus:border-imperial-red transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <DishCard 
              key={item.id} 
              item={item} 
              onAdd={addToCart} 
              isHighlighted={highlightedItemIds.includes(item.id)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">找不到相關餐點，試試別的關鍵字？</p>
          </div>
        )}
      </main>

      {/* Floating Buttons for Mobile */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-30 md:hidden">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-gray-800 text-white p-3.5 rounded-full shadow-lg shadow-gray-400/50 hover:bg-gray-700 transition-transform active:scale-95"
        >
          <Sparkles size={24} className="text-gold-accent" />
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-imperial-red text-white p-3.5 rounded-full shadow-lg shadow-red-300/50 hover:bg-red-700 transition-transform active:scale-95"
        >
          <ShoppingBag size={24} />
          {totalCartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart Sidebar */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          alert("感謝您的訂購！餐點將儘快為您準備。");
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />

      {/* AI Chat Window */}
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        menuItems={MENU_ITEMS}
        onHighlightItems={(ids) => {
          setHighlightedItemIds(ids);
          setSelectedCategory('ALL'); // Reset category to show recommendations
          // Scroll to top to see highlighted items
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
};

export default App;