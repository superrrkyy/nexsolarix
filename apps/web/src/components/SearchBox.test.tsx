import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SearchBox } from './SearchBox';

describe('SearchBox', () => {
  it('keeps autocomplete controls unique and exposes the active option', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><><SearchBox /><SearchBox /></></MemoryRouter>);

    const inputs = screen.getAllByRole('searchbox');
    expect(inputs).toHaveLength(2);
    await user.type(inputs[0], 'Earth');
    const firstListbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    const firstListboxId = firstListbox.id;
    expect(inputs[0]).toHaveAttribute('aria-controls', firstListboxId);

    await user.type(inputs[1], 'Mars');
    const secondListbox = screen.getByRole('listbox', { name: 'Search suggestions' });
    expect(secondListbox.id).not.toBe(firstListboxId);
    expect(inputs[0]).toHaveAttribute('aria-expanded', 'false');
    expect(inputs[1]).toHaveAttribute('aria-expanded', 'true');
    expect(inputs[1]).toHaveAttribute('aria-controls', secondListbox.id);

    await user.keyboard('{ArrowDown}');
    const activeOption = document.getElementById(inputs[1].getAttribute('aria-activedescendant') ?? '');
    expect(activeOption).toHaveAttribute('role', 'option');
    expect(activeOption).toHaveAttribute('aria-selected', 'true');
    expect(activeOption).toHaveTextContent(/^Mars/);
  });
});
