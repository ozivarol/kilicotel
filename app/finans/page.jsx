"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FinansPage() {
  const [finances, setFinances] = useState({ incomes: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [incomeForm, setIncomeForm] = useState({
    description: "",
    amount: "",
    paymentType: "nakit",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
  });

  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    try {
      const response = await fetch("/api/finances");
      const data = await response.json();
      setFinances(data);
      setLoading(false);
    } catch (error) {
      console.error("Veriler yüklenemedi:", error);
      setLoading(false);
    }
  };

  const addIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.description || !incomeForm.amount) return;

    try {
      const response = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "income",
          description: incomeForm.description,
          amount: incomeForm.amount,
          paymentType: incomeForm.paymentType,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFinances(data);
        setIncomeForm({ description: "", amount: "", paymentType: "nakit" });
      }
    } catch (error) {
      console.error("Gelir eklenemedi:", error);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;

    try {
      const response = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense",
          description: expenseForm.description,
          amount: expenseForm.amount,
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFinances(data);
        setExpenseForm({ description: "", amount: "" });
      }
    } catch (error) {
      console.error("Gider eklenemedi:", error);
    }
  };

  const deleteItem = async (id, type) => {
    try {
      const response = await fetch(`/api/finances?id=${id}&type=${type}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setFinances(data);
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

      return {
        incomes: finances.incomes.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        }),
        expenses: finances.expenses.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        }),
      };
    }

    if (!startDate) {
      return finances;
    }

    return {
      incomes: finances.incomes.filter(
        (item) => new Date(item.date) >= startDate
      ),
      expenses: finances.expenses.filter(
        (item) => new Date(item.date) >= startDate
      ),
    };
  };

  const calculateStats = () => {
    const filtered = getFilteredData();
    const totalIncome = filtered.incomes.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalExpense = filtered.expenses.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const net = totalIncome - totalExpense;

    const paymentStats = {
      nakit: 0,
      kart: 0,
      internet: 0,
    };

    filtered.incomes.forEach((income) => {
      if (income.paymentType && paymentStats.hasOwnProperty(income.paymentType)) {
        paymentStats[income.paymentType] += income.amount;
      }
    });

    return { totalIncome, totalExpense, net, paymentStats };
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

  const stats = calculateStats();
  const filteredData = getFilteredData();

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Finans
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Gelir ve gider yönetimi
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
              { value: "custom", label: "Özel Tarih" },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <Link href="/finans/gelirler">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">
                    Toplam Gelir
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">
                    ₺{stats.totalIncome.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Detayları görüntüle →
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/finans/giderler">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 hover:shadow-md hover:border-red-300 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">
                    Toplam Gider
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">
                    ₺{stats.totalExpense.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Detayları görüntüle →
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-red-600"
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
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  Net Bakiye
                </p>
                <p
                  className={`text-xl md:text-2xl lg:text-3xl font-bold ${
                    stats.net >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                >
                  ₺{stats.net.toFixed(2)}
                </p>
              </div>
              <div
                className={`w-10 h-10 md:w-12 md:h-12 ${
                  stats.net >= 0 ? "bg-blue-100" : "bg-orange-100"
                } rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <svg
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    stats.net >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
            Ödeme Tipi Dağılımı
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-green-700">Nakit</p>
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-900">
                ₺{stats.paymentStats.nakit.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-blue-700">Kart</p>
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-900">
                ₺{stats.paymentStats.kart.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-purple-700">İnternet</p>
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-900">
                ₺{stats.paymentStats.internet.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Gelir Ekle
            </h2>
            <form onSubmit={addIncome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={incomeForm.description}
                  onChange={(e) =>
                    setIncomeForm({
                      ...incomeForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Oda geliri, ekstra hizmet..."
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={incomeForm.amount}
                  onChange={(e) =>
                    setIncomeForm({ ...incomeForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ödeme Tipi
                </label>
                <select
                  value={incomeForm.paymentType}
                  onChange={(e) =>
                    setIncomeForm({
                      ...incomeForm,
                      paymentType: e.target.value,
                    })
                  }
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] text-sm md:text-base"
                >
                  <option value="nakit">Nakit</option>
                  <option value="kart">Kart</option>
                  <option value="internet">İnternet</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-colors text-sm md:text-base"
              >
                Gelir Ekle
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Gider Ekle
            </h2>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Fatura, malzeme, personel..."
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] text-sm md:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] text-sm md:text-base"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 md:py-3 rounded-lg transition-colors mt-[76px] text-sm md:text-base"
              >
                Gider Ekle
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Gelirler ({filteredData.incomes.length})
            </h2>
            <div className="space-y-3 max-h-[400px] md:max-h-96 overflow-y-auto">
              {filteredData.incomes.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                  Henüz gelir kaydı yok
                </p>
              ) : (
                filteredData.incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                        {income.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {new Date(income.date).toLocaleDateString("tr-TR")}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            income.paymentType === "nakit"
                              ? "bg-green-100 text-green-700"
                              : income.paymentType === "kart"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {income.paymentType.charAt(0).toUpperCase() +
                            income.paymentType.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <p className="text-base md:text-lg font-bold text-green-600">
                        ₺{income.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => deleteItem(income.id, "income")}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
              Giderler ({filteredData.expenses.length})
            </h2>
            <div className="space-y-3 max-h-[400px] md:max-h-96 overflow-y-auto">
              {filteredData.expenses.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">
                  Henüz gider kaydı yok
                </p>
              ) : (
                filteredData.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(expense.date).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                      <p className="text-base md:text-lg font-bold text-red-600">
                        ₺{expense.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => deleteItem(expense.id, "expense")}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-4 h-4 md:w-5 md:h-5"
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
    </div>
  );
}
