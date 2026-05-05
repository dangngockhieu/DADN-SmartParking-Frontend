import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ParkingFlowChart({ hourlyFlow }) {
  const chartData = (hourlyFlow || []).map((item) => ({
    hour: item.hour,
    in: item.in,
    out: item.out,
  }));

  return (
    <section className="chart-card">
      <div className="section-heading">
        <h2>Thong ke xe ra vao trong ngay</h2>
        <span>So luong xe</span>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barSize={14}>
            <CartesianGrid stroke="#e7edf5" vertical={false} />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fill: '#7890a8' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7890a8' }} />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
              contentStyle={{
                border: '1px solid #e5edf6',
                borderRadius: 10,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
              }}
            />
            <Legend iconType="square" verticalAlign="bottom" wrapperStyle={{ paddingTop: 16 }} />
            <Bar dataKey="in" name="Xe vao" fill="#4ca3f1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="out" name="Xe ra" fill="#f5bd4f" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ParkingFlowChart;
