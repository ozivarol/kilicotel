"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function OdalarPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const kahvalti = rooms.filter((r) => r.breakfast === true).length;
    return { bos, dolu, kahvalti };
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
                <p className="text-sm text-gray-600 mb-1">Kahvaltılı</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.kahvalti}
                </p>
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
                      {room.breakfast && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {room.status === "rezerve" && room.reservationDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(room.reservationDate).toLocaleDateString(
                            "tr-TR",
                            { day: "2-digit", month: "2-digit" }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
