import axios from 'axios';

export const fetchBuList = async () => {
    try {
        const response = await axios.get('/BU/GetBUList');
        return response.data;
    } catch (error) {
        console.error('Error fetching BU list:', error);
        throw error;
    }
};

export const fetchInvoices = async (params = {}) => {
    try {
        const response = await fetch('/InterInvoice/GetInvoiceList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
};

export const fetchAccessibleUnits = async () => {
    try {
        const response = await fetch('/InterInvoice/GetAccessibleUnits');
        return await response.json();
    } catch (error) {
        console.error('Error fetching accessible units:', error);
        throw error;
    }
};
