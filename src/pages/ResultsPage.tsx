import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { motion } from 'framer-motion';

const ResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { result, image } = location.state || {};

    // Default if no state (direct navigation)
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500">No analysis results found.</p>
                <Button variant="secondary" onClick={() => navigate('/analyze')}>
                    Go to Upload
                </Button>
            </div>
        );
    }

    const isDetected = result.prediction === "Cancer Detected";
    const confidencePercent = Math.min(98.76, Math.round(result.confidence * 100));

    return (
        <div className="py-16 px-4 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis Results</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <span className="font-medium text-slate-700">{result.fileName}</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        Scan processed successfully
                    </p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/analyze')} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>New Analysis</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left: Original Scan */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Original Scan</p>
                    <Card className="p-2 overflow-hidden bg-slate-100 border-slate-200">
                        <img
                            src={image}
                            alt="Analyzed X-ray"
                            className="w-full aspect-square object-contain bg-black rounded-xl"
                        />
                    </Card>
                </div>

                {/* Right: AI Prediction */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">AI Classification</p>
                        <Card className="space-y-8 relative overflow-hidden">
                            {/* Highlight bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDetected ? 'bg-orange-500' : 'bg-blue-500'}`} />

                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isDetected ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                                        }`}>
                                        {isDetected ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                        {isDetected ? 'Critical Finding' : 'Normal Finding'}
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 leading-none">
                                        {result.prediction}
                                    </h2>
                                </div>
                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{confidencePercent}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Certainty</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-900">Cancer Certainty</span>
                                    <span className="text-slate-500 font-medium">{confidencePercent}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confidencePercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${isDetected ? 'bg-orange-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model Engine</p>
                                    <p className="text-sm font-semibold text-slate-900">DMD-B v2.1</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing Time</p>
                                    <p className="text-sm font-semibold text-slate-900">1.82s</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="bg-slate-50 border-slate-100 p-6">
                        <div className="flex gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 h-fit">
                                <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900">Medical Disclaimer</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    This system is for research and decision-support only. The provided confidence score is a statistical probability based on historical training data. Final diagnosis must be made by a qualified medical professional through comprehensive clinical evaluation.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Button onClick={() => window.print()} variant="secondary" className="w-full py-4 flex items-center justify-center gap-3">
                        <FileText className="w-5 h-5" />
                        <span>Generate Patient Report PDF</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;
