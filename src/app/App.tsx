import { useState, useId } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

type ItemType = "pro" | "contra";

interface Item {
  id: string;
  label: string;
  type: ItemType;
  weight: number;
}

type ChartType = "bar" | "pie";

const PRO_COLOR = "#6b8f71";
const CONTRA_COLOR = "#c97b4b";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function WeightSlider({
  value,
  onChange,
  type,
}: {
  value: number;
  onChange: (v: number) => void;
  type: ItemType;
}) {
  const color = type === "pro" ? PRO_COLOR : CONTRA_COLOR;
  const pct = ((value - 1) / 9) * 100;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-medium text-muted-foreground w-4 text-center shrink-0">1</span>
      <div className="relative flex-1 h-8 flex items-center group cursor-pointer">
        <div className="w-full h-2 rounded-full bg-muted relative overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute w-5 h-5 rounded-full shadow-md border-2 border-white transition-all duration-100 pointer-events-none"
          style={{
            left: `calc(${pct}% - 10px)`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-4 text-center shrink-0">10</span>
      <span
        className="text-sm font-semibold w-6 text-center shrink-0"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function ItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item;
  onUpdate: (updated: Partial<Item>) => void;
  onDelete: () => void;
}) {
  const isPro = item.type === "pro";

  return (
    <div
      className="rounded-2xl p-4 border transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: isPro ? "rgba(107,143,113,0.07)" : "rgba(201,123,75,0.07)",
        borderColor: isPro ? "rgba(107,143,113,0.25)" : "rgba(201,123,75,0.25)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Type toggle */}
        <button
          onClick={() => onUpdate({ type: isPro ? "contra" : "pro" })}
          className="shrink-0 mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ backgroundColor: isPro ? PRO_COLOR : CONTRA_COLOR }}
          title="Cambiar a pro/contra"
        >
          {isPro ? "+" : "−"}
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Describe este punto..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none border-b border-transparent focus:border-border transition-colors pb-0.5"
          />

          <div className="mt-3">
            <span className="text-xs text-muted-foreground mb-1.5 block">
              Importancia
            </span>
            <WeightSlider
              value={item.weight}
              onChange={(w) => onUpdate({ weight: w })}
              type={item.type}
            />
          </div>
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-sm text-foreground">
        <span className="font-medium">{payload[0].name}: </span>
        <span>{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [items, setItems] = useState<Item[]>([
    { id: uid(), label: "Ahorra tiempo", type: "pro", weight: 8 },
    { id: uid(), label: "Es costoso", type: "contra", weight: 6 },
    { id: uid(), label: "Fácil de aprender", type: "pro", weight: 5 },
  ]);
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [topic, setTopic] = useState("¿Debo hacerlo?");

  const addItem = (type: ItemType) => {
    setItems((prev) => [
      ...prev,
      { id: uid(), label: "", type, weight: 5 },
    ]);
  };

  const updateItem = (id: string, changes: Partial<Item>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const prosTotal = items
    .filter((i) => i.type === "pro")
    .reduce((sum, i) => sum + i.weight, 0);
  const contraTotal = items
    .filter((i) => i.type === "contra")
    .reduce((sum, i) => sum + i.weight, 0);
  const total = prosTotal + contraTotal;

  const barData = [{ name: "Resultado", pros: prosTotal, contras: contraTotal }];

  const pieData = [
    { name: "Pros", value: prosTotal },
    { name: "Contras", value: contraTotal },
  ];

  const proItems = items.filter((i) => i.type === "pro");
  const contraItems = items.filter((i) => i.type === "contra");

  const winner =
    prosTotal > contraTotal
      ? "pros"
      : contraTotal > prosTotal
      ? "contras"
      : "empate";

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "linear-gradient(145deg, #fdf8f0 0%, #f5e8d5 50%, #fdf0e8 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl md:text-5xl font-semibold text-foreground mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Balanza de decisiones
          </h1>
          <p className="text-muted-foreground text-base">
            Pondera lo que importa y toma mejores decisiones
          </p>
        </div>

        {/* Topic input */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-center text-lg font-medium bg-card border border-border rounded-2xl px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-sm"
              placeholder="¿Qué estás evaluando?"
            />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pros column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PRO_COLOR }}
                />
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif", color: PRO_COLOR }}
                >
                  Pros
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({proItems.length})
                </span>
              </div>
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(107,143,113,0.15)", color: PRO_COLOR }}
              >
                Total: {prosTotal}
              </span>
            </div>

            {proItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onUpdate={(changes) => updateItem(item.id, changes)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}

            <button
              onClick={() => addItem("pro")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium border-2 border-dashed transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                borderColor: "rgba(107,143,113,0.4)",
                color: PRO_COLOR,
                backgroundColor: "rgba(107,143,113,0.04)",
              }}
            >
              <Plus size={16} />
              Agregar pro
            </button>
          </div>

          {/* Contras column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CONTRA_COLOR }}
                />
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif", color: CONTRA_COLOR }}
                >
                  Contras
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({contraItems.length})
                </span>
              </div>
              <span
                className="text-sm font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(201,123,75,0.15)", color: CONTRA_COLOR }}
              >
                Total: {contraTotal}
              </span>
            </div>

            {contraItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onUpdate={(changes) => updateItem(item.id, changes)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}

            <button
              onClick={() => addItem("contra")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium border-2 border-dashed transition-all duration-200 hover:opacity-80 active:scale-95"
              style={{
                borderColor: "rgba(201,123,75,0.4)",
                color: CONTRA_COLOR,
                backgroundColor: "rgba(201,123,75,0.04)",
              }}
            >
              <Plus size={16} />
              Agregar contra
            </button>
          </div>
        </div>

        {/* Chart section */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2
                className="text-xl font-semibold text-foreground"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Resultado ponderado
              </h2>
              {total > 0 && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {winner === "empate"
                    ? "Está en empate — ¡decisión difícil!"
                    : winner === "pros"
                    ? `Los pros llevan la delantera por ${prosTotal - contraTotal} puntos`
                    : `Los contras pesan más por ${contraTotal - prosTotal} puntos`}
                </p>
              )}
            </div>

            {/* Chart type toggle */}
            <div
              className="flex rounded-xl p-1 gap-1"
              style={{ backgroundColor: "rgba(44,26,14,0.06)" }}
            >
              {(["bar", "pie"] as ChartType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    chartType === type
                      ? {
                          backgroundColor: "#fffcf5",
                          color: "#2c1a0e",
                          boxShadow: "0 1px 4px rgba(44,26,14,0.12)",
                        }
                      : { color: "#7a6a5a" }
                  }
                >
                  {type === "bar" ? "Barras" : "Torta"}
                </button>
              ))}
            </div>
          </div>

          {total === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Agrega items para ver la gráfica
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              {chartType === "bar" ? (
                <BarChart data={barData} barCategoryGap="40%" barGap={8}>
                  <XAxis
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#7a6a5a", fontSize: 12, fontFamily: "DM Sans" }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(44,26,14,0.04)" }} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#7a6a5a", fontSize: 13, fontFamily: "DM Sans" }}>
                        {value === "pros" ? "Pros" : "Contras"}
                      </span>
                    )}
                  />
                  <Bar dataKey="pros" name="Pros" fill={PRO_COLOR} radius={[10, 10, 0, 0]} maxBarSize={100} />
                  <Bar dataKey="contras" name="Contras" fill={CONTRA_COLOR} radius={[10, 10, 0, 0]} maxBarSize={100} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    <Cell fill={PRO_COLOR} />
                    <Cell fill={CONTRA_COLOR} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: "#7a6a5a", fontSize: 13, fontFamily: "DM Sans" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          )}

          {/* Score bars */}
          {total > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: PRO_COLOR }}>
                  Pros {prosTotal}
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(prosTotal / (total || 1)) * 100}%`, backgroundColor: PRO_COLOR }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 shrink-0">
                  {Math.round((prosTotal / total) * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-14 text-right shrink-0" style={{ color: CONTRA_COLOR }}>
                  Contras {contraTotal}
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(contraTotal / (total || 1)) * 100}%`, backgroundColor: CONTRA_COLOR }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-10 shrink-0">
                  {Math.round((contraTotal / total) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
