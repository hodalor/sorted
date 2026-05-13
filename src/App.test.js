import { render, screen } from '@testing-library/react';
import App from './App';

test('renders overview heading', () => {
  render(<App />);
  const heading = screen.getByText(/overview/i);
  expect(heading).toBeInTheDocument();
});
