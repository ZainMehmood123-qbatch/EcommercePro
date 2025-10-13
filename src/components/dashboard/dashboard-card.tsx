'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Card, Button } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';

import { addToCart } from '@/lib/cart';
import type { CartItem } from '@/types/cart';
import type { ProductType, ProductVariant } from '@/types/product';

interface DashboardCardProps {
  product: ProductType;
}

export default function DashboardCard({ product }: DashboardCardProps) {
  const { id, title, variants } = product;
  console.log(id);
  const { data: session } = useSession();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  useEffect(() => {
    if (variants.length > 0 && !selectedColor) {
      const firstVariant = variants[0];
      setSelectedColor(firstVariant.colorName);
      setSelectedSize(firstVariant.size);
    }
  }, [variants, selectedColor]);
  const availableColors = Array.from(
    new Map(variants.map(v => [v.colorName, v])).values()
  );
  const availableSizes = selectedColor
    ? variants.filter(v => v.colorName === selectedColor)
    : [];
  const selectedVariant: ProductVariant | undefined = variants.find(
    v => v.colorName === selectedColor && v.size === selectedSize
  );

  const stock = selectedVariant?.stock ?? 0;
  const price = selectedVariant?.price ?? 0;
  const displayImage = hoveredColor 
    ? availableColors.find(c => c.colorName === hoveredColor)?.image
    : selectedColor
    ? availableColors.find(c => c.colorName === selectedColor)?.image
    : variants[0]?.image ?? '/placeholder.png';

  const increase = () => {
    if (quantity < stock) setQuantity(q => q + 1);
  };
  const decrease = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!session?.user?.id) {
      toast.error('Please login first.');
      return;
    }

    if (!selectedVariant) {
      toast.error('Please select a color and size first.');
      return;
    }

    const item: CartItem = {
      key: Date.now(),
      id: product.id,
      variantId: selectedVariant.id,
      product: title,
      image: selectedVariant.image,
      colorName: selectedVariant.colorName,
      colorCode: selectedVariant.colorCode,
      size: selectedVariant.size,
      qty: quantity,
      price: selectedVariant.price,
      stock: selectedVariant.stock
    };

    addToCart(session.user.id, item);
    toast.success('Added to cart');
  };

  return (
    <Card
      hoverable
      className="w-full h-auto rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
      cover={
        <div className="relative bg-gradient-to-br from-gray-50 to-white flex justify-center items-center p-4 overflow-hidden">
          <Image
            src={displayImage}
            alt={title}
            width={260}
            height={220}
            className="w-full h-[220px] object-contain transform group-hover:scale-110 transition-all duration-500 ease-out"
          />
          {stock > 0 && stock < 1000 && selectedVariant && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
              Only {stock} left!
            </div>
          )}
          {selectedColor && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-gray-200">
              {hoveredColor || selectedColor}
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <h2 className="text-gray-800 text-base font-semibold leading-snug line-clamp-2 group-hover:text-[#007BFF] transition-colors duration-200">
          {title}
        </h2>

        <div className="flex items-baseline gap-2">
          <span className="text-gray-500 text-xs font-medium">Price:</span>
          <span className="text-[#007BFF] font-bold text-2xl leading-tight">
            ${price.toFixed(2)}
          </span>
        </div>


        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Select Color {selectedColor && <span className="text-[#007BFF]">✓</span>}
          </label>
          <div className="flex gap-2.5 flex-wrap">
            {availableColors.map(color => (
              <button
                key={color.colorName}
                onClick={() => {
                  setSelectedColor(color.colorName);

                  const firstSizeForColor = variants.find(v => v.colorName === color.colorName);
                  if (firstSizeForColor) {
                    setSelectedSize(firstSizeForColor.size);
                  }
                  setQuantity(1);
                }}
                onMouseEnter={() => setHoveredColor(color.colorName)}
                onMouseLeave={() => setHoveredColor(null)}
                className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                  selectedColor === color.colorName
                    ? 'border-[#007BFF] scale-110 shadow-lg ring ring-[#007BFF] ring-offset-2'
                    : hoveredColor === color.colorName
                    ? 'border-[#007BFF] scale-105 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:scale-105 shadow-sm'
                }`}
                title={color.colorName}
              >
                <Image
                  src={color.image}
                  alt={color.colorName}
                  fill
                  className="object-cover rounded-full"
                />
                {selectedColor === color.colorName && (
                  <div className="absolute inset-0 bg-[#007BFF]/20 flex items-center justify-center">
                    <span className="text-white text-xl font-bold drop-shadow-lg">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>


        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Select Size {selectedSize && <span className="text-[#007BFF]">✓</span>}
          </label>
          <div className="flex gap-2 flex-wrap">
            {availableSizes.map(sizeVariant => (
              <button
                key={sizeVariant.size}
                onClick={() => {
                  setSelectedSize(sizeVariant.size);
                  setQuantity(1);
                }}
                disabled={sizeVariant.stock === 0}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-300 ${
                  selectedSize === sizeVariant.size
                    ? 'bg-[#007BFF] text-white border-[#007BFF] scale-105 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#007BFF] hover:text-[#007BFF] hover:scale-105'
                } ${sizeVariant.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : 'shadow-sm hover:shadow-md'}`}
              >
                {sizeVariant.size}
              </button>
            ))}
          </div>
        </div>


        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">

          <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-1 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <Button
              icon={<MinusOutlined />}
              onClick={decrease}
              disabled={quantity <= 1}
              className="border-none shadow-none h-9 w-9 text-gray-700 hover:text-[#007BFF] bg-transparent hover:bg-white hover:scale-110 rounded-md transition-all duration-200 disabled:opacity-40"
            />
            <span className="px-5 py-1 font-bold text-lg text-gray-800 min-w-[50px] text-center">
              {quantity}
            </span>
            <Button
              icon={<PlusOutlined />}
              onClick={increase}
              disabled={quantity >= stock}
              className="border-none shadow-none h-9 w-9 text-gray-700 hover:text-[#007BFF] bg-transparent hover:bg-white hover:scale-110 rounded-md transition-all duration-200 disabled:opacity-40"
            />
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ShoppingCartOutlined className="text-base" />}
            onClick={handleAddToCart}
            disabled={!selectedVariant || stock === 0}
            className="!font-inter !text-sm !font-semibold !flex !justify-center !items-center !gap-2 !px-6 !py-2 !rounded-lg !bg-gradient-to-r !from-[#007BFF] !to-[#0056b3] hover:!from-[#0056b3] hover:!to-[#003d82] !border-none !shadow-md hover:!shadow-xl hover:!scale-105 !transition-all !duration-300 disabled:!bg-gray-300 disabled:!cursor-not-allowed disabled:!scale-100 flex-1 sm:flex-none"
          >
            {!selectedVariant
              ? 'Select Variant'
              : stock === 0
              ? 'Out of Stock'
              : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </Card>
  );
}