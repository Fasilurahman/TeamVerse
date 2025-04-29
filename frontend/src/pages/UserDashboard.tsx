// import React from 'react';
// import { 
//   CheckCircle2, 
//   XCircle, 
//   Briefcase, 
//   Clock, 
//   Users, 
//   BarChart3, 
//   Zap,
//   Calendar,
//   MessageSquare,
//   FileText
// } from 'lucide-react';

// function UserDashboard() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       {/* Hero Section */}
//       <header className="relative overflow-hidden">
//         <nav className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Briefcase className="h-8 w-8 text-indigo-600" />
//               <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
//             </div>
//             <div className="hidden md:flex items-center space-x-8">
//               <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
//               <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
//               <a href="#" className="text-gray-600 hover:text-gray-900">Resources</a>
//               <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
//                 Get Started
//               </button>
//             </div>
//           </div>
//         </nav>

//         <div className="container mx-auto px-6 pt-20 pb-24 text-center">
//           <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8">
//             Manage Projects with
//             <span className="text-indigo-600"> Confidence</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
//             Streamline your workflow, boost team collaboration, and deliver projects on time with our powerful project management solution.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors">
//               Start Free Trial
//             </button>
//             <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors">
//               Watch Demo
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Features Section */}
//       <section id="features" className="py-20 bg-white">
//         <div className="container mx-auto px-6">
//           <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
//             Everything you need to succeed
//           </h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
//             <FeatureCard
//               icon={<Clock className="h-8 w-8 text-indigo-600" />}
//               title="Time Tracking"
//               description="Track time spent on tasks and projects with precision"
//             />
//             <FeatureCard
//               icon={<Users className="h-8 w-8 text-indigo-600" />}
//               title="Team Collaboration"
//               description="Work together seamlessly with your team members"
//             />
//             <FeatureCard
//               icon={<BarChart3 className="h-8 w-8 text-indigo-600" />}
//               title="Analytics"
//               description="Get insights into project progress and team performance"
//             />
//             <FeatureCard
//               icon={<Calendar className="h-8 w-8 text-indigo-600" />}
//               title="Project Planning"
//               description="Plan and schedule projects with interactive calendars"
//             />
//             <FeatureCard
//               icon={<MessageSquare className="h-8 w-8 text-indigo-600" />}
//               title="Team Chat"
//               description="Communicate effectively with built-in messaging"
//             />
//             <FeatureCard
//               icon={<FileText className="h-8 w-8 text-indigo-600" />}
//               title="Documentation"
//               description="Keep all project documents organized in one place"
//             />
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section id="pricing" className="py-20 bg-gray-50">
//         <div className="container mx-auto px-6">
//           <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
//             Choose your plan
//           </h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
//             <PricingCard
//               title="Free"
//               price="$0"
//               description="Perfect for individuals and small teams"
//               features={[
//                 "Up to 5 team members",
//                 "Basic project templates",
//                 "Time tracking",
//                 "2GB storage",
//                 "Email support"
//               ]}
//               limitations={[
//                 "No custom fields",
//                 "No analytics",
//                 "No API access",
//                 "Limited integrations"
//               ]}
//               buttonText="Get Started"
//               popular={false}
//             />
//             <PricingCard
//               title="Pro"
//               price="$12"
//               description="Best for growing teams"
//               features={[
//                 "Up to 50 team members",
//                 "Advanced project templates",
//                 "Time tracking & reporting",
//                 "50GB storage",
//                 "Priority support",
//                 "Custom fields",
//                 "Advanced analytics",
//                 "API access",
//                 "All integrations"
//               ]}
//               buttonText="Start Free Trial"
//               popular={true}
//             />
//             <PricingCard
//               title="Enterprise"
//               price="Custom"
//               description="For large organizations"
//               features={[
//                 "Unlimited team members",
//                 "Custom templates",
//                 "Advanced reporting",
//                 "Unlimited storage",
//                 "24/7 support",
//                 "Custom fields",
//                 "Advanced analytics",
//                 "API access",
//                 "Custom integrations",
//                 "Dedicated account manager"
//               ]}
//               buttonText="Contact Sales"
//               popular={false}
//             />
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-indigo-600">
//         <div className="container mx-auto px-6 text-center">
//           <h2 className="text-4xl font-bold text-white mb-8">
//             Ready to transform your project management?
//           </h2>
//           <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
//             Join thousands of teams who have already improved their workflow with TaskFlow.
//           </p>
//           <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
//             Start Your Free Trial
//           </button>
//         </div>
//       </section>
//     </div>
//   );
// }

// function FeatureCard({ icon, title, description }) {
//   return (
//     <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
//       <div className="mb-4">{icon}</div>
//       <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
//       <p className="text-gray-600">{description}</p>
//     </div>
//   );
// }

// function PricingCard({ title, price, description, features, limitations = [], buttonText, popular }) {
//   return (
//     <div className={`p-8 rounded-xl ${popular ? 'bg-white shadow-xl ring-2 ring-indigo-600' : 'bg-white shadow-md'}`}>
//       {popular && (
//         <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
//           Most Popular
//         </span>
//       )}
//       <h3 className="text-2xl font-bold text-gray-900 mt-4">{title}</h3>
//       <div className="mt-4 flex items-baseline">
//         <span className="text-4xl font-bold text-gray-900">{price}</span>
//         {price !== "Custom" && <span className="ml-1 text-gray-600">/month</span>}
//       </div>
//       <p className="mt-2 text-gray-600">{description}</p>
      
//       <ul className="mt-6 space-y-3">
//         {features.map((feature, index) => (
//           <li key={index} className="flex items-center">
//             <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
//             <span className="text-gray-600">{feature}</span>
//           </li>
//         ))}
//         {limitations.map((limitation, index) => (
//           <li key={index} className="flex items-center text-gray-400">
//             <XCircle className="h-5 w-5 text-gray-400 mr-2" />
//             <span>{limitation}</span>
//           </li>
//         ))}
//       </ul>

//       <button className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold ${
//         popular 
//           ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
//           : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
//       } transition-colors`}>
//         {buttonText}
//       </button>
//     </div>
//   );
// }

// export default UserDashboard;