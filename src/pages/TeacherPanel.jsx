import React from "react";
import Card from "../components/Card";
import tasksData from "../data/tasks.json";
import coursesData from "../data/courses.json";

export default function TeacherPanel() {
  return (
    <div className="container max-w-[1280px] mx-auto px-6 py-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Панель учителя</h1>

      <Card title="Домашние задания по курсам">
        <div className="space-y-6">
          {Object.entries(coursesData).map(([key, course]) => (
            <div key={key} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h3 className="font-semibold mb-3 text-lg text-cyan-800">{course.title}</h3>
              <div className="space-y-4">
                {course.lessons.map((lesson) => (
                  <div key={lesson.id} className="ml-4">
                    <p className="font-medium mb-2 text-gray-800">{lesson.title}</p>
                    {lesson.homework && lesson.homework.length > 0 ? (
                      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                        {lesson.homework.map((id) => {
                          const task = tasksData.find((t) => t.id === id);
                          return (
                            <li key={id}>{task?.question || "— вопрос не найден —"}</li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 ml-5">Нет домашних заданий</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Комментарии к работам (в будущем)">
        <p className="text-gray-600 text-sm">
          Здесь будет возможность оставлять комментарии к домашним заданиям
          учеников и отмечать их как «Принято» или «Требует доработки».
        </p>
      </Card>
    </div>
  );
}
