"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function OdaDetayPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    breakfast: false,
    reservationDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  useEffect(() => {
    if (room) {
      setFormData({
        status: room.status,
        breakfast: room.breakfast || false,
        reservationDate: room.reservationDate || "",
        notes: room.notes || "",
      });
    }
  }, [room]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      const data = await response.json();
      setRoom(data);
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
        setRoom(data);
      }
    } catch (error) {
      console.error("Oda güncellenemedi:", error);
    }
    setSaving(false);
  };

  const handleStatusChange = (newStatus) => {
    let updates = { status: newStatus };

    if (newStatus === "boş") {
      updates.reservationDate = "";
      updates.notes = "";
      updates.breakfast = false;
      setFormData({
        ...formData,
        status: newStatus,
        reservationDate: "",
        notes: "",
        breakfast: false,
      });
    } else if (newStatus === "rezerve") {
      updates.breakfast = false;
      setFormData({
        ...formData,
        status: newStatus,
        breakfast: false,
      });
    } else {
      updates.reservationDate = "";
      updates.notes = "";
      setFormData({
        ...formData,
        status: newStatus,
        reservationDate: "",
        notes: "",
      });
    }

    updateRoom(updates);
  };

  const handleBreakfastChange = (checked) => {
    const updates = { breakfast: checked };
    setFormData({ ...formData, breakfast: checked });
    updateRoom(updates);
  };

  const handleReservationDateChange = (date) => {
    const updates = { reservationDate: date };
    setFormData({ ...formData, reservationDate: date });
    updateRoom(updates);
  };

  const handleNotesChange = (notes) => {
    setFormData({ ...formData, notes });
  };

  const handleNotesBlur = () => {
    if (formData.notes !== room.notes) {
      updateRoom({ notes: formData.notes });
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6943b8]"></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-xl text-red-600 font-semibold">Oda bulunamadı</p>
          </div>
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
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
            Odalara Dön
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Oda {room.roomNumber}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      formData.status === "boş"
                        ? "bg-green-100 text-green-800"
                        : formData.status === "dolu"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {formData.status.charAt(0).toUpperCase() +
                      formData.status.slice(1)}
                  </span>
                  {formData.breakfast && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      Kahvaltılı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Oda Durumu
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleStatusChange("boş")}
                  disabled={saving}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.status === "boş"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                  } ${saving ? "opacity-50 cursor-wait" : ""}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        formData.status === "boş"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium ${
                        formData.status === "boş"
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      Boş
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusChange("dolu")}
                  disabled={saving}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.status === "dolu"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                  } ${saving ? "opacity-50 cursor-wait" : ""}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        formData.status === "dolu"
                          ? "bg-red-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium ${
                        formData.status === "dolu"
                          ? "text-red-700"
                          : "text-gray-600"
                      }`}
                    >
                      Dolu
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleStatusChange("rezerve")}
                  disabled={saving}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.status === "rezerve"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                  } ${saving ? "opacity-50 cursor-wait" : ""}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        formData.status === "rezerve"
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium ${
                        formData.status === "rezerve"
                          ? "text-yellow-700"
                          : "text-gray-600"
                      }`}
                    >
                      Rezerve
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {formData.status === "dolu" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Kahvaltı
                </h2>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.breakfast}
                    onChange={(e) => handleBreakfastChange(e.target.checked)}
                    disabled={saving}
                    className="w-5 h-5 text-[#6943b8] rounded focus:ring-[#6943b8] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Kahvaltı verildi olarak işaretle
                  </span>
                </label>
              </div>
            )}

            {formData.status === "rezerve" && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Rezervasyon Bilgileri
                </h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border-2 border-yellow-300">
                    <label className="block text-sm font-bold text-yellow-900 mb-2">
                      📅 Rezervasyon Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.reservationDate}
                      onChange={(e) =>
                        handleReservationDateChange(e.target.value)
                      }
                      disabled={saving}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors text-sm md:text-base bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      onBlur={handleNotesBlur}
                      disabled={saving}
                      rows="4"
                      placeholder="Rezervasyon ile ilgili notlar..."
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6943b8] focus:border-[#6943b8] resize-none transition-colors text-sm md:text-base"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {saving && (
              <div className="flex items-center justify-center gap-2 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-600 font-medium text-sm">
                  Kaydediliyor...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
