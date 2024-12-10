import React, { useState } from 'react';
import { Menu, X, Cpu, Brain, Globe, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const SeasideSoftwareSolutions = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const solutions = [
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: "AI Strategy",
      description: "Comprehensive AI roadmapping to align cutting-edge technology with your business objectives.",
      benefits: [
        "Strategic AI Assessment",
        "Custom Implementation",
        "Innovation Guidance"
      ]
    },
    {
      icon: <Cpu className="w-12 h-12 text-blue-500" />,
      title: "Machine Learning",
      description: "Advanced predictive models and deep learning solutions that transform complex data into actionable insights.",
      benefits: [
        "Predictive Analytics",
        "Custom Model Development",
        "ML Infrastructure"
      ]
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-500" />,
      title: "AI Consulting",
      description: "End-to-end AI consulting that bridges technological potential with real-world business transformation.",
      benefits: [
        "Global Technology Expertise",
        "Enterprise Solutions",
        "Adaptive Frameworks"
      ]
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-500" />,
      title: "Rapid Deployment",
      description: "Agile AI integration strategies designed to minimize disruption and maximize immediate technological value.",
      benefits: [
        "Quick Implementation",
        "Minimal Disruption",
        "Immediate ROI"
      ]
    }
  ];

  return (
    <div className="bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-5">
    <div className="flex items-center space-x-4">
      <div className="text-2xl font-bold text-blue-500 tracking-tight">
      <img
        src="/wave.png"
        alt="Wave Logo"
        width={30}
        height={30}
      />
        Seaside
      </div>
      <div className="text-2xl font-light text-gray-900 tracking-tight">
        Software Solutions
      </div>
    </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Solutions', 'About', 'Contact'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-gray-600 hover:text-blue-500 transition-colors duration-300"
              >
                {item}
              </a>
            ))}
            <a 
              href="#contact" 
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-all"
            >
              Consult
            </a>
          </div>
          
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-blue-500 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="home" className="min-h-screen flex items-center bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 text-blue-500 tracking-tight leading-tight">
              Intelligent AI Solutions
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform complex data landscapes into strategic digital intelligence, empowering businesses to navigate the future with unprecedented clarity and precision.
            </p>
            <div className="flex justify-center space-x-6">
              <button className="flex items-center px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold">
                Get Started <ArrowRight className="ml-2" />
              </button>
              <button className="flex items-center px-8 py-4 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-blue-500">
            Our AI Solutions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <div 
                key={index} 
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 transform hover:scale-105 transition-all hover:shadow-lg group"
              >
                <div className="mb-6 flex justify-between items-center">
                  {solution.icon}
                  <ArrowRight className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-blue-500">
                  {solution.title}
                </h3>
                <p className="text-gray-700 mb-6">
                  {solution.description}
                </p>
                <div className="space-y-3">
                  {solution.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="text-blue-500 w-5 h-5" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-blue-500">
            Let's Build Future Intelligence
          </h2>
          <p className="text-gray-700 mb-12 max-w-xl mx-auto">
            Unlock transformative AI potential for your organization. Schedule a strategic consultation with our expert team.
          </p>
          <form className="bg-white rounded-xl p-10 shadow-lg space-y-6">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500" 
            />
            <input 
              type="email" 
              placeholder="Your Email" 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500" 
            />
            
            <textarea 
              placeholder="Describe Your AI Vision" 
              //@ts-ignore
              rows="5" 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
            ></textarea>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Send Vision Brief
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center space-x-6 mb-8">
            {['LinkedIn', 'Twitter', 'GitHub'].map((platform) => (
              <a 
                key={platform}
                href="#" 
                className="text-gray-700 hover:text-blue-500 transition-colors"
              >
                {platform}
              </a>
            ))}
          </div>
          <p className="text-gray-500 mb-4">
            © 2024 Seaside Software Solutions. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-500">
            Crafting Intelligent Futures Through Advanced AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SeasideSoftwareSolutions;