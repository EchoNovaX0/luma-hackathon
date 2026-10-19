const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="BoneGuard Logo"
                                className="w-10 h-10 object-contain p-2 rounded-xl shadow-md shadow-slate-100"
                            />
                            <span className="font-bold text-xl text-slate-900 tracking-tight">BoneGuard AI</span>
                        </div>
                        <p className="text-slate-500 text-base leading-relaxed max-w-sm font-medium">
                            AI-powered bone cancer detection system designed for medical professionals.
                            Using deep learning to assist in early diagnosis from X-ray images.
                        </p>
                    </div>

                    {/* Project Section */}
                    <div className="md:col-span-3">
                        <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Project</h4>
                        <ul className="space-y-4 text-base text-slate-500 font-medium">
                            <li>Academic / Research Project</li>
                            <li>For research and clinical decision-support purposes only.</li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-4">
                        <h4 className="font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Contact</h4>
                        <ul className="space-y-4 text-base text-slate-500 font-medium">
                            <li>GitHub: <span className="text-slate-900">github.com/boneguard-ai</span></li>
                            <li>Email: <span className="text-slate-900">contact@boneguard.ai</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 mt-8">
                    <p className="text-slate-400 text-xs text-center font-medium">
                        © {new Date().getFullYear()} BoneGuard AI. All rights reserved. This tool is not a substitute for professional medical advice.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
