import { render, screen } from '@testing-library/react';
import App from './App';

test('renders service search heading', () => {
  render(<App />);
  const heading = screen.getByText(/what do you need/i);
  expect(heading).toBeInTheDocument();
});
