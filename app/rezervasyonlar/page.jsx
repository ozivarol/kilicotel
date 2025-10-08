"use client";

import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";

export default function RezervasyonlarPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const getRoomsForDate = () => {
    return rooms.filter((room) => {
      if (room.status === "rezerve" && room.reservationDate) {
        const reservationDate = new Date(room.reservationDate);
        return (
          reservationDate.getFullYear() === selectedDate.getFullYear() &&
          reservationDate.getMonth() === selectedDate.getMonth() &&
          reservationDate.getDate() === selectedDate.getDate()
        );
      }
      return false;
    });
  };

  const getStats = () => {
    const bos = rooms.filter((r) => r.status === "boş").length;
    const dolu = rooms.filter((r) => r.status === "dolu").length;
    const rezerve = rooms.filter((r) => r.status === "rezerve").length;
    return { bos, dolu, rezerve };
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

  const reservedRoomsForDate = getRoomsForDate();
  const stats = getStats();

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Rezervasyon Takvimi
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Günlere tıklayarak rezervasyonları görüntüleyin
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Boş Odalar</p>
                <p className="text-2xl font-bold text-green-600">{stats.bos}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Dolu Odalar</p>
                <p className="text-2xl font-bold text-red-600">{stats.dolu}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-red-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Rezerve</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.rezerve}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 bg-yellow-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar onDateSelect={setSelectedDate} selectedDate={selectedDate} rooms={rooms} />
            
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Gösterge:</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Dolu Oda Var</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Rezerve Oda Var</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <div className="space-y-3">
                {reservedRoomsForDate.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      Bu tarihte rezervasyon yok
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-3">
                      {reservedRoomsForDate.length} rezerve oda
                    </p>
                    {reservedRoomsForDate.map((room) => (
                      <div
                        key={room.id}
                        className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-3 hover:border-yellow-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            Oda {room.roomNumber}
                          </span>
                          <span className="text-xs px-2 py-1 bg-yellow-500 text-white rounded">
                            Rezerve
                          </span>
                        </div>
                        {room.notes && (
                          <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded">
                            {room.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 text-sm mb-2">
                💡 İpucu
              </h3>
              <p className="text-xs text-blue-800">
                Takvimde bir güne tıklayarak o günün rezervasyonlarını görebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

