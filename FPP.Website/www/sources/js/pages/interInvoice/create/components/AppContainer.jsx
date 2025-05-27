import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppContainer = () => {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await axios.get('/InterInvoice/GetPreparedData');
                setCurrencies(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch currencies');
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    if (loading) return <div>Loading currencies...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="invoice-container">
            <div className="currency-section">
                <h2>Currencies</h2>
                <div className="currency-list">
                    {currencies.map((currency) => (
                        <div key={currency.id} className="currency-item">
                            <span className="currency-name">{currency.name}</span>
                            <span className="currency-symbol">{currency.symbol}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppContainer;
