import React, { useState } from 'react';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What is Fursan’s recruitment platform?",
            answer: "Fursan’s recruitment platform offers flexible business packages designed to streamline hiring and workforce management"
        },
        {
            question: "Can we use the ATS independently?",
            answer: "Fursan’s recruitment platform offers flexible business packages designed to streamline hiring and workforce management"
        },
        {
            question: "How does Fursan’s recruitment outsourcing work?",
            answer: "Fursan’s recruitment platform offers flexible business packages designed to streamline hiring and workforce management"
        },
        {
            question: "Is Fursan’s recruitment service available globally?",
            answer: "Fursan’s recruitment platform offers flexible business packages designed to streamline hiring and workforce management"
        },
        {
            question: "Can I use Fursan to apply for jobs?",
            answer: "Fursan’s recruitment platform offers flexible business packages designed to streamline hiring and workforce management"
        }
    ];

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-[1300px] mx-auto px-4">

                {/* Title with Background Shape */}
                <h2 className="font-['Roboto'] font-bold text-[28px] leading-[42px] text-[#2A69C6] text-center 
                       bg-[url('/faq_shape.svg')] bg-contain bg-no-repeat w-fit p-20 mb-10">
                    FAQ
                </h2>

                <div className="mx-auto">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b-2 border-[#D9D9D9] py-[30px]">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center text-left bg-transparent border-none cursor-pointer group"
                            >
                                <span className="font-['Roboto'] font-medium text-xl leading-none capitalize text-black/85">
                                    {faq.question}
                                </span>
                                <span className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                    <img src="/Arrow---Down-2.svg" alt="toggle" />
                                </span>
                            </button>

                            {/* Collapsible Answer */}
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-40 opacity-100 mt-[15px]' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <p className="font-['Roboto'] font-normal text-lg leading-none capitalize text-black/50">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;