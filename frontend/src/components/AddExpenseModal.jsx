import React, { useState, useEffect, useRef } from 'react';

export default function AddExpenseModal({ isOpen, onClose, onSubmit, activeCategories = [] }) {
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement;
      document.body.classList.add('scroll-lock');
    } else {
      document.body.classList.remove('scroll-lock');
    }
    return () => {
      document.body.classList.remove('scroll-lock');
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    document.addEventListener('keydown', handleEscape);

    // Focus first input after animation
    requestAnimationFrame(() => {
      const firstInput = modalRef.current?.querySelector('input, select, button');
      firstInput?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
      document.removeEventListener('keydown', handleEscape);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Dodaj wydatek"
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md mx-4 p-6 bg-white rounded-xl shadow-2xl pointer-events-auto dark:bg-slate-800 dark:border dark:border-slate-700 transition-all duration-300 ${
          isOpen ? 'animate-slide-up' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-slate-300"
          onClick={onClose}
          aria-label="Zamknij"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">
          Dodaj wydatek
        </h2>

        <Form
          isOpen={isOpen}
          categories={activeCategories}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

function Form({ isOpen, categories, onClose, onSubmit }) {
  const [type, setType] = useState('wydatek');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('');

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setType('wydatek');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setCategoryId('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!categoryId) newErrors.categoryId = 'Wybierz kategorię';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Podaj prawidłową kwotę';
    if (!date) newErrors.date = 'Podaj datę';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      description: description.trim() || null,
      date,
      categoryId: Number(categoryId),
    });
    onClose();
  };

  const handleCancel = () => {
    setType('wydatek');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Typ */}
      <div>
        <label htmlFor="typ" className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300">
          Typ
        </label>
        <select
          id="typ"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#32a852]/20 focus:border-[#32a852] dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all"
        >
          <option value="wydatek">Wydatek</option>
          <option value="Przychod">Przychód</option>
        </select>
      </div>

      {/* Kwota */}
      <div>
        <label htmlFor="kwota" className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300">
          Kwota
        </label>
        <div className="relative">
          <input
            type="number"
            id="kwota"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
            }}
            placeholder="np. 50.00"
            step="0.01"
            min="0"
            className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all dark:bg-slate-700 dark:text-white ${
              errors.amount
                ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                : 'border-gray-300 focus:ring-[#32a852]/20 focus:border-[#32a852] dark:border-slate-600'
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-slate-500">PLN</span>
        </div>
        {errors.amount && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {errors.amount}
          </p>
        )}
      </div>

      {/* Opis */}
      <div>
        <label htmlFor="opis" className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300">
          Opis
        </label>
        <input
          type="text"
          id="opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Krótki opis transakcji"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#32a852]/20 focus:border-[#32a852] dark:bg-slate-700 dark:border-slate-600 dark:text-white transition-all"
        />
      </div>

      {/* Data */}
      <div>
        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300">
          Data
        </label>
        <input
          type="date"
          id="data"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (errors.date) setErrors(prev => ({ ...prev, date: '' }));
          }}
          className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all dark:bg-slate-700 dark:text-white ${
            errors.date
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-300 focus:ring-[#32a852]/20 focus:border-[#32a852] dark:border-slate-600'
          }`}
        />
        {errors.date && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {errors.date}
          </p>
        )}
      </div>

      {/* Kategoria */}
      <div>
        <label htmlFor="kategoria" className="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300">
          Kategoria
        </label>
        <select
          id="kategoria"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: '' }));
          }}
          className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all dark:bg-slate-700 dark:text-white ${
            errors.categoryId
              ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-300 focus:ring-[#32a852]/20 focus:border-[#32a852] dark:border-slate-600'
          }`}
        >
          <option value="">-- Wybierz kategorię --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {errors.categoryId}
          </p>
        )}
      </div>

      {/* buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm bg-gray-200 hover:bg-gray-300 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
          Anuluj
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-[#32a852] hover:bg-[#1f8c42] transition-colors">
          Dodaj
        </button>
      </div>
    </form>
  );
}
