import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Briefcase,
  Clock,
  Users,
  BarChart3,
  ChevronDown,
  Play,
  Sparkles,
  Star,
  ArrowRight,
  Quote,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Brain,
  Target,
  Award,
} from "lucide-react";
import { FeatureCard } from "../components/Home/FeatureCard";
import { PricingCard } from "../components/Home/PricingCard";
import { Stat } from "../components/Home/Stat";
import { VideoModal } from "../components/Home/VideoModalProps";
import type { TestimonialProps, Subscription } from "../types";
import api from "../api/axiosInstance";

const testimonials: TestimonialProps[] = [
  {
    content:
      "Project Nexus has transformed how our team collaborates. The AI-powered insights have helped us deliver projects 50% faster.",
    author: "Sarah Chen",
    role: "CTO",
    company: "TechCorp",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    content:
      "The best project management tool we've ever used. It's intuitive, powerful, and the analytics are game-changing.",
    author: "Michael Rodriguez",
    role: "Product Manager",
    company: "InnovateLabs",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    content:
      "Since implementing TaskFlow, our team productivity has increased by 200%. The ROI has been incredible.",
    author: "Emily Watson",
    role: "Director of Operations",
    company: "GlobalTech",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

const features = [
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Time Tracking",
    description:
      "Track time spent on tasks and projects with precision and automated reminders",
    image:
      "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=500",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Team Collaboration",
    description:
      "Work together seamlessly with real-time updates and smart notifications",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=500",
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "AI Analytics",
    description:
      "Get AI-powered insights into project progress and team performance",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=500",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Smart Planning",
    description:
      "AI-assisted project planning with intelligent resource allocation",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=500",
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: "Quick Launch",
    description: "Get started in minutes with our intuitive onboarding process",
    image:
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=500",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Goal Tracking",
    description: "Set and monitor team objectives with our OKR framework",
    image:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&q=80&w=500",
  },
];

const Home: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1 });
  const [pricingRef, pricingInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["features", "testimonials", "pricing"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(current || "");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.setAttribute("data-id", "6686243722");
    script.id = "chatling-embed-script";

    document.body.appendChild(script);

    return () => {
      document.getElementById("chatling-embed-script")?.remove();
    };
  }, []);

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get("/subscriptions");
        console.log(response.data, "response data");
        setSubscriptions(response.data);
      } catch (error) {
        console.error(error, "error");
      }
    };
    fetchSubscriptions();
  }, []);

  const categorizeFeatures = (subscriptions: any) => {
    const sortedPlans = [...subscriptions].sort((a, b) => a.price - b.price);
    return sortedPlans;
  };

  const sortedPlans = categorizeFeatures(subscriptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Briefcase className="h-8 w-8 text-indigo-600" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
                </motion.div>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Project Nexus
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {["Features", "Testimonials", "Pricing"].map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  whileHover={{ scale: 1.1 }}
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    activeSection === item.toLowerCase()
                      ? "text-indigo-600 font-semibold"
                      : ""
                  }`}
                >
                  {item}
                </motion.a>
              ))}
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.header
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: heroInView ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative pt-20 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
            alt="Team collaboration"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 mix-blend-overlay" />
        </motion.div>

        <div className="container mx-auto px-6 pt-20 pb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full px-4 py-2 mb-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Star className="h-4 w-4 text-yellow-500" />
              </motion.div>
              <span className="ml-2 text-indigo-800 font-medium">
                New: AI-Powered Project Insights
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight"
            >
              Manage Projects with
              <span className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  {" "}
                  Confidence
                </span>
                <motion.div
                  animate={{
                    width: ["0%", "100%", "0%"],
                    left: ["0%", "0%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute bottom-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Streamline your workflow, boost team collaboration, and deliver
              projects on time with our powerful project management solution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    animate={{
                      x: ["0%", "100%"],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  />
                  <span className="relative flex items-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-all transform flex items-center justify-center"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="10k+" label="Active Users" delay={100} />
              <Stat value="1M+" label="Tasks Completed" delay={200} />
              <Stat value="99.9%" label="Uptime" delay={300} />
              <Stat value="24/7" label="Support" delay={400} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-16"
            >
              <p className="text-sm text-gray-500 mb-4">
                Trusted by leading companies worldwide
              </p>
              <div className="flex justify-center items-center space-x-8 grayscale opacity-50">
                <motion.img
                  whileHover={{ scale: 1.1, filter: "grayscale(0)" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                  alt="Amazon"
                  className="h-8"
                />
                <motion.img
                  whileHover={{ scale: 1.1, filter: "grayscale(0)" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                  alt="Google"
                  className="h-8"
                />
                <motion.img
                  whileHover={{ scale: 1.1, filter: "grayscale(0)" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
                  alt="Netflix"
                  className="h-6"
                />
                <motion.img
                  whileHover={{ scale: 1.1, filter: "grayscale(0)" }}
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Slack_RGB.svg"
                  alt="Slack"
                  className="h-7"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 right-0 flex justify-center"
        >
          <ChevronDown className="h-8 w-8 text-gray-400" />
        </motion.div>
      </motion.header>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: featuresInView ? 1 : 0 }}
        transition={{ duration: 1 }}
        id="features"
        className="py-20 bg-white relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/70 via-transparent to-purple-50/70" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: featuresInView ? 1 : 0,
                y: featuresInView ? 0 : 20,
              }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center bg-indigo-50 px-4 py-2 rounded-full mb-4"
            >
              <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-semibold">Features</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: featuresInView ? 1 : 0,
                y: featuresInView ? 0 : 20,
              }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4"
            >
              Everything you need to succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: featuresInView ? 1 : 0,
                y: featuresInView ? 0 : 20,
              }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Powerful tools and intelligent features designed to transform your
              workflow
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 100} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: testimonialsInView ? 1 : 0 }}
        transition={{ duration: 1 }}
        id="testimonials"
        className="py-24 relative overflow-hidden"
      >
        {/* Enhanced background with animated particles */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-purple-100/40">
          <div className="testimonial-particles" />{" "}
          {/* Requires additional particle JS library */}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-12 left-12 w-24 h-24 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 rounded-full blur-xl" />
        <div className="absolute bottom-12 right-12 w-32 h-32 bg-gradient-to-l from-indigo-300/20 to-purple-300/20 rounded-full blur-xl" />

        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: testimonialsInView ? 1 : 0,
                y: testimonialsInView ? 0 : 20,
              }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-2.5 rounded-full mb-5 shadow-sm"
            >
              <Quote className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-semibold tracking-wide">
                Client Stories
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: testimonialsInView ? 1 : 0,
                y: testimonialsInView ? 0 : 20,
              }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 mt-3 mb-5"
            >
              Loved by teams worldwide
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: testimonialsInView ? 1 : 0,
                y: testimonialsInView ? 0 : 20,
              }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              See what our customers have to say about their transformative
              experience
            </motion.p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Testimonial indicators */}
            <div className="flex justify-center mb-12">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`mx-2 w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index
                      ? "bg-indigo-600 scale-125"
                      : "bg-gray-300 hover:bg-indigo-300"
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>

            <div className="relative">
              {/* Enhanced navigation buttons */}
              <div className="flex items-center justify-between absolute top-1/2 -translate-y-1/2 w-full z-10">
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-indigo-50 transition-all duration-300 transform -translate-x-5"
                >
                  <ChevronLeft className="h-6 w-6 text-indigo-700" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-indigo-50 transition-all duration-300 transform translate-x-5"
                >
                  <ChevronRight className="h-6 w-6 text-indigo-700" />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5,
                  }}
                  className="bg-white rounded-2xl shadow-xl p-10 md:p-14 border border-indigo-50"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-lg transform rotate-3" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg transform -rotate-1" />
                  </div>

                  <p className="text-xl md:text-2xl text-gray-700 mb-10 italic leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </p>

                  <div className="flex items-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full transform translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-300" />
                      <motion.img
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        src={testimonials[currentTestimonial].image}
                        alt={testimonials[currentTestimonial].author}
                        className="relative w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                      />
                    </div>

                    <div className="ml-5">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {testimonials[currentTestimonial].author}
                      </h4>
                      <p className="text-gray-600">
                        {testimonials[currentTestimonial].role} at{" "}
                        <span className="text-indigo-700 font-medium">
                          {testimonials[currentTestimonial].company}
                        </span>
                      </p>
                    </div>

                    <div className="ml-auto">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-5 w-5 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Company logo */}
                  {testimonials[currentTestimonial].companyLogo && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <img
                        src={testimonials[currentTestimonial].companyLogo}
                        alt={`${testimonials[currentTestimonial].company} logo`}
                        className="h-8 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Additional trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: testimonialsInView ? 1 : 0,
                y: testimonialsInView ? 0 : 20,
              }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 text-center"
            >
              <p className="text-gray-500 mb-6">
                Trusted by over 1,000+ companies worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
                {/* Replace with actual company logos */}
                {/* <div className="h-8 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-28 bg-gray-200 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-gray-200 rounded"></div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        ref={pricingRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: pricingInView ? 1 : 0 }}
        transition={{ duration: 1 }}
        id="pricing"
        className="py-20 bg-gray-50 relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-50" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: pricingInView ? 1 : 0,
                y: pricingInView ? 0 : 20,
              }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center bg-indigo-50 px-4 py-2 rounded-full mb-4"
            >
              <Award className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-semibold">Pricing</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: pricingInView ? 1 : 0,
                y: pricingInView ? 0 : 20,
              }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4"
            >
              Choose your plan
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: pricingInView ? 1 : 0,
                y: pricingInView ? 0 : 20,
              }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Flexible pricing options to match your team's needs
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {subscriptions.length > 0 ? (
              sortedPlans.map((sub) => {
                const includedFeatures: Set<string> = new Set(sub.features || []);

                const higherTierPlans = sortedPlans.filter(
                  (plan) => plan.price > sub.price
                );

                const missingFeatures: string[] = [];

                higherTierPlans.forEach((higherPlan) => {
                  (higherPlan.features || []).forEach((feature: any) => {
                    if (
                      !includedFeatures.has(feature) &&
                      !missingFeatures.includes(feature)
                    ) {
                      missingFeatures.push(feature);
                    }
                  });
                });

                return (
                  <PricingCard
                    key={sub._id}
                    id={sub.stripePriceId}
                    title={sub.name}
                    price={sub.price === 0 ? "Free" : `$${sub.price}`}
                    billingCycle={sub.billingCycle}
                    description={sub.description}
                    features={Array.from(includedFeatures)}
                    limitations={missingFeatures}
                    buttonText={
                      sub.popular ? "Start Free Trial" : "Get Started"
                    }
                    popular={sub.popular || false}
                  />
                );
              })
            ) : (
              <p className="text-center text-gray-500 col-span-3">
                No subscription plans available.
              </p>
            )}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="py-20 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.img
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.25, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 mix-blend-multiply" />
        </div>
        <div className="container mx-auto px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-8">
              Ready to transform your project management?
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Join thousands of teams who have already improved their workflow
              with TaskFlow.
            </p>
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-all group shadow-lg hover:shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};

export default Home;
