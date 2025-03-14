import React from 'react';

const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null
};

export const BrowserRouter = ({ children }) => <div data-testid="mock-browser-router">{children}</div>;
export const Routes = ({ children }) => <div data-testid="mock-routes">{children}</div>;
export const Route = ({ element }) => <div data-testid="mock-route">{element}</div>;
export const Navigate = ({ to }) => <div data-testid="mock-navigate">Redirecting to {to}</div>;
export const Link = ({ to, children, ...props }) => (
  <a data-testid="mock-link" href={to} {...props}>
    {children}
  </a>
);
export const useNavigate = () => mockNavigate;
export const useLocation = () => mockLocation;

// Allow tests to reset the mock navigate function
export const resetMockNavigate = () => {
  mockNavigate.mockClear();
};