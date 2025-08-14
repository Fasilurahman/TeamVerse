import React, { useEffect, useState } from "react";
import { CheckCircle2, Globe, Lock, Folder } from "lucide-react";
import { z } from "zod";
import type { NewMeetingFormData, IProjectWithTeamAndMembers } from "../../types";


const NewMeetingFormSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  projectId: z.string().min(1, "Project is required"),
  date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().min(1, "Time is required").regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  duration: z.enum(["0.5", "1", "1.5", "2"], {
    errorMap: () => ({ message: "Duration must be 30 minutes, 1 hour, 1.5 hours, or 2 hours" }),
  }),
  privacy: z.enum(["public", "private"], {
    errorMap: () => ({ message: "Privacy must be either public or private" }),
  }),
  description: z.string().optional(),
  createdBy: z.string().min(1, "Creator ID is required"),
  teamMembers: z.array(z.string()).optional(),
});

interface NewMeetingFormProps {
  onSubmit: (formData: NewMeetingFormData) => Promise<void>;
  onCancel: () => void;
  projects: IProjectWithTeamAndMembers[];
  currentUserId: string;
}

const formInitialState: NewMeetingFormData = {
  title: "",
  projectId: "",
  date: "",
  time: "",
  duration: "1",
  privacy: "public",
  description: "",
  createdBy: "",
  teamMembers: [],
};

export const NewMeetingForm: React.FC<NewMeetingFormProps> = ({
  onSubmit,
  onCancel,
  projects,
  currentUserId,
}) => {
  const [formData, setFormData] = useState<NewMeetingFormData>(formInitialState);
  const [errors, setErrors] = useState<Partial<Record<keyof NewMeetingFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      setFormData((prev:any) => ({
        ...prev,
        createdBy: currentUserId,
      }));
      // Validate createdBy in real-time
      try {
        NewMeetingFormSchema.shape.createdBy.parse(currentUserId);
        setErrors((prev) => ({ ...prev, createdBy: undefined }));
      } catch (err) {
        if (err instanceof z.ZodError) {
          setErrors((prev) => ({ ...prev, createdBy: err.errors[0].message }));
        }
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    const selectedProject = projects.find((p) => p._id === formData.projectId);
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: selectedProject.teamMembers.map((member) => member._id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [],
      }));
    }
    // Validate teamMembers in real-time
    try {
      NewMeetingFormSchema.shape.teamMembers.parse(
        selectedProject ? selectedProject.teamMembers.map((member) => member._id) : []
      );
      setErrors((prev) => ({ ...prev, teamMembers: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, teamMembers: err.errors[0].message }));
      }
    }
  }, [formData.projectId, projects]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Validate field in real-time
    try {
      NewMeetingFormSchema.shape[name as keyof NewMeetingFormData].parse(value);
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: err.errors[0].message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate entire form data
      NewMeetingFormSchema.parse(formData);
      setErrors({});
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof NewMeetingFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof NewMeetingFormData;
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error("Unexpected error during submission:", error);
        setErrors({ title: "An unexpected error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
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
            className={`w-full px-4 py-2 bg-slate-800/50 border ${
              errors.title ? "border-red-500" : "border-slate-700/50"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white`}
            placeholder="Enter meeting title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
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
              className={`w-full px-4 py-2 bg-slate-800/50 border ${
                errors.projectId ? "border-red-500" : "border-slate-700/50"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white appearance-none`}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Folder className="w-4 h-4 text-slate-400" />
            </div>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>
            )}
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
              className={`w-full px-4 py-2 bg-slate-800/50 border ${
                errors.date ? "border-red-500" : "border-slate-700/50"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
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
              className={`w-full px-4 py-2 bg-slate-800/50 border ${
                errors.time ? "border-red-500" : "border-slate-700/50"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white`}
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-500">{errors.time}</p>
            )}
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
            className={`w-full px-4 py-2 bg-slate-800/50 border ${
              errors.duration ? "border-red-500" : "border-slate-700/50"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white`}
          >
            <option value="0.5">30 minutes</option>
            <option value="1">1 hour</option>
            <option value="1.5">1.5 hours</option>
            <option value="2">2 hours</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
          )}
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
                checked={formData.privacy === "public"}
                onChange={handleChange}
                className={`text-indigo-500 focus:ring-indigo-500/50 ${
                  errors.privacy ? "border-red-500" : ""
                }`}
              />
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Public</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={formData.privacy === "private"}
                onChange={handleChange}
                className={`text-indigo-500 focus:ring-indigo-500/50 ${
                  errors.privacy ? "border-red-500" : ""
                }`}
              />
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Private</span>
            </label>
          </div>
          {errors.privacy && (
            <p className="mt-1 text-sm text-red-500">{errors.privacy}</p>
          )}
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
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {errors.teamMembers && (
          <p className="text-sm text-red-500">{errors.teamMembers}</p>
        )}
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
          disabled={isSubmitting}
          className={`px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isSubmitting ? "Creating..." : "Create Meeting"}
        </button>
      </div>
    </form>
  );
};
