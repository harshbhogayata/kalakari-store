import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const MiniCart: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { items, getTotalItems, getTotalPrice, removeItem } = useCart();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const cartItemsCount = getTotalItems();
    const totalPrice = getTotalPrice();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Cart Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-brand-ink hover:text-brand-clay transition-colors relative"
                aria-label="Open cart preview"
            >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-clay text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {cartItemsCount}
                    </span>
                )}
            </button>

            {/* Mini Cart Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-900">
                            Your Cart ({cartItemsCount})
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    {items.length === 0 ? (
                        <div className="p-6 text-center">
                            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Your cart is empty</p>
                            <Link
                                to="/products"
                                className="inline-block mt-3 text-brand-clay hover:underline text-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="max-h-64 overflow-y-auto">
                                {items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-gray-50">
                                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                            <ShoppingCart className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                Product
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity} × ₹{item.price}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.productId, item.variant)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <p className="text-center text-sm text-gray-500 py-2">
                                        +{items.length - 3} more items
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        to="/cart"
                                        className="block w-full text-center py-2 border border-brand-clay text-brand-clay rounded-md hover:bg-brand-clay hover:text-white transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View Cart
                                    </Link>
                                    <Link
                                        to="/checkout"
                                        className="block w-full text-center py-2 bg-brand-clay text-white rounded-md hover:bg-brand-clay-dark transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MiniCart;
