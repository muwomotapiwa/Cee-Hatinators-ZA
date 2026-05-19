import { Link } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../lib/mockData';

export function CategoriesPage() {
  return (
    <div className="bg-offwhite min-h-screen py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-16">
          <h1 className="serif text-[clamp(36px,5vw,64px)] font-light text-dark leading-[1.1]">
            Shop by <em className="italic text-crimson">Category</em>
          </h1>
          <div className="w-12 h-px bg-crimson mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {MOCK_CATEGORIES.map((cat) => (
            <Link 
              to={`/shop?category=${cat.name}`} 
              key={cat.id}
              className="relative aspect-square overflow-hidden group block"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-75 group-hover:brightness-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-[10px] tracking-[3px] uppercase text-gold mb-2 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 delay-75">
                  {cat.label}
                </span>
                <h3 className="serif text-3xl sm:text-4xl text-white font-light">
                  {cat.name}
                </h3>
                <span className="mt-4 px-6 py-2 border border-white text-white text-[10px] tracking-[2px] uppercase opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 delay-150 hover:bg-white hover:text-dark">
                  View {cat.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
