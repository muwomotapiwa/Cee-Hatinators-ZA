import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../lib/mockData';
import { useProductModal } from '../context/ProductModalContext';

export function CategoryGrid() {
  const { openProductModal } = useProductModal();

  const handleCategoryClick = (categoryName: string) => {
    const product = MOCK_PRODUCTS.find(p => p.category.toLowerCase().includes(categoryName.toLowerCase().split(' ')[0]));
    if (product) openProductModal(product);
  };

  return (
    <section id="categories" className="py-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-10 sm:mb-12">
          <span className="text-[9px] sm:text-[10px] tracking-[2px] sm:tracking-[3px] uppercase text-crimson mb-2 sm:mb-3 block">Browse by Category</span>
          <h2 className="serif text-[clamp(28px,4vw,52px)] font-light text-dark leading-[1.1]">
            Find Your <em className="italic text-crimson">Perfect</em> Piece
          </h2>
          <div className="w-10 sm:w-12 h-px bg-crimson mx-auto mt-4 sm:mt-5"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 sm:gap-1">
          {MOCK_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`relative overflow-hidden group cursor-pointer aspect-[3/4] ${cat.featured ? 'col-span-2 row-span-1 sm:row-span-2 aspect-auto' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105 brightness-80 group-hover:brightness-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-crimson-dark/80 via-transparent to-transparent flex flex-col justify-end p-6 transition-all duration-300 group-hover:from-crimson/85 group-hover:to-crimson/20">
                <span className="text-[10px] tracking-[3px] uppercase text-gold mb-1.5">{cat.label}</span>
                <h3 className={`serif font-normal text-white leading-[1.2] ${cat.featured ? 'text-4xl' : 'text-2xl'}`}>
                  {cat.name}
                </h3>
                <span className="text-[10px] tracking-[1.5px] text-silver mt-1 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {cat.count} -&gt;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
