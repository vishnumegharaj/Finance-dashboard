"use client";
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BudgetInterface } from '@/lib/interface/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Pencil, X } from 'lucide-react';
import { updateBudget } from '@/actions/budget';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';


type props = {
  initialBudget: BudgetInterface | null;
  currentExpenses: number;
};
const BudgetProgress = ({ initialBudget, currentExpenses }: props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState(initialBudget?.amount?.toString() || '');
  const usedPercentage = initialBudget ? (currentExpenses / initialBudget.amount) * 100 : 0;

  const {
    data: updateBudgetData,
    error,
    loading: updateBudgetLoading,
    fn: updateBudgetFn
  } = useFetch(updateBudget);

  function handleCancel(): void {
    setNewBudgetAmount(initialBudget?.amount?.toString() || '');
    setIsEditing(false);
  }

  async function handleUpdateBudget() {
    const amount = Number(newBudgetAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount. Please enter a valid number.');
      return;
    };
    await updateBudgetFn(amount);
    setIsEditing(false);
  }

  useEffect(() => {
    if (updateBudgetData?.success) {
      setIsEditing(false);
      toast.success('Budget updated successfully!');
    }
  }, [updateBudgetData])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'failed to update budget');
    }
  }, [error])


  return (
    <div className='mb-3'>
      <Card className=''>
        <CardHeader className='flex flex-row items-center justify-between space-y-0' >
          <div className='flex-1'>
            <CardTitle>Monthly Budget (Default Account)</CardTitle>
            <div className='flex items-center gap-2 mt-1'>
              {isEditing ?
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    value={newBudgetAmount}
                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                    className='w-32'
                    placeholder='Enter new budget amount'
                    autoFocus
                    disabled={updateBudgetLoading}
                  />
                  <Button
                    variant='ghost'
                    size="icon"
                    onClick={() => handleUpdateBudget()}
                    disabled={updateBudgetLoading}
                  >
                    <Check className='w-4 h-4 text-green-500' />
                  </Button>
                  <Button
                    variant='ghost'
                    size="icon"
                    onClick={() => handleCancel()}
                    disabled={updateBudgetLoading}
                  >
                    <X className='w-4 h-4 text-red-500' />
                  </Button>
                </div>
                :
                <div className='flex items-center gap-2'>
                  <CardDescription>
                    {initialBudget ?
                      `${currentExpenses.toFixed(2)} of ${initialBudget.amount.toFixed(2)} used`
                      : 'No budget set.'
                    }
                  </CardDescription>
                  <Button
                    variant='ghost'
                    size="icon"
                    className='h-6 w-6'
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil style={{ width: '15px', height: '15px' }} />

                  </Button>
                </div>
              }
            </div>
          </div>

        </CardHeader>
        <CardContent>
          {initialBudget && (
            <div className='w-full space-y-2'>
              <Progress
                value={usedPercentage}
                className={`h-2 ${usedPercentage >= 90
                  ? '[&>div]:bg-red-500'
                  : usedPercentage >= 75
                    ? '[&>div]:bg-yellow-500'
                    : '[&>div]:bg-green-500'
                  }`}
              />
              <p className='text-muted-foreground text-right'>
                {usedPercentage.toFixed(1)}% used
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BudgetProgress;