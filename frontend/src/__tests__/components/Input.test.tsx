import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('displays helper text when no error', () => {
    render(<Input label="Email" helperText="Enter your email" />);
    expect(screen.getByText(/enter your email/i)).toBeInTheDocument();
  });

  it('does not display helper text when there is an error', () => {
    render(<Input label="Email" error="Invalid email" helperText="Enter your email" />);
    expect(screen.queryByText(/enter your email/i)).not.toBeInTheDocument();
  });

  it('applies error styles when error is provided', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-red-500');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Email" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('passes through additional props', () => {
    render(<Input label="Email" type="email" disabled />);
    const input = screen.getByLabelText(/email/i);
    
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeDisabled();
  });
});
