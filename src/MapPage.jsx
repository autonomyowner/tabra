import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'pk.eyJ1IjoiYXplZGRpbmV6ZWxsYWciLCJhIjoiY21sMDJ2cWN6MDF2eTNmczZjM3RrNGgzOCJ9.nj7bNijXa1rMWKui0LbpqA'

// Translations for the map page
const mapTranslations = {
  ar: {
    title: 'خريطة الأطباء والعيادات',
    backHome: 'الرئيسية',
    searchPlaceholder: 'ابحث عن طبيب أو عيادة...',
    addNew: 'إضافة موقع جديد',
    filters: {
      all: 'الكل',
      doctors: 'الأطباء',
      clinics: 'العيادات'
    },
    form: {
      title: 'إضافة موقع جديد',
      type: 'النوع',
      doctor: 'طبيب',
      clinic: 'عيادة',
      name: 'الاسم',
      namePlaceholder: 'اسم الطبيب أو العيادة',
      specialty: 'التخصص',
      specialtyPlaceholder: 'مثال: طب عام، أسنان...',
      address: 'العنوان',
      addressPlaceholder: 'العنوان الكامل',
      phone: 'الهاتف',
      phonePlaceholder: '0555 00 00 00',
      hours: 'ساعات العمل',
      hoursPlaceholder: '08:00 - 17:00',
      clickMap: 'انقر على الخريطة لتحديد الموقع',
      selectedLocation: 'الموقع المحدد',
      submit: 'إضافة',
      cancel: 'إلغاء'
    },
    popup: {
      specialty: 'التخصص',
      address: 'العنوان',
      phone: 'الهاتف',
      hours: 'ساعات العمل',
      getDirections: 'الاتجاهات',
      book: 'حجز موعد'
    },
    stats: {
      total: 'إجمالي المواقع',
      doctors: 'طبيب',
      clinics: 'عيادة'
    }
  },
  en: {
    title: 'Doctors & Clinics Map',
    backHome: 'Home',
    searchPlaceholder: 'Search for a doctor or clinic...',
    addNew: 'Add New Location',
    filters: {
      all: 'All',
      doctors: 'Doctors',
      clinics: 'Clinics'
    },
    form: {
      title: 'Add New Location',
      type: 'Type',
      doctor: 'Doctor',
      clinic: 'Clinic',
      name: 'Name',
      namePlaceholder: 'Doctor or clinic name',
      specialty: 'Specialty',
      specialtyPlaceholder: 'e.g. General, Dentist...',
      address: 'Address',
      addressPlaceholder: 'Full address',
      phone: 'Phone',
      phonePlaceholder: '0555 00 00 00',
      hours: 'Working Hours',
      hoursPlaceholder: '08:00 - 17:00',
      clickMap: 'Click on the map to select location',
      selectedLocation: 'Selected location',
      submit: 'Add',
      cancel: 'Cancel'
    },
    popup: {
      specialty: 'Specialty',
      address: 'Address',
      phone: 'Phone',
      hours: 'Hours',
      getDirections: 'Directions',
      book: 'Book Appointment'
    },
    stats: {
      total: 'Total Locations',
      doctors: 'Doctors',
      clinics: 'Clinics'
    }
  }
}

// Sample data for doctors and clinics in Algeria
const initialLocations = [
  {
    id: 1,
    type: 'doctor',
    name: 'Dr. Ahmed Benali',
    nameAr: 'د. أحمد بن علي',
    specialty: 'General Medicine',
    specialtyAr: 'طب عام',
    address: 'Rue Didouche Mourad, Algiers',
    addressAr: 'شارع ديدوش مراد، الجزائر',
    phone: '0555 12 34 56',
    hours: '08:00 - 16:00',
    coordinates: [3.0588, 36.7538]
  },
  {
    id: 2,
    type: 'clinic',
    name: 'Clinique El Azhar',
    nameAr: 'عيادة الأزهر',
    specialty: 'Multi-specialty',
    specialtyAr: 'متعدد التخصصات',
    address: 'Boulevard Mohamed V, Oran',
    addressAr: 'شارع محمد الخامس، وهران',
    phone: '0550 98 76 54',
    hours: '24/7',
    coordinates: [-0.6349, 35.6969]
  },
  {
    id: 3,
    type: 'doctor',
    name: 'Dr. Fatima Zahra',
    nameAr: 'د. فاطمة الزهراء',
    specialty: 'Pediatrics',
    specialtyAr: 'طب الأطفال',
    address: 'Avenue de l\'ALN, Constantine',
    addressAr: 'شارع جيش التحرير، قسنطينة',
    phone: '0560 11 22 33',
    hours: '09:00 - 17:00',
    coordinates: [6.6147, 36.3650]
  },
  {
    id: 4,
    type: 'clinic',
    name: 'Centre Médical Annaba',
    nameAr: 'المركز الطبي عنابة',
    specialty: 'Cardiology',
    specialtyAr: 'أمراض القلب',
    address: 'Rue de la Santé, Annaba',
    addressAr: 'شارع الصحة، عنابة',
    phone: '0555 44 55 66',
    hours: '08:00 - 20:00',
    coordinates: [7.7667, 36.9000]
  },
  {
    id: 5,
    type: 'doctor',
    name: 'Dr. Karim Meziane',
    nameAr: 'د. كريم مزيان',
    specialty: 'Dentistry',
    specialtyAr: 'طب الأسنان',
    address: 'Place des Martyrs, Blida',
    addressAr: 'ساحة الشهداء، البليدة',
    phone: '0570 77 88 99',
    hours: '10:00 - 18:00',
    coordinates: [2.8283, 36.4700]
  }
]

function MapPage() {
  const [lang, setLang] = useState('ar')
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('tabra-locations')
    return saved ? JSON.parse(saved) : initialLocations
  })
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newLocation, setNewLocation] = useState({
    type: 'doctor',
    name: '',
    nameAr: '',
    specialty: '',
    specialtyAr: '',
    address: '',
    addressAr: '',
    phone: '',
    hours: '',
    coordinates: null
  })

  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)

  const t = mapTranslations[lang]
  const isRTL = lang === 'ar'

  // Save locations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tabra-locations', JSON.stringify(locations))
  }, [locations])

  // Initialize map
  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [3.0588, 36.7538], // Center on Algiers
      zoom: 5.5
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }))

    return () => {
      map.current?.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [])

  // Update map click handler when showAddForm changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const handleClick = (e) => {
      if (showAddForm) {
        setNewLocation(prev => ({
          ...prev,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        }))
      }
    }

    map.current.on('click', handleClick)

    return () => {
      map.current?.off('click', handleClick)
    }
  }, [showAddForm, mapLoaded])

  // Update markers when locations or filter changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Filter locations
    let filteredLocations = locations.filter(loc => {
      if (filter === 'doctors') return loc.type === 'doctor'
      if (filter === 'clinics') return loc.type === 'clinic'
      return true
    })

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredLocations = filteredLocations.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        loc.nameAr.includes(query) ||
        loc.specialty.toLowerCase().includes(query) ||
        loc.specialtyAr.includes(query) ||
        loc.address.toLowerCase().includes(query) ||
        loc.addressAr.includes(query)
      )
    }

    // Add markers
    filteredLocations.forEach(location => {
      const el = document.createElement('div')
      el.className = `map-marker ${location.type}`
      el.innerHTML = `<div class="marker-dot"></div>`

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .addTo(map.current)

      el.addEventListener('click', () => {
        setSelectedLocation(location)
        map.current.flyTo({
          center: location.coordinates,
          zoom: 14
        })
      })

      markers.current.push(marker)
    })
  }, [locations, filter, searchQuery, mapLoaded])

  // Show temporary marker for new location
  useEffect(() => {
    if (!map.current || !mapLoaded || !newLocation.coordinates) return

    const el = document.createElement('div')
    el.className = 'map-marker new-marker'
    el.innerHTML = '<div class="marker-dot"></div>'

    const tempMarker = new mapboxgl.Marker(el)
      .setLngLat(newLocation.coordinates)
      .addTo(map.current)

    return () => tempMarker.remove()
  }, [newLocation.coordinates, mapLoaded])

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar')
  }

  const handleAddLocation = (e) => {
    e.preventDefault()
    if (!newLocation.coordinates) return

    const newLoc = {
      ...newLocation,
      id: Date.now(),
      nameAr: newLocation.nameAr || newLocation.name,
      specialtyAr: newLocation.specialtyAr || newLocation.specialty,
      addressAr: newLocation.addressAr || newLocation.address
    }

    setLocations(prev => [...prev, newLoc])
    setNewLocation({
      type: 'doctor',
      name: '',
      nameAr: '',
      specialty: '',
      specialtyAr: '',
      address: '',
      addressAr: '',
      phone: '',
      hours: '',
      coordinates: null
    })
    setShowAddForm(false)
  }

  const doctorCount = locations.filter(l => l.type === 'doctor').length
  const clinicCount = locations.filter(l => l.type === 'clinic').length

  return (
    <div className={`map-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="map-header">
        <div className="map-header-inner">
          <Link to="/" className="back-link">
            {t.backHome}
          </Link>
          <h1 className="map-title">{t.title}</h1>
          <button onClick={toggleLang} className="btn btn-lang">
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="map-content">
        {/* Sidebar */}
        <aside className="map-sidebar">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.filters.all}
            </button>
            <button
              className={`filter-tab ${filter === 'doctors' ? 'active' : ''}`}
              onClick={() => setFilter('doctors')}
            >
              {t.filters.doctors}
            </button>
            <button
              className={`filter-tab ${filter === 'clinics' ? 'active' : ''}`}
              onClick={() => setFilter('clinics')}
            >
              {t.filters.clinics}
            </button>
          </div>

          {/* Stats */}
          <div className="map-stats">
            <div className="stat">
              <span className="stat-number">{locations.length}</span>
              <span className="stat-label">{t.stats.total}</span>
            </div>
            <div className="stat">
              <span className="stat-number">{doctorCount}</span>
              <span className="stat-label">{t.stats.doctors}</span>
            </div>
            <div className="stat">
              <span className="stat-number">{clinicCount}</span>
              <span className="stat-label">{t.stats.clinics}</span>
            </div>
          </div>

          {/* Add New Button */}
          <button
            className="btn btn-primary add-btn"
            onClick={() => setShowAddForm(true)}
          >
            {t.addNew}
          </button>

          {/* Location List */}
          <div className="location-list">
            {locations
              .filter(loc => {
                if (filter === 'doctors') return loc.type === 'doctor'
                if (filter === 'clinics') return loc.type === 'clinic'
                return true
              })
              .filter(loc => {
                if (!searchQuery) return true
                const query = searchQuery.toLowerCase()
                return loc.name.toLowerCase().includes(query) ||
                  loc.nameAr.includes(query) ||
                  loc.specialty.toLowerCase().includes(query) ||
                  loc.specialtyAr.includes(query)
              })
              .map(location => (
                <motion.div
                  key={location.id}
                  className={`location-card ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedLocation(location)
                    map.current?.flyTo({
                      center: location.coordinates,
                      zoom: 14
                    })
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`location-type-badge ${location.type}`}>
                    {location.type === 'doctor' ? t.form.doctor : t.form.clinic}
                  </div>
                  <h3>{isRTL ? location.nameAr : location.name}</h3>
                  <p className="location-specialty">
                    {isRTL ? location.specialtyAr : location.specialty}
                  </p>
                  <p className="location-address">
                    {isRTL ? location.addressAr : location.address}
                  </p>
                </motion.div>
              ))}
          </div>
        </aside>

        {/* Map */}
        <div className="map-container" ref={mapContainer}></div>
      </div>

      {/* Add Location Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{t.form.title}</h2>
              <form onSubmit={handleAddLocation}>
                {/* Type Selection */}
                <div className="form-group">
                  <label>{t.form.type}</label>
                  <div className="type-selector">
                    <button
                      type="button"
                      className={`type-btn ${newLocation.type === 'doctor' ? 'active' : ''}`}
                      onClick={() => setNewLocation(prev => ({ ...prev, type: 'doctor' }))}
                    >
                      {t.form.doctor}
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${newLocation.type === 'clinic' ? 'active' : ''}`}
                      onClick={() => setNewLocation(prev => ({ ...prev, type: 'clinic' }))}
                    >
                      {t.form.clinic}
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="form-group">
                  <label>{t.form.name}</label>
                  <input
                    type="text"
                    placeholder={t.form.namePlaceholder}
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                {/* Specialty */}
                <div className="form-group">
                  <label>{t.form.specialty}</label>
                  <input
                    type="text"
                    placeholder={t.form.specialtyPlaceholder}
                    value={newLocation.specialty}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                  />
                </div>

                {/* Address */}
                <div className="form-group">
                  <label>{t.form.address}</label>
                  <input
                    type="text"
                    placeholder={t.form.addressPlaceholder}
                    value={newLocation.address}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>{t.form.phone}</label>
                  <input
                    type="tel"
                    placeholder={t.form.phonePlaceholder}
                    value={newLocation.phone}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                {/* Hours */}
                <div className="form-group">
                  <label>{t.form.hours}</label>
                  <input
                    type="text"
                    placeholder={t.form.hoursPlaceholder}
                    value={newLocation.hours}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, hours: e.target.value }))}
                  />
                </div>

                {/* Map Location Picker */}
                <div className="form-group location-picker">
                  <label>{t.form.clickMap}</label>
                  {newLocation.coordinates ? (
                    <div className="selected-coords">
                      {t.form.selectedLocation}: {newLocation.coordinates[1].toFixed(4)}, {newLocation.coordinates[0].toFixed(4)}
                    </div>
                  ) : (
                    <div className="no-coords">{t.form.clickMap}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    {t.form.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={!newLocation.coordinates}>
                    {t.form.submit}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Detail Popup */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            className="location-popup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <button className="close-popup" onClick={() => setSelectedLocation(null)}>
              &times;
            </button>
            <div className={`popup-type-badge ${selectedLocation.type}`}>
              {selectedLocation.type === 'doctor' ? t.form.doctor : t.form.clinic}
            </div>
            <h3>{isRTL ? selectedLocation.nameAr : selectedLocation.name}</h3>

            <div className="popup-details">
              <div className="popup-row">
                <span className="popup-label">{t.popup.specialty}:</span>
                <span>{isRTL ? selectedLocation.specialtyAr : selectedLocation.specialty}</span>
              </div>
              <div className="popup-row">
                <span className="popup-label">{t.popup.address}:</span>
                <span>{isRTL ? selectedLocation.addressAr : selectedLocation.address}</span>
              </div>
              {selectedLocation.phone && (
                <div className="popup-row">
                  <span className="popup-label">{t.popup.phone}:</span>
                  <span dir="ltr">{selectedLocation.phone}</span>
                </div>
              )}
              {selectedLocation.hours && (
                <div className="popup-row">
                  <span className="popup-label">{t.popup.hours}:</span>
                  <span dir="ltr">{selectedLocation.hours}</span>
                </div>
              )}
            </div>

            <div className="popup-actions">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates[1]},${selectedLocation.coordinates[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {t.popup.getDirections}
              </a>
              <button className="btn btn-primary">
                {t.popup.book}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MapPage
