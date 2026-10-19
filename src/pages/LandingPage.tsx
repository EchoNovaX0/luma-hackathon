import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ShieldCheck, Zap, Microscope } from 'lucide-react';
import { Button, Card } from '../components/UI';

const features = [
    {
        icon: <Clock className="w-5 h-5 text-blue-600" />,
        title: "Fast Analysis",
        description: "Get preliminary results in seconds. Our deep learning model processes X-ray images rapidly to support timely clinical decisions."
    },
    {
        icon: <Zap className="w-5 h-5 text-blue-600" />,
        title: "High Accuracy",
        description: "Trained on thousands of annotated bone X-rays, the model achieves high sensitivity and specificity in detecting abnormalities."
    },
    {
        icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
        title: "Secure & Private",
        description: "All uploaded images are processed securely. Patient data privacy is maintained throughout the analysis pipeline."
    },
    {
        icon: <Microscope className="w-5 h-5 text-blue-600" />,
        title: "Research & Clinical Support",
        description: "Designed as a decision-support tool for radiologists and clinicians. Assists — never replaces — professional judgment."
    }
];

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col animate-in fade-in duration-700 font-sans">
            {/* --- HERO SECTION --- */}
            {/* Uses a radial gradient background to mimic the "medical glow" in Picture1.png */}
            {/* --- HERO SECTION --- */}
            {/* --- HERO SECTION --- */}
            <section className="relative overflow-hidden bg-slate-900 pt-0 pb-20 lg:pb-32">
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/img.jpg"
                        alt="Medical background"
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                    />

                    {/* Gradient Overlay to ensure text legibility and "medical glow" */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-[#f8fafd]"></div>

                    {/* The Radial Glow from your original design */}
                    <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(circle_at_center,_#f0f7ff_0%,_transparent_70%)] opacity-60 blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center mt-12 lg:mt-20">
                    {/* Top Badge */}
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center px-4 py-1.5 text-[11px] font-bold tracking-widest text-blue-500 uppercase bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-full">
                            AI-Powered Diagnostic Support
                        </span>
                    </div>

                    {/* Header */}
                    <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                        Bone Cancer Detection <br className="hidden md:block" />
                        <span className="text-blue-600">from X-Ray Images</span>
                    </h1>

                    {/* Description */}
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                        BoneGuard AI assists medical professionals by analyzing bone X-ray images using
                        advanced deep learning — enabling faster, more confident screening for
                        potential malignancies.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Button
                            onClick={() => navigate('/analyze')}
                            className="w-full sm:w-auto px-10 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                        >
                            Upload X-Ray for Analysis
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto px-10 py-4 text-lg bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            {/* Matches Picture 2 & 3 with the #f8fafd background and specific card layout */}
            <section className="py-24 bg-[#f8fafd]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Why BoneGuard AI?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            Built for clinical environments where reliability, speed, and trust are non-negotiable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="p-8 bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
                            >
                                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                    {/* Wrapping icon to ensure color change on hover */}
                                    <div className="group-hover:text-white">
                                        {React.cloneElement(feature.icon, {
                                            className: "w-6 h-6 transition-colors"
                                        })}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 text-base leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 bg-white">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-[3rem] p-16 shadow-inner">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to analyze an X-ray?</h2>
                        <p className="text-slate-600 text-lg max-w-xl mx-auto mb-10">
                            Upload a bone X-ray image and receive an AI-assisted screening result in seconds.
                        </p>
                        <Button
                            onClick={() => navigate('/analyze')}
                            className="px-12 py-4 text-xl bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200"
                        >
                            Start Analysis
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;