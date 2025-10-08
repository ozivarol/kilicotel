"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GiderlerPage() {
  const [finances, setFinances] = useState({ expenses: [] });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const response = await fetch("/api/finances");
      const data = await response.json();
      setFinances({ expenses: data.expenses });
      setLoading(false);
    } catch (error) {
      console.error("Veriler yüklenemedi:", error);
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`/api/finances?id=${id}&type=expense`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFinances();
      }
    } catch (error) {
      console.error("Kayıt silinemedi:", error);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    let startDate = null;

    if (dateFilter === "1week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "1month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "2months") {
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "custom" && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59);

      return finances.expenses.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (!startDate) {
      return finances.expenses;
    }

    return finances.expenses.filter((item) => new Date(item.date) >= startDate);
  };

  const calculateTotal = () => {
    const filtered = getFilteredData();
    return filtered.reduce((sum, item) => sum + item.amount, 0);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6943b8]"></div>
        </div>
      </div>
    );
  }

  const filteredExpenses = getFilteredData();
  const total = calculateTotal();

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            href="/finans"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm md:text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Finansa Dön
          </Link>
        </div>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Giderler
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Tüm gider kayıtları
          </p>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Tarih Filtresi
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tümü" },
              { value: "1week", label: "Son 1 Hafta" },
              { value: "1month", label: "Son 1 Ay" },
              { value: "2months", label: "Son 2 Ay" },
              { value: "custom", label: "Tarih Aralığı Seç" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  dateFilter === filter.value
                    ? "bg-[#6943b8] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {dateFilter === "custom" && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-2">
                    📅 Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-2">
                    📅 Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Gider</p>
              <p className="text-3xl md:text-4xl font-bold text-red-600">
                ₺{total.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredExpenses.length} kayıt
              </p>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Gider Listesi
          </h2>
          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">
                  Seçilen tarih aralığında gider kaydı bulunamadı
                </p>
              </div>
            ) : (
              filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                      {expense.description}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
                      {new Date(expense.date).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-lg md:text-xl font-bold text-red-600">
                      ₺{expense.amount.toFixed(2)}
                    </p>
                    <button
                      onClick={() => deleteItem(expense.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
