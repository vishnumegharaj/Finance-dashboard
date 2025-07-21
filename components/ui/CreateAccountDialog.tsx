'use client';
import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from '@/app/lib/schema';
import { Switch } from './switch';
import { Button } from "@/components/ui/button";
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { AccountTypeTypes } from '@/lib/interface';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Account types list
const accountTypes = [
    { value: "personal", label: "Personal", icon: "👤", description: "Personal expenses and income" },
    { value: "work", label: "Work", icon: "💼", description: "Work-related expenses and salary" },
    { value: "business", label: "Business", icon: "🏢", description: "Business operations and revenue" },
    { value: "savings", label: "Savings", icon: "🏦", description: "Savings and emergency funds" },
    { value: "investment", label: "Investment", icon: "📈", description: "Investment accounts and portfolios" },
];

// Props
type CreateAccountDialogProps = {
    children: React.ReactNode;
    fetchAccounts: () => Promise<void>;
};

// Infer type from Zod schema
type AccountFormData = z.infer<typeof accountSchema>;

const CreateAccountDialog = ({ children, fetchAccounts }: CreateAccountDialogProps) => {
    const [open, setOpen] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "personal",
            balance: "",
            isDefault: false,
        },
    });

    const { data: newAccount, error, loading: createAccountLoading, fn: createAccountFn } = useFetch(createAccount);

    const onSubmit: SubmitHandler<AccountFormData> = (data) => {
        createAccountFn(data);
    };

    // Success Effect
    useEffect(() => {
        if (newAccount && !createAccountLoading) {
            toast.success("Account created successfully!");
            reset();
            setOpen(false);
            fetchAccounts();
        }
    }, [newAccount, createAccountLoading]);

    // Error Effect
    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to create account. Please try again.");
            console.error("Error creating account:", error);
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
                        {/* Account Name */}
                        <div>
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

                        {/* Account Type */}
                        <div>
                            <label htmlFor="type">Account Type</label>
                            <Select
                                onValueChange={(value) => setValue("type", value as AccountTypeTypes)}
                                defaultValue={watch("type")}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accountTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <span>{type.icon}</span>
                                                <div className="flex flex-col items-start">
                                                    <div className="font-medium">{type.label}</div>
                                                    <div className="text-xs text-gray-500">{type.description}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
                            )}
                        </div>

                        {/* Initial Balance */}
                        <div>
                            <label htmlFor="balance">Initial Balance</label>
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

                        {/* Default Switch */}
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

                        {/* Buttons */}
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
                            <Button type="submit" disabled={createAccountLoading}>
                                {createAccountLoading ? (
                                    <>
                                        <Loader2 className='h-4 w-4 animate-spin' /> Creating...
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
    );
};

export default CreateAccountDialog;