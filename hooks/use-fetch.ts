const { useState, useEffect } = require('react');
import { toast } from "sonner"
import { Account } from "@/actions/dashboard"

const useFetch = (cb: Function) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const fn = async (...args: any[]) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching data with args:", args);

            const response = await cb(...args);
            console.log(response);

            if (response && !response.success === true) {
                throw new Error(response.message || "Unknown error");
            }
            setData(response);
        } catch (err) {
            setError(err as Error);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error(String(err));
            }
        }
        finally {
            setLoading(false);
        }
    };


    return { data, setData, error, loading, fn };
}

export default useFetch;