import { render, screen } from '@testing-library/react';
import App from './App';

test('renders operations dashboard heading', () => {
  render(<App />);
  const heading = screen.getByText(/operations dashboard/i);
  expect(heading).toBeInTheDocument();
});
