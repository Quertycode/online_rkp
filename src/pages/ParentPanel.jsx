import React from "react";
import Card from "../components/Card";

export default function ParentPanel() {
  const childStats = [
    {
      child: "student1",
      progress: "67%",
      math: "60%",
      russian: "75%",
      completed: 14,
    },
    {
      child: "student2",
      progress: "42%",
      math: "40%",
      russian: "44%",
      completed: 9,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Панель родителя</h2>

      {childStats.map((c, i) => (
        <Card key={i} title={`Ученик: ${c.child}`}>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Общий прогресс: {c.progress}</p>
            <p>Математика: {c.math}</p>
            <p>Русский язык: {c.russian}</p>
            <p>Пройдено заданий: {c.completed}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
