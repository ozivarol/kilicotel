"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function OdaDetayPage() {
  const params = useParams();
  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReservation, setNewReservation] = useState({
    date: "",
    notes: "",
  });

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      const data = await response.json();
      setRoom(data);
      setReservations(data.reservations || []);
      setLoading(false);
    } catch (error) {
      console.error("Oda yüklenemedi:", error);
      setLoading(false);
    }
  };

  const updateRoom = async (updates) => {
    setSaving(true);
    try {
      const updatedRoom = { ...room, ...updates };
      const response = await fetch("/api/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRoom),
      });

      if (response.ok) {
        const data = await response.json();
        setRoom({ ...data, reservations: reservations });
      }
    } catch (error) {
      console.error("Oda güncellenemedi:", error);
    }
    setSaving(false);
  };

  const handleStatusChange = (newStatus) => {
    let updates = { status: newStatus };

    if (newStatus === "boş") {
      updates.breakfastCount = 0;
    }

    updateRoom(updates);
  };

  const handleBreakfastChange = (count) => {
    if (room.status === "dolu") {
      const validCount = Math.max(0, parseInt(count) || 0);
      updateRoom({ breakfastCount: validCount });
    }
  };

  const addReservation = async (e) => {
    e.preventDefault();
    if (!newReservation.date) return;

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: room.id,
          roomNumber: room.roomNumber,
          reservationDate: newReservation.date,
          notes: newReservation.notes,
        }),
      });

      if (response.ok) {
        setNewReservation({ date: "", notes: "" });
        fetchRoom();
      }
    } catch (error) {
      console.error("Rezervasyon eklenemedi:", error);
    }
  };

  const deleteReservation = async (reservationId) => {
    try {
      const response = await fetch(`/api/reservations?id=${reservationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRoom();
      }
    } catch (error) {
      console.error("Rezervasyon silinemedi:", error);
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

  if (!room) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Oda bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/odalar"
            className="inline-flex items-center text-[#6943b8] hover:text-[#3c43b5] font-medium mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Odalara Dön
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Oda {room.roomNumber}
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Oda Durumu</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleStatusChange("boş")}
              className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                room.status === "boş"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded"></div>
              Boş
            </button>

            <button
              onClick={() => handleStatusChange("dolu")}
              className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                room.status === "dolu"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-red-300"
              }`}
            >
              <div className="w-8 h-8 mx-auto mb-2 bg-red-500 rounded"></div>
              Dolu
            </button>
          </div>

          {room.status === "dolu" && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block mb-2 font-semibold text-gray-700">
                Kahvaltı Kişi Sayısı
              </label>
              <input
                type="number"
                min="0"
                value={room.breakfastCount || 0}
                onChange={(e) => handleBreakfastChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8]"
                placeholder="Kaç kişiye kahvaltı verildi?"
              />
            </div>
          )}

          {saving && (
            <div className="mt-4 text-sm text-gray-600">Kaydediliyor...</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rezervasyonlar</h2>

          <form onSubmit={addReservation} className="mb-6 pb-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={newReservation.date}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notlar
                </label>
                <input
                  type="text"
                  value={newReservation.notes}
                  onChange={(e) =>
                    setNewReservation({ ...newReservation, notes: e.target.value })
                  }
                  placeholder="Opsiyonel"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-[#6943b8] hover:bg-[#3c43b5] text-white font-semibold rounded-lg transition-colors"
            >
              Rezervasyon Ekle
            </button>
          </form>

          <div className="space-y-3">
            {reservations.length === 0 ? (
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
                <p className="text-gray-500">Rezervasyon yok</p>
              </div>
            ) : (
              reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(reservation.reservation_date).toLocaleDateString(
                        "tr-TR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                    {reservation.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {reservation.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteReservation(reservation.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
