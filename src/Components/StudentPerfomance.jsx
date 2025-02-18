import React from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const StudentPerformanceChart = ({ studentPercentage }) => {
  const data = [{ name: "Performance", percentage: parseFloat(studentPercentage) }];

  return (
    <div className="w-[100%]">
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="percentage" fill="#4A90E2" barSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentPerformanceChart;
