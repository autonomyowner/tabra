import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import ChatWidget from './components/chat/ChatWidget'

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
      searchLocation: 'البحث عن موقع',
      searchPlaceholder: 'ابحث عن عنوان أو مكان...',
      street: 'الشارع',
      streetPlaceholder: 'مثال: شارع محمد خميستي',
      commune: 'البلدية',
      communePlaceholder: 'مثال: قصر البخاري',
      wilaya: 'الولاية',
      wilayaPlaceholder: 'مثال: المدية',
      postalCode: 'الرمز البريدي',
      postalCodePlaceholder: 'مثال: 26300',
      placeName: 'اسم المكان (اختياري)',
      placeNamePlaceholder: 'مثال: عيادة الصنوبر',
      phone: 'الهاتف',
      phonePlaceholder: '0555 00 00 00',
      hours: 'ساعات العمل',
      hoursPlaceholder: '08:00 - 17:00',
      clickMap: 'تحديد الموقع على الخريطة',
      selectOnMap: 'انقر على الخريطة',
      orSearchAbove: 'أو ابحث عن موقع أعلاه',
      selectedLocation: 'الموقع المحدد',
      searching: 'جاري البحث...',
      noResults: 'لا توجد نتائج',
      selectingMode: 'انقر على الخريطة لتحديد الموقع...',
      cancelSelection: 'إلغاء التحديد',
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
      searchLocation: 'Search Location',
      searchPlaceholder: 'Search for an address or place...',
      street: 'Street',
      streetPlaceholder: 'e.g. Mohamed Khmisti Street',
      commune: 'Commune',
      communePlaceholder: 'e.g. Ksar El Bokhari',
      wilaya: 'Wilaya',
      wilayaPlaceholder: 'e.g. Medea',
      postalCode: 'Postal Code',
      postalCodePlaceholder: 'e.g. 26300',
      placeName: 'Place Name (optional)',
      placeNamePlaceholder: 'e.g. Pine Clinic',
      phone: 'Phone',
      phonePlaceholder: '0555 00 00 00',
      hours: 'Working Hours',
      hoursPlaceholder: '08:00 - 17:00',
      clickMap: 'Select location on map',
      selectOnMap: 'Click on map',
      orSearchAbove: 'or search for a location above',
      selectedLocation: 'Selected location',
      searching: 'Searching...',
      noResults: 'No results found',
      selectingMode: 'Click on the map to select location...',
      cancelSelection: 'Cancel selection',
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

// Transform Convex doctor data to map format
const transformDoctorToLocation = (doctor) => ({
  id: doctor._id,
  type: doctor.type === 'hospital' ? 'clinic' : doctor.type, // treat hospital as clinic for filtering
  name: doctor.name_en,
  nameAr: doctor.name_ar,
  specialty: doctor.specialty,
  specialtyAr: doctor.specialty_ar || doctor.specialty,
  address: doctor.address,
  addressAr: doctor.address,
  phone: doctor.phone || '',
  hours: doctor.workingHours ? formatWorkingHours(doctor.workingHours) : '',
  coordinates: [doctor.coordinates.lng, doctor.coordinates.lat] // Mapbox uses [lng, lat]
})

const formatWorkingHours = (hours) => {
  if (!hours || hours.length === 0) return ''
  const firstDay = hours.find(h => !h.isClosed)
  return firstDay ? `${firstDay.open} - ${firstDay.close}` : ''
}

function MapPage() {
  const [lang, setLang] = useState('ar')

  // Fetch doctors from Convex
  const doctorsFromDb = useQuery(api.doctors.queries.listDoctors, {})
  const createDoctor = useMutation(api.doctors.mutations.createDoctor)

  // Transform to map format
  const locations = doctorsFromDb ? doctorsFromDb.map(transformDoctorToLocation) : []
  const isLoading = doctorsFromDb === undefined
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
    street: '',
    commune: '',
    wilaya: '',
    postalCode: '',
    placeName: '',
    phone: '',
    hours: '',
    coordinates: null
  })
  const [locationSearch, setLocationSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false)

  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)

  const t = mapTranslations[lang]
  const isRTL = lang === 'ar'


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

  // Update map click handler when isSelectingOnMap changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const handleClick = (e) => {
      if (isSelectingOnMap) {
        setNewLocation(prev => ({
          ...prev,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        }))
        setIsSelectingOnMap(false)
        setShowAddForm(true)
      }
    }

    map.current.on('click', handleClick)

    return () => {
      map.current?.off('click', handleClick)
    }
  }, [isSelectingOnMap, mapLoaded])

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

  // Geocoding search with debounce
  useEffect(() => {
    if (!locationSearch || locationSearch.length < 3) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationSearch)}.json?` +
          `access_token=${mapboxgl.accessToken}&country=dz&types=address,place,locality,neighborhood,poi&limit=5`
        )
        const data = await response.json()
        setSearchResults(data.features || [])
      } catch (error) {
        console.error('Geocoding error:', error)
        setSearchResults([])
      }
      setIsSearching(false)
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [locationSearch])

  // Select a geocoding result
  const selectSearchResult = (result) => {
    const [lng, lat] = result.center

    // Parse the address components from the result
    const context = result.context || []
    let street = ''
    let commune = ''
    let wilaya = ''
    let postalCode = ''

    // Extract place name
    const placeName = result.text || ''

    // Parse context for address components
    context.forEach(item => {
      if (item.id.startsWith('postcode')) {
        postalCode = item.text
      } else if (item.id.startsWith('place') || item.id.startsWith('locality')) {
        commune = item.text
      } else if (item.id.startsWith('region')) {
        wilaya = item.text
      }
    })

    // Use the main text as street if it looks like an address
    if (result.place_type?.includes('address')) {
      street = result.text + (result.address ? ` ${result.address}` : '')
    }

    // Build full address string
    const fullAddress = result.place_name || ''

    setNewLocation(prev => ({
      ...prev,
      coordinates: [lng, lat],
      street: street || prev.street,
      commune: commune || prev.commune,
      wilaya: wilaya || prev.wilaya,
      postalCode: postalCode || prev.postalCode,
      placeName: result.place_type?.includes('poi') ? placeName : prev.placeName,
      address: fullAddress,
      addressAr: fullAddress
    }))

    setLocationSearch('')
    setSearchResults([])

    // Fly to the location on the map
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 16
    })
  }

  const toggleLang = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar')
  }

  const handleAddLocation = async (e) => {
    e.preventDefault()
    if (!newLocation.coordinates) return

    // Build full address from structured fields if not already set
    let fullAddress = newLocation.address
    if (!fullAddress && (newLocation.street || newLocation.commune || newLocation.wilaya)) {
      const addressParts = []
      if (newLocation.placeName) addressParts.push(newLocation.placeName)
      if (newLocation.street) addressParts.push(newLocation.street)
      if (newLocation.commune) addressParts.push(newLocation.commune)
      if (newLocation.postalCode) addressParts.push(newLocation.postalCode)
      if (newLocation.wilaya) addressParts.push(newLocation.wilaya)
      fullAddress = addressParts.join(', ')
    }

    // Save to Convex database
    try {
      await createDoctor({
        type: newLocation.type,
        name_en: newLocation.name,
        name_ar: newLocation.nameAr || newLocation.name,
        specialty: newLocation.specialty,
        specialty_ar: newLocation.specialtyAr || newLocation.specialty,
        address: fullAddress,
        wilaya: newLocation.wilaya || 'Unknown',
        coordinates: {
          lat: newLocation.coordinates[1],
          lng: newLocation.coordinates[0]
        },
        phone: newLocation.phone || undefined,
        languages: ['ar', 'fr']
      })
    } catch (error) {
      console.error('Failed to add location:', error)
    }

    setNewLocation({
      type: 'doctor',
      name: '',
      nameAr: '',
      specialty: '',
      specialtyAr: '',
      address: '',
      addressAr: '',
      street: '',
      commune: '',
      wilaya: '',
      postalCode: '',
      placeName: '',
      phone: '',
      hours: '',
      coordinates: null
    })
    setLocationSearch('')
    setSearchResults([])
    setIsSelectingOnMap(false)
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

          {/* Loading indicator */}
          {isLoading && (
            <div className="loading-indicator" style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
              Loading doctors...
            </div>
          )}

          {/* Stats */}
          <div className="map-stats">
            <div className="stat">
              <span className="stat-number">{isLoading ? '...' : locations.length}</span>
              <span className="stat-label">{t.stats.total}</span>
            </div>
            <div className="stat">
              <span className="stat-number">{isLoading ? '...' : doctorCount}</span>
              <span className="stat-label">{t.stats.doctors}</span>
            </div>
            <div className="stat">
              <span className="stat-number">{isLoading ? '...' : clinicCount}</span>
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

        {/* Map Selection Mode Indicator */}
        {isSelectingOnMap && (
          <div className="map-selection-mode">
            <div className="selection-message">
              <span>{t.form.selectingMode}</span>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsSelectingOnMap(false)
                  setShowAddForm(true)
                }}
              >
                {t.form.cancelSelection}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Location Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddForm(false)
              setIsSelectingOnMap(false)
            }}
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

                {/* Location Search */}
                <div className="form-group location-search-group">
                  <label>{t.form.searchLocation}</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder={t.form.searchPlaceholder}
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                    />
                    {isSearching && <span className="search-loading">{t.form.searching}</span>}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="search-results-dropdown">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="search-result-item"
                          onClick={() => selectSearchResult(result)}
                        >
                          <span className="result-name">{result.text}</span>
                          <span className="result-address">{result.place_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {locationSearch.length >= 3 && !isSearching && searchResults.length === 0 && (
                    <div className="no-results-message">{t.form.noResults}</div>
                  )}
                </div>

                {/* Structured Address Fields */}
                <div className="form-group">
                  <label>{t.form.placeName}</label>
                  <input
                    type="text"
                    placeholder={t.form.placeNamePlaceholder}
                    value={newLocation.placeName}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, placeName: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>{t.form.street}</label>
                  <input
                    type="text"
                    placeholder={t.form.streetPlaceholder}
                    value={newLocation.street}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t.form.commune}</label>
                    <input
                      type="text"
                      placeholder={t.form.communePlaceholder}
                      value={newLocation.commune}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, commune: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.form.postalCode}</label>
                    <input
                      type="text"
                      placeholder={t.form.postalCodePlaceholder}
                      value={newLocation.postalCode}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t.form.wilaya}</label>
                  <input
                    type="text"
                    placeholder={t.form.wilayaPlaceholder}
                    value={newLocation.wilaya}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, wilaya: e.target.value }))}
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
                  <div className={`map-picker-box ${newLocation.coordinates ? 'has-location' : ''}`}>
                    {newLocation.coordinates ? (
                      <div className="selected-coords">
                        <span className="coords-label">{t.form.selectedLocation}:</span>
                        <span className="coords-value">{newLocation.coordinates[1].toFixed(4)}, {newLocation.coordinates[0].toFixed(4)}</span>
                        <button
                          type="button"
                          className="clear-coords-btn"
                          onClick={() => setNewLocation(prev => ({ ...prev, coordinates: null }))}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="no-coords">
                        <button
                          type="button"
                          className="select-on-map-btn"
                          onClick={() => {
                            setShowAddForm(false)
                            setIsSelectingOnMap(true)
                          }}
                        >
                          {t.form.selectOnMap}
                        </button>
                        <span className="or-search-hint">{t.form.orSearchAbove}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => {
                    setShowAddForm(false)
                    setIsSelectingOnMap(false)
                  }}>
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

      {/* Floating Chat Widget */}
      <ChatWidget lang={lang} />
    </div>
  )
}

export default MapPage
