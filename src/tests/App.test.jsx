import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { vi } from 'vitest';
import axios from 'axios';

// Mocking axios to control API responses
vi.mock('axios');

describe('App Component', () => {
  // Test case for the Top Losers sorting logic
  test('correctly sorts top losers in descending order of loss', async () => {
    // Mock data with unsorted losers
    const mockData = [
      { id: 'coin1', name: 'Coin A', symbol: 'CNA', image: '', price_change_percentage_24h: -1.5, current_price: 1, market_cap: 1000 },
      { id: 'coin2', name: 'Coin B', symbol: 'CNB', image: '', price_change_percentage_24h: -5.0, current_price: 1, market_cap: 1000 },
      { id: 'coin3', name: 'Coin C', symbol: 'CNC', image: '', price_change_percentage_24h: -0.5, current_price: 1, market_cap: 1000 },
      { id: 'coin4', name: 'Coin D', symbol: 'CND', image: '', price_change_percentage_24h: 2.0, current_price: 1, market_cap: 1000 }, // A gainer
      { id: 'coin5', name: 'Coin E', symbol: 'CNE', image: '', price_change_percentage_24h: -10.0, current_price: 1, market_cap: 1000 },
    ];

    // Setup mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/coins/markets')) {
        return Promise.resolve({ data: mockData });
      }
      if (url.includes('/search/trending')) {
        return Promise.resolve({ data: { coins: [] } });
      }
      if (url.includes('/market_chart')) {
        return Promise.resolve({ data: { prices: [] } });
      }
      return Promise.reject(new Error('not found'));
    });

    // Render the App component
    render(<App />);

    // Wait for the component to finish loading and rendering the data
    await screen.findByText('Coin B');

    // Find the "Top Losers" card
    const topLosersCard = screen.getByText('Top Losers').closest('.overview-card');

    // Check if the card is in the document
    expect(topLosersCard).toBeInTheDocument();

    // Get all coin items within the "Top Losers" card
    const loserItems = topLosersCard.querySelectorAll('.overview-list-item');

    // Extract the symbols of the rendered loser coins
    const renderedSymbols = Array.from(loserItems).map(item => item.querySelector('strong').textContent);

    // Define the expected order of symbols (biggest loser first)
    const expectedSymbols = ['CNE', 'CNB', 'CNA', 'CNC'];

    // Assert that the rendered symbols match the expected order
    expect(renderedSymbols).toEqual(expectedSymbols);
  });
});
