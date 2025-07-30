/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { AccountInterface } from '../../dashboard/page';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/app/lib/schema';
import { CreateTransaction, updateTransactionById } from '@/actions/transactions';
import useFetch from '@/hooks/use-fetch';
import { defaultCategories } from '@/lib/data/categories';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar1, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Transaction } from '@/lib/interface/transaction';
import { useSearchParams } from 'next/navigation';
import ReciptScanner from './recipt-scanner';

// Types
type Props = {
  accounts: AccountInterface[];
  editMode: boolean;
  transaction?: Transaction | null;
};

type TransactionFormValues = z.infer<typeof transactionSchema>;

const AddTransactionForm = ({ accounts, editMode, transaction }: Props) => {
  const searchParams = useSearchParams(); // ✅ get the searchParams object
  const editId = searchParams.get('edit');

  const router = useRouter();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Safe default values - wait for accounts to load
  const getDefaultAccountId = () => {
    if (!accounts || accounts.length === 0) return '';
    const defaultAccount = accounts.find((ac) => ac.isDefault);
    return defaultAccount ? String(defaultAccount.id) : String(accounts[0].id);
  };

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && transaction ? {
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description ?? '',
        source: transaction.source,
        accountId: transaction.accountId,
        category: transaction.category,
        date: new Date(transaction.date),
        isRecurring: transaction.isRecurring, ...(transaction.recurringInterval && {
          recurringInterval: transaction.recurringInterval,
        }),
      } :
        {
          type: 'EXPENSE',
          amount: '',
          description: '',
          source: '',
          date: new Date(),
          accountId: '',
          category: '',
          isRecurring: false,
          recurringInterval: undefined,
          recurringEndDate: undefined,
        },
  });

  // Add this effect to update form values in edit mode
  useEffect(() => {
    if (editMode && transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount.toString(),
        description: transaction.description ?? '',
        source: transaction.source,
        accountId: transaction.accountId,
        category: transaction.category,
        date: new Date(transaction.date),
        isRecurring: transaction.isRecurring,
        ...(transaction.recurringInterval && {
          recurringInterval: transaction.recurringInterval,
        }),
      });
    }
  }, [editMode, transaction, reset]);

  // Auto-select default account when accounts change
  useEffect(() => {
    if (accounts && accounts.length > 0 && !getValues('accountId')) {
      const defaultAccountId = getDefaultAccountId();
      setValue('accountId', defaultAccountId);
    }
  }, [accounts, getValues, setValue]);

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
    error: transactionError,
  } = useFetch(editMode ? updateTransactionById : CreateTransaction);

  // Watchers
  const type = watch('type');
  const isRecurring = watch('isRecurring');

  // Filter categories by type
  const filteredCategories = useMemo(
    () => defaultCategories.filter((cat) => cat.type === type),
    [type]
  );

  // Form submit handler
  const onSubmit = async (data: TransactionFormValues) => {
    // Convert amount to number for backend
    const submitData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if (editMode) {
      await transactionFn(editId, submitData);
    } else {
      await transactionFn(submitData);
    }
    if (!transactionError) {
      reset();
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(editMode ? 'Transaction updated successfully!' : 'Transaction added successfully!');
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const onScanComplete = (ScannedData: any) => {
    console.log("Scanned data:", ScannedData);
    if(ScannedData){
      setValue('source', ScannedData.merchantName);
      setValue('amount', ScannedData.amount.toString());
      setValue('date', new Date(ScannedData.date));
      setValue('description', ScannedData.description || '');
      setValue('category', ScannedData.category || '');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full m-0 ">

      {/* AI recipt Scanner */}
      <ReciptScanner onScanComplete={onScanComplete} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block mb-1 font-medium">Type</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <span className="text-red-500 text-xs">{errors.type.message}</span>}
        </div>
        {/* Account */}
        <div>
          <label className="block mb-1 font-medium">Account</label>
          <Controller
            name="accountId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((ac) => (
                    <SelectItem key={ac.id} value={String(ac.id)}>
                      {ac.name}{' '}
                      (₹{ac.balance.toFixed(2)})
                      {ac.isDefault && ' (Default)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountId && <span className="text-red-500 text-xs">{errors.accountId.message}</span>}
        </div>
        {/* Amount */}
        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <Input type="number" step="0.1" min="1" placeholder="0.0" {...register('amount')} />
          {errors.amount && <span className="text-red-500 text-xs">{errors.amount.message}</span>}
        </div>
        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
        </div>
        {/* Source */}
        <div>
          <label className="block mb-1 font-medium">Source</label>
          <Input placeholder="e.g. Netflix, Zomato, Metro, Electricity Bill" {...register('source')} />
          {errors.source && <span className="text-red-500 text-xs">{errors.source.message}</span>}
        </div>
        {/* Date */}
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen} >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full shadow-none text-left font-normal"
                  >
                    <span className="flex items-center justify-between w-full">
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                      <Calendar1 className="h-4 w-4" />
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
        </div>
      </div>
      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">Description <span className="text-xs text-muted-foreground">(optional)</span></label>
        <Input placeholder="Description" {...register('description')} />
        {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
      </div>
      {/* Recurring */}
      <div className="flex items-center gap-3">
        <Controller
          name="isRecurring"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <span className="font-medium">Recurring Transaction?</span>
      </div>
      {isRecurring && (
        <div>
          {/* Recurring Interval */}
          <div>
            <label className="block mb-1 font-medium">Recurring Interval</label>
            <Controller
              name="recurringInterval"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.recurringInterval && <span className="text-red-500 text-xs">{errors.recurringInterval.message}</span>}
          </div>
        </div>
      )}
      {/* Submit Button & Feedback */}
      <div className="flex flex-row gap-2">
        <Button type="button" variant="outline" className='w-[50%]' onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={transactionLoading} className='w-[50%]'>
          {transactionLoading ?
            (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-apin' />
                {editMode ? "Updating..." : "Creating..."}
              </>
            )
            : editMode ? ("Update Transaction") : ("Create Transaction")
          }
        </Button>

      </div>
      {transactionError && (
        <span className="text-red-500 text-xs">
          {transactionError instanceof Error ? transactionError.message : String(transactionError)}
        </span>
      )}
      {transactionResult?.success && <span className="text-green-600 text-xs">Transaction added!</span>}
    </form>
  );
};

export default AddTransactionForm;