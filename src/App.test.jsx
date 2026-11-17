import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the recipe map heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /recipe map application/i });
  expect(heading).toBeInTheDocument();
});
