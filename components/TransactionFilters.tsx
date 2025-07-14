"use client"

import React, { memo, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface TransactionFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: 'ALL' | 'INCOME' | 'EXPENSE'
  onTypeFilterChange: (value: 'ALL' | 'INCOME' | 'EXPENSE') => void
  recurringFilter: string
  onRecurringFilterChange: (value: string) => void
}

const TransactionFilters = memo(({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  recurringFilter,
  onRecurringFilterChange
}: TransactionFiltersProps) => {
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value)
  }, [onSearchChange])

  const handleTypeChange = useCallback((value: string) => {
    onTypeFilterChange(value as 'ALL' | 'INCOME' | 'EXPENSE')
  }, [onTypeFilterChange])

  const handleRecurringChange = useCallback((value: string) => {
    onRecurringFilterChange(value)
  }, [onRecurringFilterChange])

  return (
    <div className='flex flex-col sm:flex-row gap-4'>
      {/* search */}
      <div className='relative flex-1'>
        <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border rounded pl-9 py-1 w-full"
        />
      </div>
      {/* type filter */}
      <div className='flex gap-2'>
        <Select value={typeFilter} onValueChange={handleTypeChange} defaultValue="ALL">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={handleRecurringChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Transactions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Transactions</SelectItem>
            <SelectItem value="recurring">Recurring</SelectItem>
            <SelectItem value="non-recurring">Non-Recurring</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})

TransactionFilters.displayName = 'TransactionFilters'

export default TransactionFilters 