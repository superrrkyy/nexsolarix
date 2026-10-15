import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { getObject } from '@nexsolarix/astronomy';
import { ObjectCard } from './ObjectCard';

 describe('ObjectCard', () => {
  it('exposes a profile link with object identity and a quick fact', () => {
    const earth = getObject('earth')!;
    render(<MemoryRouter><ObjectCard object={earth} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Earth/i })).toHaveAttribute('href', '/objects/earth');
    expect(screen.getByText('1.0000')).toBeInTheDocument();
    expect(screen.getByText('Terrestrial planet')).toBeInTheDocument();
  });
});
