'use client'

import { useState, useCallback, useMemo } from 'react'
import { Filters, PropertyType } from '@/lib/types'

interface FilterBarProps {
  onFilterChange: (filters: Filters) => void
}

const ABOLOCATIONS = [
  'Aba Town',
  'Ochie',
  'Eziukwu',
  'Ariaria',
  'Ogbor Hill',
  'Asa',
  'Umungasi',
  'Nkwoagu',
  'Umuojima',
  'Umuola',
  'Aba South',
  'Aba North',
  'Other',
]

const PROPERTY_TYPES: PropertyType[] = [
  'self-contain',
  'flat',
  'duplex',
  'bungalow',
  'office',
  'shop',
  'other',
]

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [location, setLocation] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('')

  const applyFilters = useCallback(() => {
    onFilterChange({
      search: search || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      location: location || undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      propertyType: propertyType || undefined,
    })
  }, [search, minPrice, maxPrice, location, bedrooms, propertyType, onFilterChange])

  const clearFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setLocation('')
    setBedrooms('')
    setPropertyType('')
    onFilterChange({})
  }

  const activeFilterCount = useMemo(() => {
    return [search, minPrice, maxPrice, location, bedrooms, propertyType].filter(Boolean).length
  }, [search, minPrice, maxPrice, location, bedrooms, propertyType])

  return (
    <div className="card p-4 mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by title, location, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="input flex-1"
        />
        <button
          onClick={() => {
            applyFilters()
            setShowFilters(!showFilters)
          }}
          className="btn-primary whitespace-nowrap"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline relative"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="label">Min Price (₦)</label>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Max Price (₦)</label>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
            >
              <option value="">All Areas</option>
              {ABOLOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="input"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="input"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-5 flex justify-end">
            <button onClick={clearFilters} className="btn-outline text-sm">
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}