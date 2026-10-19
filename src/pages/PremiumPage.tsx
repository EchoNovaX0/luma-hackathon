import React from 'react';
import { Shield, Zap, Crown, Check, X } from 'lucide-react';
import { Button, Card } from '../components/UI';

const PremiumPage = () => {
    return (
        <div className="min-h-screen bg-[#f8fafd] py-20 px-4">
            <div className="max-w-7xl mx-auto text-center mb-16">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4 block">
                    Choose the plan that fits your clinical needs
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                    Simple, Transparent Pricing
                </h1>
                <div className="inline-block bg-[#fff9eb] border border-[#ffeeba] px-6 py-2 rounded-full">
                    <p className="text-[#856404] font-medium text-sm md:text-base">
                        Traditional diagnostic review can cost ₹2,000+. BoneGuard AI plans start at just <span className="font-bold">₹99</span>.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Patient Plan */}
                <Card className="p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-blue-500 bg-blue-50 p-2 rounded-lg">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Patient</h2>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-slate-900">₹99</span>
                        <span className="text-slate-400 font-medium ml-1">/month</span>
                    </div>
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Symptom-Based Bone Health Screening
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Early Bone Tumor Risk Indicator
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Bone Health Safety Score
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Simple Medical Explanations
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Doctor Consultation Recommendations
                        </li>
                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                            <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            Priority Health Reports
                        </li>
                    </ul>
                    <Button className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-lg">
                        Upgrade Plan
                    </Button>
                </Card>

                {/* Clinic Plan */}
                <div className="relative group">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                            Most Popular
                        </span>
                    </div>
                    <Card className="p-10 bg-white border-2 border-blue-500 shadow-2xl rounded-[3rem] transform transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-orange-500 bg-orange-50 p-2 rounded-lg">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Clinic</h2>
                        </div>
                        <div className="mb-8 font-inter">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">₹1,999</span>
                            <span className="text-slate-400 font-bold ml-1 text-lg">/month</span>
                        </div>
                        <ul className="space-y-4 mb-10">
                            {[
                                "Patient risk assessment dashboard",
                                "Clinical decision support insights",
                                "Detailed diagnostic reports",
                                "Patient history tracking",
                                "Priority patient analysis",
                                "Exportable medical reports"

                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-semibold">
                                    <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-lg">
                            Upgrade Plan
                        </Button>
                    </Card>
                </div>

                {/* Hospital Plan */}
                <Card className="p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-purple-600 bg-purple-50 p-2 rounded-lg">
                            <Crown className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Hospital</h2>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-slate-900">₹9,999</span>
                        <span className="text-slate-400 font-medium ml-1">/month</span>
                    </div>
                    <ul className="space-y-4 mb-10">
                        {[
                            "Large-scale patient screening support",
                            "Multi-doctor team access",
                            "Centralized patient data dashboard",
                            "Advanced diagnostic analytics",
                            "Risk trend & patient monitoring",
                            "Integration with hospital workflows",
                            "Downloadable clinical reports"

                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                                <div className="bg-green-100 p-0.5 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 text-lg">
                        Upgrade Plan
                    </Button>
                </Card>
            </div>
        </div>
    );
};

export default PremiumPage;
