import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ObjectInfoPanel } from './ObjectInfoPanel';
import { useExplorerStore } from '../stores/useExplorerStore';

afterEach(() => {
  useExplorerStore.getState().selectObject('earth');
});

describe('ObjectInfoPanel', () => {
  it('links from the Sun to the planet catalog instead of the moon catalog', () => {
    useExplorerStore.getState().selectObject('sun');
    render(<MemoryRouter><ObjectInfoPanel /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /view all 8 planets/i })).toHaveAttribute('href', '/planets');
    expect(screen.queryByRole('link', { name: /view all 8 moons/i })).not.toBeInTheDocument();
  });
});
