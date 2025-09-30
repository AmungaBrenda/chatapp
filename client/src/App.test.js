import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ChatApp login page', () => {
  render(<App />);
  const heading = screen.getByText(/Login to ChatApp/i);
  expect(heading).toBeInTheDocument();
});