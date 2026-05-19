import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';
import { ProductDetailModal } from '../components/ProductDetailModal';

interface ProductModalContextType {
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const openProductModal = (product: Product) => setSelectedProduct(product);
  const closeProductModal = () => setSelectedProduct(null);

  return (
    <ProductModalContext.Provider value={{ openProductModal, closeProductModal }}>
      {children}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={closeProductModal}
      />
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const context = useContext(ProductModalContext);
  if (!context) throw new Error('useProductModal must be used within a ProductModalProvider');
  return context;
}
