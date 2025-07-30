"use client"
import { scanReceipt } from '@/actions/transactions';
import useFetch from '@/hooks/use-fetch';
import { Button } from '@/components/ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react'
import { toast } from 'sonner';

export interface ScanReceiptType {
    amount: number | null;
    category: string | null;
    date: string | null; // ISO 8601 date string
    description: string | null;
    merchantName: string | null;
}

type ReceiptScannerProps = {
    onScanComplete: (scannedData: ScanReceiptType) => void;
};

const ReciptScanner = ({ onScanComplete }: ReceiptScannerProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        data: scannedData,
        error,
        loading: scanReceiptLoading,
        fn: scanReceiptFn
    } = useFetch(scanReceipt);

    async function handleReceiptScan(file: File) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File size exceeds 5MB limit. Please select a smaller file.');
            return;
        }

        await scanReceiptFn(file);
    }

    useEffect(() => {
        if (scannedData?.success && !scanReceiptLoading) {
            onScanComplete(scannedData.data);
            toast.success('Receipt scanned successfully!');
        }
    }, [scanReceiptLoading, scannedData]);

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                        handleReceiptScan(file);
                        console.log("File selected:", file.name)
                    }
                }}
            />

            <Button
                type="button"
                className="w-full px-5 py-3 text-white font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-rose-500 hover:from-orange-600 hover:via-red-600 hover:to-rose-600 transition-opacity shadow-lg  animate-gradient"
                onClick={() => fileInputRef.current?.click()}
                disabled={scanReceiptLoading}
            >
                {scanReceiptLoading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        <span>Scanning...</span>
                    </>
                ) : (
                    <>
                        <Camera className="mr-2" />
                        <span>Scan Receipt</span>
                    </>
                )
                }
            </Button>
            {error && (
                <span className="text-red-500 text-xs">
                    {error instanceof Error ? error.message : String(error)}
                </span>
            )}
        </div>
    )
}

export default ReciptScanner