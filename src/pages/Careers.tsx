import { Briefcase, Heart, Zap, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Careers = () => {
  const openPositions = [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Mumbai / Remote',
      type: 'Full-time',
      experience: '5+ years',
      skills: ['React', 'Node.js', 'PostgreSQL', 'AWS']
    },
    {
      title: 'AI/ML Engineer',
      department: 'Data Science',
      location: 'Bangalore / Remote',
      type: 'Full-time',
      experience: '3+ years',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision']
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Delhi / Remote',
      type: 'Full-time',
      experience: '4+ years',
      skills: ['Product Strategy', 'User Research', 'Analytics', 'Agile']
    },
    {
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      experience: '3+ years',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems']
    }
  ];

  const benefits = [
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance and wellness programs'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Learning & Growth',
      description: 'Continuous learning opportunities and skill development'
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: 'Remote Flexibility',
      description: 'Work from anywhere with flexible hours'
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      title: 'Recognition',
      description: 'Performance bonuses and recognition programs'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <Briefcase className="h-20 w-20 text-indigo-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Join Our Team
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Help us revolutionize the auction industry. Build the future of online bidding 
          with cutting-edge technology and innovative solutions.
        </p>
      </div>

      {/* Company Culture */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Why QuickBid?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're building the next generation auction platform with AI, live streaming, and blockchain technology
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
        <div className="space-y-6">
          {openPositions.map((position, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>📍 {position.location}</span>
                    <span>🏢 {position.department}</span>
                    <span>⏰ {position.type}</span>
                    <span>📈 {position.experience}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {position.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                  Apply Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">Don't See Your Role?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're always looking for talented individuals. Send us your resume!
        </p>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700">
          Send Resume
        </button>
      </div>
    </div>
  );
};

export default Careers;