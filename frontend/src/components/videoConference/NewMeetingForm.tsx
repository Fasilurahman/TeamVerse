import React, { useEffect, useState } from 'react';
import { CheckCircle2, Globe, Lock, Folder } from 'lucide-react';
import type { NewMeetingFormData, IProjectWithTeamAndMembers } from '../../types';

interface NewMeetingFormProps {
  onSubmit: (formData: NewMeetingFormData) => void;
  onCancel: () => void;
  projects: IProjectWithTeamAndMembers[];
  currentUserId: string;
}

const formInitialState: NewMeetingFormData = {
  title: '',
  projectId: '',
  date: '',
  time: '',
  duration: '1',
  privacy: 'public',
  description: '',
  createdBy: '',
  teamMembers: [],
};

export const NewMeetingForm: React.FC<NewMeetingFormProps> = ({
  onSubmit,
  onCancel,
  projects,
  currentUserId
}) => {
  const [formData, setFormData] = useState<NewMeetingFormData>(formInitialState);
  useEffect(() => {
    if (currentUserId) {
      setFormData((prev:any) => ({
        ...prev,
        createdBy: currentUserId,
      }));
    }
  }, [currentUserId]);

  useEffect(() => {
    const selectedProject = projects.find((p: any) => p._id === formData.projectId);
    if (selectedProject) {
      setFormData((prev: any) => ({
        ...prev,
        teamMembers: selectedProject?.teamMembers.map((member: any) => member._id),
      }));
    }
  }, [formData.projectId, projects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Meeting Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
            placeholder="Enter meeting title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project
          </label>
          <div className="relative">
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white appearance-none"
              required
            >
              <option value="">Select a project</option>
              {projects.map((project,index) => (
                <option key={index} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Folder className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Duration (hours)
          </label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
          >
            <option value="0.5">30 minutes</option>
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Privacy
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={formData.privacy === 'public'}
                onChange={handleChange}
                className="text-indigo-500 focus:ring-indigo-500/50"
              />
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={formData.privacy === 'private'}
                onChange={handleChange}
                className="text-indigo-500 focus:ring-indigo-500/50"
              />
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Private</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white h-24 resize-none"
            placeholder="Enter meeting description"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Create Meeting
        </button>
      </div>
    </form>
  );
};