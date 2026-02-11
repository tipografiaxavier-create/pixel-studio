
import React from 'react';
import { PixelImage } from '../types';

interface Props {
  images: PixelImage[];
  onSelect: (image: PixelImage) => void;
}

const Gallery: React.FC<Props> = ({ images, onSelect }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-20">
        <div className="w-16 h-16 border-2 border-dashed border-white rounded-xl mb-4"></div>
        <p className="text-sm">Your creations will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((img) => (
        <div 
          key={img.id} 
          onClick={() => onSelect(img)}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 aspect-square"
        >
          <img 
            src={img.url} 
            alt={img.prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
            <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
            <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{img.aspectRatio} • {img.style}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
