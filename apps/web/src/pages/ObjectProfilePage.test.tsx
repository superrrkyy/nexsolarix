import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ObjectProfilePage } from './ObjectProfilePage';

describe('ObjectProfilePage', () => {
  it('links habitability context to the fact-specific source', () => {
    render(
      <MemoryRouter initialEntries={['/objects/europa']}>
        <Routes>
          <Route path="/objects/:id" element={<ObjectProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    const habitabilityCard = screen.getByText('HABITABILITY').closest('article');
    expect(habitabilityCard).not.toBeNull();
    expect(within(habitabilityCard!).getByRole('link', { name: /read source/i }))
      .toHaveAttribute('href', 'https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/');
  });
});
