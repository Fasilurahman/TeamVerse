import React from "react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "pending";
  team: { name: string; avatar: string }[];
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition duration-300 cursor-pointer"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
          <p className="text-gray-600 mt-1 text-sm">{project.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm capitalize ${
            project.status === "active"
              ? "bg-green-100 text-green-800"
              : project.status === "completed"
              ? "bg-blue-100 text-blue-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {project.status}
        </span>
      </div>
      <div className="mt-4 flex -space-x-2">
        {project.team.slice(0, 3).map((member, index) => (
          <img
            key={index}
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
        ))}
        {project.team.length > 3 && (
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm">
            +{project.team.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
