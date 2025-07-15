'use client'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Clock, Trash2, Edit, MoreHorizontal, Search } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Transaction } from '@prisma/client'
import { format } from 'date-fns'
import { categoryColors } from '@/lib/data/categories'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import TransactionFilters from '@/components/TransactionFilters'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useFetch from '@/hooks/use-fetch'
import { DeleteManyTransaction } from '@/actions/transactions'
import { toast } from 'sonner'
import { BarLoader } from 'react-spinners'

// ✅ CORRECTED: Proper props typing and parameter destructuring
interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionsChange?: (txs: Transaction[]) => void; // Optional callback for parent update
  refreshAccount?: () => void; // New prop for silent refresh
}

const TransactionTable = ({ transactions, onTransactionsChange, refreshAccount }: TransactionTableProps) => {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortConfig, setSortConfig] = React.useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [recurringFilter, setRecurringFilter] = React.useState<string>('ALL');

  // Debounce search term to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted
  } = useFetch(DeleteManyTransaction);
  const handleDeleteManyTransactions = async () => {
    if (
      !window.confirm("Are you sure you want to delete these transactions?")
    ) {
      return;
    }
    await deleteFn(selectedIds);
    // Instead of local update, trigger parent refresh
    if (refreshAccount) refreshAccount();
    setSelectedIds([]);
  }

  // Single delete handler for row menu
  const handleDeleteSingle = async (id: string) => {
    await deleteFn([id]);
    if (refreshAccount) refreshAccount();
    setSelectedIds(prev => prev.filter(selId => selId !== id));
  }

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transactions deleted successfully");

    }
  }, [deleted, deleteLoading]);

  // Memoized filtering and sorting logic
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(trans =>
        trans.description?.toLowerCase().includes(searchLower) ||
        trans.source?.toLowerCase().includes(searchLower) ||
        trans.category?.toLowerCase().includes(searchLower) ||
        trans.amount.toString().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(trans => trans.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter === 'recurring') {
      filtered = filtered.filter(trans => trans.isRecurring);
    } else if (recurringFilter === 'non-recurring') {
      filtered = filtered.filter(trans => !trans.isRecurring);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.field) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category?.toLowerCase();
          bValue = b.category?.toLowerCase();
          break;
        case 'source':
          aValue = a.source?.toLowerCase();
          bValue = b.source?.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, debouncedSearchTerm, typeFilter, recurringFilter, sortConfig]);

  const handleSort = useCallback((field: string) => {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { field, direction: 'asc' };
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredAndSortedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedTransactions.map((t) => t.id))
    }
  }, [selectedIds.length, filteredAndSortedTransactions]);

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      return [...prev, id];
    })
  }, []);

  function handleDelete(arg0: any[]): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className='space-y-4'>
      {/* Search and filter controls */}
      {/* <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        recurringFilter={recurringFilter}
        onRecurringFilterChange={setRecurringFilter}
      /> */}
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#3b82f6" />
      )}

      <div className='flex flex-col sm:flex-row gap-4'>

        <div className='relative flex-1'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded pl-9 py-1 w-full"
          />
        </div>

        <div className='flex gap-2'>
          <Select value={typeFilter}
            onValueChange={(value: string) => setTypeFilter(value as 'ALL' | 'INCOME' | 'EXPENSE')}
            defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter}
            onValueChange={(value: string) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="non-recurring">Non-Recurring</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteManyTransactions}
            >
              <Trash2 className='h-4 w-4' />
              Delete Selected ({selectedIds.length})
            </Button>
          )}

          {(searchTerm || typeFilter !== 'ALL' || recurringFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('ALL');
                setRecurringFilter('ALL');
                setSelectedIds([]);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* table data */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length === filteredAndSortedTransactions.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('date')}
              >
                <div className='flex items-center'>Date {sortConfig.field === 'date' && (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                )}</div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('category')}
              >
                <div className='flex items-center'>Category
                  {sortConfig.field === 'category' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}

                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('source')}
              >
                <div className='flex items-center'>Source
                  {sortConfig.field === 'source' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('amount')}
              >
                <div className='flex items-center justify-end'>Amount
                  {sortConfig.field === 'amount' && (
                    sortConfig.direction === 'asc' ? '↑' : '↓'
                  )}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Status</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.map((trans) => (
              <TableRow key={trans.id}>

                <TableCell>
                  <Checkbox onCheckedChange={() => handleSelect(trans.id)}
                    checked={selectedIds.includes(trans.id)}
                  />
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className='cursor-pointer hover:bg-blue-100'
                        onClick={() =>
                          router.push(
                            `/transaction/create?edit=${trans.id}`
                          )
                        }
                      >
                        <Edit /> 
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className='cursor-pointer text-destructive hover:bg-red-100'
                        onClick={() => handleDeleteSingle(trans.id)}
                      >
                        <Trash2 className='text-destructive' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                <TableCell className="font-medium">
                  {format(new Date(trans.date), "PP")}
                </TableCell>

                <TableCell className="capitalize">
                  <span style={{
                    background: categoryColors[trans.category],
                  }}
                    className="px-2 py-1 rounded text-xs text-white font-semibold"
                  >
                    {trans.category}
                  </span>
                </TableCell>

                <TableCell>{trans.source}</TableCell>

                <TableCell className="text-right">
                  <span className={trans.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                    {trans.type === 'INCOME' ? '+' : '-'}{trans.amount.toFixed(2)}Rs
                  </span>
                </TableCell>

                <TableCell>
                  {trans.isRecurring ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2 cursor-pointer group">
                          {/* Recurring badge with color coding */}
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200 transition-colors">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700">
                              {trans.recurringInterval}
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>{trans.nextRecurringDate ? format(new Date(trans.nextRecurringDate), "PP") : null}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${trans.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-800'
                    : trans.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {trans.status}
                  </span>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            {/* <TableRow>
          <TableCell colSpan={7}>Total</TableCell>
          <TableCell className="text-right">
            ${filteredAndSortedTransactions
              .reduce((sum, trans) => {
                return trans.type === 'INCOME' 
                  ? sum + trans.amount 
                  : sum - trans.amount;
              }, 0)
              .toFixed(2)}
          </TableCell>
        </TableRow> */}
          </TableFooter>
        </Table >
      </div>
    </div>
  )
}
export default TransactionTable
