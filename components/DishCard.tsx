import React from 'react';
import { Plus, Flame, Leaf } from 'lucide-react';
import { MenuItem } from '../types';

interface DishCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  isHighlighted?: boolean;
}

const DishCard: React.FC<DishCardProps> = ({ item, onAdd, isHighlighted }) => {
  return (
    <div 
      className={`
        group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border
        ${isHighlighted ? 'border-gold-accent ring-2 ring-gold-accent/50 scale-[1.02]' : 'border-gray-100'}
      `}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`https://picsum.photos/400/300?random=${item.imageId}`}
          alt={item.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
           {item.isVegetarian && (
            <span className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Leaf size={12} /> 素食
            </span>
          )}
          {item.spiciness && item.spiciness > 0 ? (
            <span className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Flame size={12} /> {item.spiciness === 1 ? '微辣' : item.spiciness === 2 ? '中辣' : '大辣'}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-imperial-red transition-colors">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-imperial-red">
            ${item.price}
          </span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {item.description}
        </p>

        <button
          onClick={() => onAdd(item)}
          className="w-full bg-stone-100 hover:bg-imperial-red text-gray-800 hover:text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
        >
          <Plus size={18} />
          加入訂單
        </button>
      </div>
    </div>
  );
};

export default DishCard;