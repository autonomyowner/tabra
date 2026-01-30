import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { motion, AnimatePresence } from 'framer-motion'
import './BookingForm.css'

const translations = {
  ar: {
    title: 'حجز موعد',
    selectDoctor: 'اختر الطبيب',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    notes: 'ملاحظات (اختياري)',
    notesPlaceholder: 'أضف أي معلومات إضافية للطبيب...',
    book: 'تأكيد الحجز',
    booking: 'جاري الحجز...',
    success: 'تم حجز الموعد بنجاح!',
    error: 'حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.',
    noSlots: 'لا توجد مواعيد متاحة في هذا اليوم',
    loading: 'جاري التحميل...',
    closed: 'مغلق',
    available: 'متاح',
    booked: 'محجوز'
  },
  en: {
    title: 'Book Appointment',
    selectDoctor: 'Select Doctor',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    notes: 'Notes (optional)',
    notesPlaceholder: 'Add any additional information for the doctor...',
    book: 'Confirm Booking',
    booking: 'Booking...',
    success: 'Appointment booked successfully!',
    error: 'An error occurred while booking. Please try again.',
    noSlots: 'No available slots on this date',
    loading: 'Loading...',
    closed: 'Closed',
    available: 'Available',
    booked: 'Booked'
  }
}

export default function BookingForm({
  lang = 'ar',
  doctorId = null,
  specialty = null,
  onSuccess
}) {
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const t = translations[lang] || translations.ar
  const isRTL = lang === 'ar'

  // Fetch doctors (optionally filtered by specialty)
  const doctors = useQuery(api.doctors.queries.listDoctors, {
    specialty: specialty || undefined,
    limit: 50
  })

  // Fetch available slots when doctor and date are selected
  const slots = useQuery(
    api.appointments.queries.getAvailableSlots,
    selectedDoctor && selectedDate
      ? { doctorId: selectedDoctor, date: selectedDate }
      : "skip"
  )

  const bookAppointment = useMutation(api.appointments.mutations.bookAppointment)

  // Update selected doctor when doctorId prop changes
  useEffect(() => {
    if (doctorId) {
      setSelectedDoctor(doctorId)
    }
  }, [doctorId])

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      })
    }
    return dates
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await bookAppointment({
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        notes: notes || undefined
      })

      setSuccess(true)
      setSelectedTime('')
      setNotes('')

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.message || t.error)
    } finally {
      setLoading(false)
    }
  }

  const selectedDoctorData = doctors?.find(d => d._id === selectedDoctor)

  return (
    <div className={`booking-form ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className="booking-title">{t.title}</h2>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="success-check">&#10003;</div>
            <p>{t.success}</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Doctor Selection */}
            {!doctorId && (
              <div className="form-group">
                <label>{t.selectDoctor}</label>
                <select
                  value={selectedDoctor || ''}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value || null)
                    setSelectedDate('')
                    setSelectedTime('')
                  }}
                  required
                >
                  <option value="">{t.selectDoctor}</option>
                  {doctors?.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {isRTL ? doctor.name_ar : doctor.name_en} - {isRTL ? doctor.specialty_ar : doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show selected doctor info */}
            {selectedDoctorData && (
              <div className="selected-doctor-info">
                <h3>{isRTL ? selectedDoctorData.name_ar : selectedDoctorData.name_en}</h3>
                <p>{isRTL ? selectedDoctorData.specialty_ar : selectedDoctorData.specialty}</p>
                <p className="doctor-address">{selectedDoctorData.address}</p>
              </div>
            )}

            {/* Date Selection */}
            {selectedDoctor && (
              <div className="form-group">
                <label>{t.selectDate}</label>
                <div className="date-grid">
                  {getAvailableDates().map(date => (
                    <button
                      key={date.value}
                      type="button"
                      className={`date-btn ${selectedDate === date.value ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedDate(date.value)
                        setSelectedTime('')
                      }}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Selection */}
            {selectedDate && (
              <div className="form-group">
                <label>{t.selectTime}</label>
                {!slots ? (
                  <p className="loading-text">{t.loading}</p>
                ) : slots.slots.length === 0 ? (
                  <p className="no-slots">{t.noSlots}</p>
                ) : (
                  <div className="time-grid">
                    {slots.slots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-btn ${selectedTime === slot.time ? 'selected' : ''} ${!slot.isAvailable ? 'unavailable' : ''}`}
                        onClick={() => slot.isAvailable && setSelectedTime(slot.time)}
                        disabled={!slot.isAvailable}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {selectedTime && (
              <div className="form-group">
                <label>{t.notes}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-message">{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="submit-btn"
              disabled={!selectedDoctor || !selectedDate || !selectedTime || loading}
            >
              {loading ? t.booking : t.book}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
