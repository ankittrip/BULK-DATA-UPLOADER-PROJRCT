"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import { getStores } from "@/lib/api"
import { Search, MapPin, Store } from "lucide-react"

interface StoreData {
  _id: string
  storeName: string
  storeAddress: string
  cityName: string
  regionName: string
  retailerName: string
  storeType: string
  storeLongitude?: number
  storeLatitude?: number
  createdAt: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalStores, setTotalStores] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchStores()
  }, [currentPage, searchTerm])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await getStores({
        page: currentPage,
        limit: 20,
        search: searchTerm,
      })
      setStores(response.stores)
      setTotalStores(response.total)
      setTotalPages(response.pages)
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStores()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Data</h1>
        <p className="text-gray-600">Browse and search through your uploaded store information</p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by store name, city, region, retailer, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentPage} of {totalPages}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Showing Results</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Store Directory</CardTitle>
          <CardDescription>
            {searchTerm ? `Search results for "${searchTerm}"` : "All stores in the database"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No store data available"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Coordinates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store._id}>
                      <TableCell className="font-medium">{store.storeName}</TableCell>
                      <TableCell className="max-w-48 truncate">{store.storeAddress}</TableCell>
                      <TableCell>{store.cityName}</TableCell>
                      <TableCell>{store.regionName}</TableCell>
                      <TableCell>{store.retailerName}</TableCell>
                      <TableCell>{store.storeType}</TableCell>
                      <TableCell>
                        {store.storeLongitude && store.storeLatitude ? (
                          <span className="text-sm text-gray-600">
                            {store.storeLatitude.toFixed(4)}, {store.storeLongitude.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
