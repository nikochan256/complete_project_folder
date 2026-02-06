// utils/currencyConverter.js

// Cache for storing fetched prices
let priceCache = {
               data: null,
               timestamp: null,
               cacheDuration: 60000 // 1 minute
};

/**
 * Fetches current cryptocurrency prices from CoinGecko API with caching
 * @returns {Promise<Object>} Price data object with BTC rates
 */
const fetchCryptoPrices = async () => {
               const now = Date.now();

               // Return cached data if still valid
               if (priceCache.data && priceCache.timestamp && (now - priceCache.timestamp < priceCache.cacheDuration)) {
                              return priceCache.data;
               }

               try {
                              const response = await fetch(
                                             'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp,jpy,inr'
                              );

                              if (!response.ok) {
                                             throw new Error('Failed to fetch crypto prices');
                              }

                              const data = await response.json();

                              // Update cache
                              priceCache.data = data.bitcoin;
                              priceCache.timestamp = now;

                              return data.bitcoin;
               } catch (error) {
                              console.error('Error fetching crypto prices:', error);
                              // Return cached data if available, even if expired
                              if (priceCache.data) {
                                             console.warn('Using expired cache due to fetch error');
                                             return priceCache.data;
                              }
                              throw error;
               }
};

/**
 * Universal currency converter - converts any amount in any currency to BTC
 * @param {number} amount - Amount to convert
 * @param {string} currency - Source currency code ('USD', 'EUR', 'GBP', 'JPY', 'INR', 'BTC')
 * @param {number} decimals - Number of decimal places (default: 8)
 * @returns {Promise<string>} BTC amount as string
 * 
 * @example
 * const btcAmount = await convertToBtc(100, 'USD'); // Returns "0.00123456"
 * const btcAmount = await convertToBtc(50, 'EUR'); // Returns "0.00087654"
 * const btcAmount = await convertToBtc(1, 'BTC'); // Returns "1.00000000"
 */
export const convertToBtc = async (amount, currency = 'USD', decimals = 8) => {
               try {
                              // If already in BTC, just format it
                              if (currency.toUpperCase() === 'BTC') {
                                             return parseFloat(amount).toFixed(decimals);
                              }

                              // Fetch current prices
                              const prices = await fetchCryptoPrices();

                              // Get the BTC price for the specified currency
                              const currencyKey = currency.toLowerCase();
                              const btcPrice = prices[currencyKey];

                              if (!btcPrice || btcPrice <= 0) {
                                             throw new Error(`Unsupported currency: ${currency}`);
                              }

                              // Convert to BTC
                              const btcAmount = amount / btcPrice;
                              return btcAmount.toFixed(decimals);

               } catch (error) {
                              console.error('Error converting to BTC:', error);
                              return '0.00000000';
               }
};

/**
 * Universal currency converter - converts any amount in any currency to another currency
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code ('BTC', 'USD', 'EUR', 'GBP', 'JPY', 'INR')
 * @param {number} decimals - Number of decimal places (default: 8 for BTC, 2 for fiat)
 * @returns {Promise<string>} Converted amount as string
 * 
 * @example
 * const usdAmount = await convertCurrency(100, 'EUR', 'USD'); // Returns "108.50"
 * const btcAmount = await convertCurrency(100, 'USD', 'BTC'); // Returns "0.00123456"
 */
export const convertCurrency = async (amount, fromCurrency = 'EUR', toCurrency = 'BTC', decimals = null) => {
               try {
                              // Set default decimals based on target currency
                              if (decimals === null) {
                                             decimals = toCurrency.toUpperCase() === 'BTC' ? 8 : 2;
                              }

                              // If same currency, just format
                              if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
                                             return parseFloat(amount).toFixed(decimals);
                              }

                              // Fetch current prices
                              const prices = await fetchCryptoPrices();

                              // If converting to BTC
                              if (toCurrency.toUpperCase() === 'BTC') {
                                             if (fromCurrency.toUpperCase() === 'BTC') {
                                                            return parseFloat(amount).toFixed(decimals);
                                             }
                                             const fromPrice = prices[fromCurrency.toLowerCase()];
                                             if (!fromPrice) throw new Error(`Unsupported currency: ${fromCurrency}`);
                                             return (amount / fromPrice).toFixed(decimals);
                              }

                              // If converting from BTC
                              if (fromCurrency.toUpperCase() === 'BTC') {
                                             const toPrice = prices[toCurrency.toLowerCase()];
                                             if (!toPrice) throw new Error(`Unsupported currency: ${toCurrency}`);
                                             return (amount * toPrice).toFixed(decimals);
                              }

                              // Converting between two fiat currencies
                              const fromPrice = prices[fromCurrency.toLowerCase()];
                              const toPrice = prices[toCurrency.toLowerCase()];

                              if (!fromPrice || !toPrice) {
                                             throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
                              }

                              // Convert through BTC as intermediary
                              const btcAmount = amount / fromPrice;
                              const targetAmount = btcAmount * toPrice;

                              return targetAmount.toFixed(decimals);

               } catch (error) {
                              console.error('Error converting currency:', error);
                              return '0.00';
               }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
               const symbols = {
                              BTC: '₿',
                              USD: '$',
                              EUR: '€',
                              GBP: '£',
                              JPY: '¥',
                              INR: '₹'
               };
               return symbols[currency.toUpperCase()] || currency;
};

/**
 * Format amount with currency symbol
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
               const symbol = getCurrencySymbol(currency);
               const decimals = currency.toUpperCase() === 'BTC' ? 8 : 2;
               return `${symbol} ${parseFloat(amount).toFixed(decimals)}`;
};

/**
 * Manually refresh the price cache
 * Useful for forcing an immediate price update
 */
export const refreshPriceCache = async () => {
               priceCache.timestamp = null; // Invalidate cache
               return await fetchCryptoPrices();
};

// Default export
export default {
               convertToBtc,
               convertCurrency,
               getCurrencySymbol,
               formatCurrency,
               refreshPriceCache
};