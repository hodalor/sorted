import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign up button', () => {
  render(<App />);
  const button = screen.getByText(/sign up/i);
  expect(button).toBeInTheDocument();
});
