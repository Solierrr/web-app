import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import SolarPanelFeed from './SolarPanelFeed'

vi.mock('@/service/feed/solarPanel.service', () => ({
  getSolarPanels: vi.fn(),
}))

import { getSolarPanels } from '@/service/feed/solarPanel.service'
import type { SolarPanelAnnouncement } from '@/domain/models/announcemnt/solarPanel'
import ModelStatus from '@/domain/enum/modelStatus'

const mockedGetSolarPanels = vi.mocked(getSolarPanels)

const items: SolarPanelAnnouncement[] = [
  {
    id: '1',
    supplierId: 'supplier-1',
    panel: { id: 'panel-1', status: ModelStatus.Approved },
    title: 'Coletor Solar Térmico Vertical De Cobre',
    description: 'Descrição',
    unitPrice: 200,
    availableUnits: 10,
    serviceRegions: [],
    photos: { heroImage: { description: 'Placa solar', url: 'https://example.com/1.png' }, otherImages: [] },
  },
]

describe('SolarPanelFeed', () => {
  beforeEach(() => {
    mockedGetSolarPanels.mockReset()
  })

  it('renders the page heading and tabs', () => {
    mockedGetSolarPanels.mockResolvedValue([])

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Placas Solares' })).toBeInTheDocument()
    expect(screen.getByText('placas solares')).toBeInTheDocument()
    expect(screen.getByText('serviços')).toBeInTheDocument()
    expect(screen.getByText('fornecedores')).toBeInTheDocument()
  })

  it('renders the mocked solar panels inside the feed corridors', async () => {
    mockedGetSolarPanels.mockResolvedValue(items)

    render(
      <MemoryRouter>
        <SolarPanelFeed />
      </MemoryRouter>,
    )

    expect(await screen.findAllByText('Coletor Solar Térmico Vertical De Cobre')).toHaveLength(2)
  })
})
