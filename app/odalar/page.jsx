"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function OdalarPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data);
      setLoading(false);
    } catch (error) {
      console.error("Odalar yüklenemedi:", error);
      setLoading(false);
    }
  };

  const getStats = () => {
    const bos = rooms.filter((r) => r.status === "boş").length;
    const dolu = rooms.filter((r) => r.status === "dolu").length;
    const kahvalti = rooms.reduce((sum, r) => sum + (r.breakfastCount || 0), 0);
    return { bos, dolu, kahvalti };
  };

  const getBreakfastDetails = () => {
    return rooms
      .filter((r) => r.status === "dolu" && r.breakfastCount > 0)
      .map((r) => ({
        roomNumber: r.roomNumber,
        count: r.breakfastCount,
      }));
  };

  const copyBreakfastList = () => {
    const details = getBreakfastDetails();
    if (details.length === 0) return;

    const text = details
      .map((item) => `Oda ${item.roomNumber}: ${item.count} kişi`)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6943b8]"></div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const breakfastDetails = getBreakfastDetails();

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Odalar
          </h1>
          <p className="text-gray-600">Toplam {rooms.length} oda yönetimi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Boş Odalar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.bos}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dolu Odalar</p>
                <p className="text-3xl font-bold text-gray-900">{stats.dolu}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Kahvaltı</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.kahvalti}
                </p>
                <p className="text-xs text-gray-500 mt-1">kişi</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Boş</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Dolu</span>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11 gap-3">
            {rooms.map((room) => {
              const statusColor = room.status === "boş" ? "green" : "red";
              return (
                <Link
                  key={room.id}
                  href={`/odalar/${room.id}`}
                  className="group"
                >
                  <div
                    className={`bg-white border-2 ${
                      room.status === "boş"
                        ? "border-green-500"
                        : room.status === "dolu"
                        ? "border-red-500"
                        : "border-yellow-500"
                    } rounded-lg p-3 hover:shadow-lg transition-all duration-200 hover:scale-105 relative`}
                  >
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {room.roomNumber}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          room.status === "boş"
                            ? "text-green-600"
                            : room.status === "dolu"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {room.status.toUpperCase()}
                      </p>
                      {room.breakfastCount > 0 && (
                        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {room.breakfastCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {breakfastDetails.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Bugünkü Kahvaltı Listesi
              </h3>
              <button
                onClick={copyBreakfastList}
                className="flex items-center gap-2 px-4 py-2 bg-[#6943b8] hover:bg-[#5a38a0] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {copySuccess ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Kopyalandı!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Kopyala
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {breakfastDetails.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3"
                >
                  <p className="text-xs text-orange-700 font-semibold mb-1">
                    Oda {item.roomNumber}
                  </p>
                  <p className="text-2xl font-bold text-orange-900">
                    {item.count} <span className="text-sm">kişi</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <p className="text-sm text-orange-900 font-semibold">
                Toplam Kahvaltı: {stats.kahvalti} kişi
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
