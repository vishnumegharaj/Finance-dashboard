'use client'
import React, { useEffect } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from '@/app/lib/schema';
import { Switch } from './switch';
import { Button } from "@/components/ui/button";
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountDialog = (
    { children }: Readonly<{ children: React.ReactNode; }>
) => {

    const [open, setOpen] = React.useState(true);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false,
        },
    });

    const { data: newAccount, setData, error, loading: createAccountLoading, fn: createAccountFn } = useFetch(createAccount)

    const onSubmit = async (data: any) => {
        await createAccountFn(data);
    };

    useEffect(() => {
        if (newAccount && !createAccountLoading) {
            toast.success("Account created successfully!");
            reset(); 
            setOpen(false);
        }
        if (error) {
            console.error("Error creating account:", error);
            // Optionally, you can show an error message to the user
        }
    }, [newAccount, createAccountLoading]);

       useEffect(() => {
   
        if (error) {
            toast.error(error.message || "Failed to create account. Please try again.");
            console.error("Error creating account:", error);
            // Optionally, you can show an error message to the user
        }
    }, [error]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Account</DialogTitle>
                </DialogHeader>
                <div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-3"
                    >
                        <div className="">
                            <label htmlFor="name">Account Name</label>
                            <Input
                                id="name"
                                type="text"
                                placeholder='e.g., Main Checking'
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="">
                            <label htmlFor="type">Account Type</label>
                            <Select
                                onValueChange={(value) => setValue("type", value as "CURRENT" | "SAVINGS")}
                                defaultValue={watch("type")}
                            >
                                <SelectTrigger id="type" className="w-full">
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CURRENT">CURRENT</SelectItem>
                                    <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
                            )}
                        </div>
                        <div className="">
                            <label htmlFor="name">Initial Balance</label>
                            <Input
                                id="balance"
                                type="number"
                                step="0.01"
                                placeholder='0'
                                {...register("balance")}
                            />
                            {errors.balance && (
                                <p className="text-xs text-red-500 mt-1">{errors.balance.message}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2 border rounded-lg px-4">
                            <div>
                                <label htmlFor="isDefault" className="block text-sm font-medium text-gray-900">
                                    Set as Default
                                </label>
                                <p className="text-xs text-gray-500">
                                    This account will be selected by default for transactions
                                </p>
                            </div>
                            <Switch
                                id="isDefault"
                                onCheckedChange={(checked) => setValue("isDefault", checked)}
                                checked={watch("isDefault")}
                                aria-label="Set as Default"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createAccountLoading}   >
                                {!createAccountLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> creating...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CreateAccountDialog