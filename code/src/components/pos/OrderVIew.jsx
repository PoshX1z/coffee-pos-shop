import React from "react";
import { PosGrid } from "./PosGrid";
import { Cart } from "./Cart";

export const OrderView = ({
  menu,
  categories,
  selectedCategory,
  searchQuery,
  cart,
  menuError,
  onSelectCategory,
  onSearchChange,
  onAddToCart,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
}) => {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] gap-6 items-start">
      <div className="min-w-0">
      <PosGrid
        menu={menu}
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        cart={cart}
        menuError={menuError}
        onSelectCategory={onSelectCategory}
        onSearchChange={onSearchChange}
        onAddToCart={onAddToCart}
      />
      </div>
      <Cart
        cart={cart}
        menu={menu}
        onUpdateQuantity={onUpdateQuantity}
        onClearCart={onClearCart}
        onCheckout={onCheckout}
      />
    </div>
  );
};
