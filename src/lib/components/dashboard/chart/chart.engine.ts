import { init, use as register } from "echarts/core";
import { LineChart, BarChart, PieChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

register([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);
export { init };
