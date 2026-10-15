import type { Meta, StoryObj } from "@storybook/react-vite";
import Dashboard from "./Dashboard";
import { AreaChart, BarChart, DonutChart, LineChart, MetricCard, RankingCard } from "./dashboard.presets";

const payload = { labels: ["Seg", "Ter", "Qua", "Qui", "Sex"], series: [{ name: "Geração", values: [12, 18, 14, 22, 25] }] };
const distribution = {
  items: [
    { label: "Instalação", value: 42 },
    { label: "Manutenção", value: 30 },
    { label: "Revisão", value: 28 },
  ],
};
const meta = { title: "Dashboard/KPIs", component: Dashboard, parameters: { layout: "fullscreen" } } satisfies Meta<typeof Dashboard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const MetricLayouts: Story = {
  render: () => (
    <Dashboard className="p-6">
      <MetricCard
        title="Tendência lateral"
        payload={{ value: 91, context: "Total no período selecionado", trend: payload }}
        className="md:col-span-3"
      />
      <MetricCard
        title="Tendência no rodapé"
        trendPosition="bottom"
        payload={{ value: 91, context: "Total no período selecionado", trend: payload }}
        className="md:col-span-3"
      />
      <MetricCard title="Ofertas ativas" payload={{ value: 24, context: "Publicadas no marketplace" }} className="md:col-span-3" />
      <MetricCard title="Solicitações pendentes" payload={{ value: 8, context: "Aguardando análise" }} className="md:col-span-3" />
    </Dashboard>
  ),
};

export const ColorModes: Story = {
  render: () => (
    <Dashboard className="p-6">
      <DonutChart title="Cores distintas" payload={distribution} monochromatic={false} className="md:col-span-6" />
      <DonutChart title="Monocromático" payload={distribution} monochromatic className="md:col-span-6" />
    </Dashboard>
  ),
};

export const Overview: Story = {
  render: () => (
    <Dashboard className="p-6">
      <MetricCard
        title="Geração"
        unit="kWh"
        payload={{ value: 91, change: { percent: 12.5, favorable: "increase", label: "Comparado ao período anterior" }, trend: payload }}
        className="md:col-span-3"
      />
      <MetricCard title="Eficiência" unit="%" payload={{ value: 22.3 }} className="md:col-span-3" />
      <MetricCard title="Carregando" loading payload={{ value: null }} className="md:col-span-3" />
      <MetricCard title="Sem medições" payload={{ value: null }} className="md:col-span-3" />
      <AreaChart title="Geração ao longo do tempo" unit="kWh" payload={payload} className="md:col-span-6 xl:col-span-8" />
      <DonutChart title="Distribuição" payload={distribution} className="md:col-span-6 xl:col-span-4" />
      <BarChart title="Comparação" payload={payload} className="md:col-span-6" />
      <RankingCard title="Mais procurados" payload={distribution} className="md:col-span-6" />
      <LineChart title="Evolução" payload={payload} className="md:col-span-6" />
      <LineChart title="Erro" error="Não foi possível carregar as medições." payload={{ labels: [], series: [] }} className="md:col-span-6" />
    </Dashboard>
  ),
};
