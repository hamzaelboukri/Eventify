import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('renders with base styles', () => {
      const { container } = render(<Card>Hover Card</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-md');
    });
  });

  describe('CardHeader', () => {
    it('renders header with children', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );
      expect(screen.getByText(/header content/i)).toBeInTheDocument();
    });

    it('has border bottom', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      expect(screen.getByText(/header/i)).toHaveClass('border-b');
    });
  });

  describe('CardContent', () => {
    it('renders content with children', () => {
      render(
        <Card>
          <CardContent>Main Content</CardContent>
        </Card>
      );
      expect(screen.getByText(/main content/i)).toBeInTheDocument();
    });

    it('has padding', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText(/content/i)).toHaveClass('px-6', 'py-4');
    });
  });

  describe('CardFooter', () => {
    it('renders footer with children', () => {
      render(
        <Card>
          <CardFooter>Footer Content</CardFooter>
        </Card>
      );
      expect(screen.getByText(/footer content/i)).toBeInTheDocument();
    });

    it('has background and border', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText(/footer/i)).toHaveClass('bg-gray-50', 'border-t');
    });
  });
});
