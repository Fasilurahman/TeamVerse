import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Crown, Check, Users, CreditCard, Zap, Star, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from '../components/Design/Sidebar';
import { toast } from "sonner";
import api from '../api/axiosInstance';
import { deleteSubscriptionPlan, getAllSubscriptionsPlans } from "../services/SubscriptionService";
import { Subscription } from "../types";
import { z } from "zod";


const subscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(20, "Name must be 100 characters or less"),
  price: z.number().min(0, "Price cannot be negative"),
  billingCycle: z.enum(["month", "year"], {
    errorMap: () => ({ message: "Billing cycle must be 'month' or 'year'" })
  }),
  features: z.array(z.string().min(1, "Feature cannot be empty")).min(1, "At least one feature is required"),
  isPopular: z.boolean(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  description: z.string().min(1, "Description is required").max(500, "Description must be 500 characters or less"),
  recommendedFor: z.string().min(1, "Recommended for is required").max(200, "Recommended for must be 200 characters or less"),
});

type SubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subscription?: Subscription | null;
  onSave: (subscription: Partial<Subscription>) => void;
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string }) => (
  <div className="bg-[#1A1F37] p-4 rounded-xl">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-lg font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, subscription, onSave }) => {
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: "",
    price: 0,
    billingCycle: "month",
    features: [],
    isPopular: false,
    color: "#6366F1",
    description: "",
    recommendedFor: ""
  });
  const [newFeature, setNewFeature] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof Subscription, string>>>({});

  useEffect(() => {
    if (subscription) {
      setFormData(subscription);
    } else {
      setFormData({
        name: "",
        price: 0,
        billingCycle: "month",
        features: [],
        isPopular: false,
        color: "#6366F1",
        description: "",
        recommendedFor: ""
      });
    }
    setErrors({});
  }, [subscription]);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  const validateStep = (step: number) => {
    try {
      const partialSchema = subscriptionSchema.partial();
      const fieldsToValidate = {
        1: ['name', 'description', 'recommendedFor'],
        2: ['price', 'billingCycle', 'color'],
        3: ['features', 'isPopular']
      }[step] as (keyof typeof subscriptionSchema._type)[];

      const stepSchema = partialSchema.pick(
        fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      );

      stepSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof Subscription, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof Subscription] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      subscriptionSchema.parse(formData);
      setErrors({});

      console.log("formData:", formData);
      console.log(subscription ? "Updating subscription..." : "Creating new subscription...");

      try {
        const url = subscription 
          ? `/subscriptions/${subscription._id}` 
          : "/subscriptions";                    

        const method = subscription ? "put" : "post"; 

        const response = await api({
          method,
          url,
          data: formData,
          headers: {
            "Content-Type": "application/json",
          },
        });

        onSave(response.data); 
        onClose(); 
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error saving subscription. Please try again.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof Subscription, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof Subscription] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Please correct the form errors");
      }
    }
  };

  const handleNext = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error("Please correct the form errors");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      const newFeatures = [...(formData.features || []), newFeature.trim()];
      setFormData({ ...formData, features: newFeatures });
      setNewFeature("");
      // Validate features immediately
      try {
        subscriptionSchema.shape.features.parse(newFeatures);
        setErrors((prev) => ({ ...prev, features: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({ ...prev, features: error.errors[0].message }));
        }
      }
    }
  };

  const removeFeature = (index: number) => {
    if (formData.features) {
      const newFeatures = [...formData.features];
      newFeatures.splice(index, 1);
      setFormData({ ...formData, features: newFeatures });
      // Validate features after removal
      try {
        subscriptionSchema.shape.features.parse(newFeatures);
        setErrors((prev) => ({ ...prev, features: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({ ...prev, features: error.errors[0].message }));
        }
      }
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? 'focus:ring-red-500 border-red-500' : 'focus:ring-purple-500'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className={`w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.description ? 'focus:ring-red-500 border-red-500' : 'focus:ring-purple-500'
                } h-24`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Recommended For</label>
              <input
                type="text"
                value={formData.recommendedFor}
                onChange={(e) => {
                  setFormData({ ...formData, recommendedFor: e.target.value });
                  setErrors((prev) => ({ ...prev, recommendedFor: undefined }));
                }}
                className={`w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.recommendedFor ? 'focus:ring-red-500 border-red-500' : 'focus:ring-purple-500'
                }`}
                placeholder="e.g., Small Teams, Enterprise, Startups"
              />
              {errors.recommendedFor && <p className="text-red-500 text-sm mt-1">{errors.recommendedFor}</p>}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Price</label>
              <select
                value={formData.price === 0 ? "Free" : "Paid"}
                onChange={(e) => {
                  if (e.target.value === "Free") {
                    setFormData({ ...formData, price: 0 });
                    setErrors((prev) => ({ ...prev, price: undefined }));
                  } else {
                    setFormData({ ...formData, price: undefined }); 
                  }
                }}
                className="w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              >
                <option value="Paid">Paid</option>
                <option value="Free">Free</option>
              </select>

              {formData.price !== 0 && (
                <div>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!isNaN(Number(value)) && Number(value) >= 0) {
                        setFormData({ ...formData, price: Number(value) });
                        setErrors((prev) => ({ ...prev, price: undefined }));
                      }
                    }}
                    className={`w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                      errors.price ? 'focus:ring-red-500 border-red-500' : 'focus:ring-purple-500'
                    }`}
                    placeholder="Enter price"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-400 mb-2">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => {
                  setFormData({ ...formData, billingCycle: e.target.value as "month" | "year" });
                  setErrors((prev) => ({ ...prev, billingCycle: undefined }));
                }}
                className={`w-full bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.billingCycle ? 'focus:ring-red-500 border-red-500' : 'focus:ring-purple-500'
                }`}
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
              {errors.billingCycle && <p className="text-red-500 text-sm mt-1">{errors.billingCycle}</p>}
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => {
                  setFormData({ ...formData, color: e.target.value });
                  setErrors((prev) => ({ ...prev, color: undefined }));
                }}
                className="w-full h-10 bg-[#111827] rounded-lg cursor-pointer"
              />
              {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Features</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 bg-[#111827] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add
                </button>
              </div>
              {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features}</p>}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.features?.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between bg-[#111827] px-4 py-2 rounded-lg"
                  >
                    <span className="text-white">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => {
                  setFormData({ ...formData, isPopular: e.target.checked });
                  setErrors((prev) => ({ ...prev, isPopular: undefined }));
                }}
                className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
              />
              <label className="text-gray-400">Mark as Popular</label>
            </div>
            {errors.isPopular && <p className="text-red-500 text-sm mt-1">{errors.isPopular}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A1F37] rounded-xl p-6 w-full max-w-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {subscription ? "Edit Subscription" : "Create New Subscription"}
        </h2>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center ${step !== 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step !== 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Basic Info</span>
            <span>Pricing</span>
            <span>Features</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors ${
                currentStep === 1 ? 'invisible' : ''
              }`}
            >
              Previous
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {currentStep === 3 ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {subscription ? "Update" : "Create"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const result = await getAllSubscriptionsPlans();
        console.log(result, 'response data');
        setSubscriptions(result);
      } catch (error) {
        console.error(error, 'error');
      }
    };
    fetchSubscriptions();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalRevenue = subscriptions.reduce((acc, sub) => acc + ((sub.price as number) * sub.activeUsers), 0);
  const totalUsers = subscriptions.reduce((acc, sub) => acc + sub.activeUsers, 0);
  const averageRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  const handleCreateSubscription = () => {
    setSelectedSubscription(null);
    setIsModalOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = async (id: string) => {
    console.log(id, 'id');
    console.log(subscriptions, 'subscription');
    try {
      const result = await deleteSubscriptionPlan(id);
      console.log(result, 'result');
      setSubscriptions(subscriptions.filter(sub => sub._id !== id));
      toast.success('Subscription deleted successfully');
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
    }
  };

  const handleSaveSubscription = (subscriptionData: Partial<Subscription>) => {
    try {
      subscriptionSchema.parse(subscriptionData);
      if (selectedSubscription) {
        console.log(subscriptionData, 'subscriptionData');
        console.log(selectedSubscription, 'selectedSubscription');
        setSubscriptions(subscriptions.map(sub =>
          sub._id === selectedSubscription._id ? { ...sub, ...subscriptionData } : sub
        ));
      } else {
        const newSubscription = {
          ...subscriptionData,
          id: Math.random().toString(36).substr(2, 9),
          activeUsers: 0
        } as Subscription;
        setSubscriptions([...subscriptions, newSubscription]);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error in handleSaveSubscription:", error.errors);
        toast.error("Invalid subscription data");
      }
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#111827]">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Subscription Plans</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#1A1F37] text-white pl-12 pr-4 py-2.5 rounded-xl w-[280px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <button
                onClick={handleCreateSubscription}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                <Plus size={20} />
                <span>New Plan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={CreditCard}
              color="bg-purple-500"
            />
            <StatCard
              title="Active Users"
              value={totalUsers.toLocaleString()}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Average Revenue/User"
              value={`$${averageRevenuePerUser.toFixed(2)}`}
              icon={BarChart}
              color="bg-green-500"
            />
            <StatCard
              title="Total Plans"
              value={subscriptions.length.toString()}
              icon={Star}
              color="bg-pink-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map((subscription, idx) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-[#1A1F37] rounded-xl overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{subscription.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{subscription.description}</p>
                    <div className="flex items-baseline mt-2">
                      <span className="text-3xl font-bold text-white">${subscription.price}</span>
                      <span className="text-gray-400 ml-2">/{subscription.billingCycle}</span>
                    </div>
                  </div>
                  {subscription.isPopular && (
                    <div className="bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Crown size={16} />
                      Popular
                    </div>
                  )}
                </div>

                <div className="bg-[#111827] rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Zap size={16} className="text-yellow-500" />
                    <span>Recommended for:</span>
                    <span className="text-white font-medium">{subscription.recommendedFor}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-300">
                      <Check size={18} className="text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>Active Users</span>
                  </div>
                  {/* <span className="font-medium text-white">{subscription.activeUsers.toLocaleString()}</span> */}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubscription(subscription)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubscription(subscription._id ?? '')}
                    className="flex items-center justify-center p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <SubscriptionModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedSubscription(null);
              }}
              subscription={selectedSubscription}
              onSave={handleSaveSubscription}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SubscriptionsPage;
