import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders RestaurantListPage by default', () => {
    render(<App />);
    // The RestaurantListPage renders the heading "我的美食清單"
    expect(screen.getByText('我的美食清單')).toBeInTheDocument();
  });

  it('renders NavigationBar', () => {
    render(<App />);
    expect(screen.getByLabelText('餐廳清單')).toBeInTheDocument();
    expect(screen.getByLabelText('美食轉盤')).toBeInTheDocument();
  });
});
