import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, CreditCard, Send, Wallet, Shield, Zap, Users, Smartphone, Banknote, ArrowUpDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Tutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Finly",
      subtitle: "Your Gateway to Modern Finance",
      content: "Finly combines the power of cryptocurrency with the simplicity of traditional banking. Whether you're new to crypto or a seasoned trader, we've designed every feature with security and ease of use in mind.",
      image: "/images/tutorial/welcome.png",
      icon: Zap
    },
    {
      title: "Create Your Account",
      subtitle: "Get Started in Minutes",
      content: "Sign up for a free Finly account using your email or Google account. Our registration process is quick and secure, requiring only basic information to get you started.",
      image: "/images/tutorial/signup.png",
      icon: Users,
      action: {
        text: "Create Account",
        link: "/register"
      }
    },
    {
      title: "Secure Your Account",
      subtitle: "Multi-Layer Protection",
      content: "Enable two-factor authentication and set up your security preferences. Your account security is our top priority - we use bank-level encryption and never store your private keys.",
      image: "/images/tutorial/security.png",
      icon: Shield,
      tips: [
        "Enable 2FA for extra security",
        "Use a strong, unique password",
        "Never share your login credentials"
      ]
    },
    {
      title: "Add Funds to Your Wallet",
      subtitle: "Multiple Funding Options",
      content: "Deposit fiat currency or transfer cryptocurrencies to your Finly wallet. We support bank transfers, card payments, and direct crypto transfers for maximum flexibility.",
      image: "/images/tutorial/funding.png",
      icon: Banknote,
      methods: [
        { name: "Bank Transfer", desc: "Direct ACH/SEPA transfers" },
        { name: "Credit/Debit Cards", desc: "Instant card deposits" },
        { name: "Crypto Transfer", desc: "Send from external wallets" },
        { name: "P2P Payments", desc: "Pay with cash or other methods" }
      ]
    },
    {
      title: "Explore Your Dashboard",
      subtitle: "Your Financial Command Center",
      content: "Your dashboard gives you a complete overview of your financial activity. Track balances, view transaction history, and manage your portfolio all in one place.",
      image: "/images/tutorial/dashboard.png",
      icon: Smartphone,
      features: [
        "Real-time balance updates",
        "Transaction history",
        "Portfolio analytics",
        "Quick action buttons"
      ]
    },
    {
      title: "Make Your First Transaction",
      subtitle: "Buy, Sell, and Trade Crypto",
      content: "Exchange cryptocurrencies instantly with our advanced trading engine. Buy Bitcoin, Ethereum, and other major cryptocurrencies with fiat or trade between different crypto assets.",
      image: "/images/tutorial/trade.png",
      icon: ArrowUpDown,
      steps: [
        "Choose your trading pair",
        "Set amount and price",
        "Review and confirm",
        "Transaction completes instantly"
      ]
    },
    {
      title: "Send & Receive Payments",
      subtitle: "Peer-to-Peer Transactions",
      content: "Send cryptocurrency to friends, family, or merchants instantly. Our P2P payment system supports multiple cryptocurrencies and offers the fastest settlement times in the industry.",
      image: "/images/tutorial/send.png",
      icon: Send,
      benefits: [
        "Instant settlements",
        "Low fees compared to traditional methods",
        "Global reach - send anywhere",
        "Secure and traceable"
      ]
    },
    {
      title: "Order Your Virtual Card",
      subtitle: "Spend Crypto Anywhere",
      content: "Get a virtual debit card linked to your crypto wallet. Spend your cryptocurrency at millions of merchants worldwide that accept Visa and Mastercard.",
      image: "/images/tutorial/card.png",
      icon: CreditCard,
      features: [
        "Instant card issuance",
        "No monthly fees",
        "Spending limits you control",
        "Real-time transaction alerts"
      ]
    },
    {
      title: "Manage Your Portfolio",
      subtitle: "Track and Optimize",
      content: "Monitor your investment performance with advanced analytics. Set up price alerts, track your portfolio growth, and get insights to optimize your crypto holdings.",
      image: "/images/tutorial/portfolio.png",
      icon: Wallet,
      tools: [
        "Performance tracking",
        "Price alerts",
        "Portfolio rebalancing",
        "Tax reporting (coming soon)"
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </NavLink>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">Finly Tutorial</span>
            </div>

            <div className="text-sm text-zinc-400">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="w-full bg-zinc-800 rounded-full h-2 mb-8">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <CurrentIcon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                  Step {currentStep + 1}
                </h3>
                <h2 className="text-3xl font-black">
                  {currentStepData.title}
                </h2>
              </div>
            </div>

            <p className="text-xl text-zinc-400">
              {currentStepData.subtitle}
            </p>

            <p className="text-zinc-300 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Additional Content */}
            {currentStepData.tips && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Security Tips:</h4>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-400">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentStepData.methods && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Funding Methods:</h4>
                <div className="grid grid-cols-1 gap-3">
                  {currentStepData.methods.map((method, i) => (
                    <div key={i} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                      <h5 className="font-medium text-white">{method.name}</h5>
                      <p className="text-sm text-zinc-400">{method.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStepData.features && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Dashboard Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentStepData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-blue-500" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStepData.steps && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">How to Trade:</h4>
                <ol className="space-y-2">
                  {currentStepData.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-zinc-400">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {currentStepData.benefits && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Benefits:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentStepData.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-zinc-400">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStepData.tools && (
              <div className="space-y-3">
                <h4 className="font-bold text-white">Portfolio Tools:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentStepData.tools.map((tool, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-blue-500" />
                      <span className="text-sm text-zinc-400">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            {currentStepData.action && (
              <NavLink
                to={currentStepData.action.link}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
              >
                {currentStepData.action.text}
                <ArrowRight size={16} />
              </NavLink>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            key={`image-${currentStep}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <CurrentIcon size={64} className="text-zinc-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-zinc-800">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          {/* Step Indicators */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentStep ? 'bg-blue-600' : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ArrowRight size={16} />}
          </button>
        </div>

        {/* Completion Message */}
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">You're All Set!</h3>
              <p className="text-zinc-400">
                You now know everything you need to get started with Finly.
                Remember, our support team is always here to help if you have questions.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <NavLink
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-colors"
              >
                Go to Dashboard
              </NavLink>
              <NavLink
                to="/settings"
                className="px-6 py-3 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                Account Settings
              </NavLink>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Tutorial;

