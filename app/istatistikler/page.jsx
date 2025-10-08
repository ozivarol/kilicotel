"use client";

import { useState, useEffect } from "react";

export default function IstatistiklerPage() {
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [filter, customStart, customEnd]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      let url = "/api/stats";

      const dates = getFilterDates();
      if (dates.start && dates.end) {
        url += `?startDate=${dates.start}&endDate=${dates.end}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
      setLoading(false);
    }
  };

  const getFilterDates = () => {
    const now = new Date();
    let start, end;

    switch (filter) {
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case "month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        end = now;
        break;
      case "2months":
        start = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        end = now;
        break;
      case "custom":
        if (customStart && customEnd) {
          start = new Date(customStart);
          end = new Date(customEnd);
        }
        break;
      default:
        return {};
    }

    return start && end
      ? {
          start: start.toISOString(),
          end: end.toISOString(),
        }
      : {};
  };

  const getFilterLabel = () => {
    switch (filter) {
      case "all":
        return "Tüm Zamanlar";
      case "week":
        return "Son 1 Hafta";
      case "month":
        return "Son 1 Ay";
      case "2months":
        return "Son 2 Ay";
      case "custom":
        return "Özel Tarih Aralığı";
      default:
        return "";
    }
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

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            İstatistikler
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Oda satışları ve kahvaltı istatistikleri
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-white font-bold mb-3 text-sm md:text-base">
            📅 Tarih Filtresi
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === "all"
                  ? "bg-white text-[#6943b8] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter("week")}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === "week"
                  ? "bg-white text-[#6943b8] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              1 Hafta
            </button>
            <button
              onClick={() => setFilter("month")}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === "month"
                  ? "bg-white text-[#6943b8] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              1 Ay
            </button>
            <button
              onClick={() => setFilter("2months")}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === "2months"
                  ? "bg-white text-[#6943b8] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              2 Ay
            </button>
            <button
              onClick={() => setFilter("custom")}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === "custom"
                  ? "bg-white text-[#6943b8] shadow-md"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Özel
            </button>
          </div>

          {filter === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Başlangıç
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-white/30 bg-white/90 text-gray-900 font-medium focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2 text-sm">
                  Bitiş
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-white/30 bg-white/90 text-gray-900 font-medium focus:ring-2 focus:ring-white focus:border-white"
                />
              </div>
            </div>
          )}
        </div>

        {stats && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Dönem: <span className="text-[#6943b8]">{getFilterLabel()}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Satılan Oda</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.satilanOdaSayisi || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs opacity-75">Dolu duruma geçen oda sayısı</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Kahvaltı Sayısı</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.kahvaltiSayisi || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs opacity-75">Gelir kalemlerinde kahvaltı sayısı</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm opacity-90">Şu An Kahvaltılı</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.kahvaltiVerilen || 0}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs opacity-75">Aktif kahvaltılı oda sayısı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Boş Odalar</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.bosOdalar}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Dolu Odalar</p>
                    <p className="text-3xl font-bold text-red-600">
                      {stats.doluOdalar}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Rezerve</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.rezerveOdalar}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

