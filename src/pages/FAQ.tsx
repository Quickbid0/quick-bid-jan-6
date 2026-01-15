import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is QuickBid?',
      answer:
        'QuickBid is a real-time auction and product sales platform where users can bid on or instantly purchase new and old items.',
    },
    {
      question: 'How do I participate in an auction?',
      answer:
        'Register or log in, browse the products, and click "Join Bidding" on the product detail page to participate in the live auction.',
    },
    {
      question: 'Is QuickBid free to use?',
      answer:
        'Yes, registering and browsing products is completely free. A small transaction fee may apply for purchases.',
    },
    {
      question: 'Can I list my own products for auction?',
      answer:
        'Absolutely! After logging in, go to "Add Product", fill in the details, and your listing will go live for bidding.',
    },
    {
      question: 'How do I contact support?',
      answer:
        'You can reach us through the Contact Us page or by emailing support@quickbid.io.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm"
          >
            <button
              onClick={() => toggle(index)}
              className="flex justify-between w-full items-center px-6 py-4 text-left"
            >
              <span className="text-lg font-medium">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
