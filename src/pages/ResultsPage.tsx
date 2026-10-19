import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, AlertTriangle, FileText, Sparkles, XCircle } from 'lucide-react';
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

    const isDetected = result.prediction === "CANCER";
    const cancerScorePercent = Math.round(result.cancer_score * 10000) / 100; // e.g. 0.8123 → 81.23

    const explanationAvailable = result.explanation_status === "available" && result.explanation;

    return (
        <div className="py-16 px-4 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analysis Results</h1>
                    <p className="text-slate-500 flex items-center gap-2 flex-wrap">
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

                {/* Right: AI Prediction + MedGemma */}
                <div className="space-y-6">
                    {/* Classification Card */}
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
                                        {isDetected ? "Cancer Detected" : "No Cancer Detected"}
                                    </h2>
                                </div>
                                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{cancerScorePercent}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-900">Cancer Score</span>
                                    <span className="text-slate-500 font-medium">{cancerScorePercent}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cancerScorePercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${isDetected ? 'bg-orange-500' : 'bg-blue-500'}`}
                                    />
                                </div>
                                <p className="text-xs text-slate-400">
                                    This is the classifier's raw sigmoid output, not a calibrated probability.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classifier</p>
                                    <p className="text-sm font-semibold text-slate-900">ResNet-18 Binary (Grayscale 224×224)</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* MedGemma Description Card */}
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                            MedGemma Result Explanation
                        </p>
                        <Card className="space-y-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${explanationAvailable ? 'bg-violet-500' : 'bg-slate-300'}`} />

                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${explanationAvailable ? 'bg-violet-50' : 'bg-slate-100'}`}>
                                    <Sparkles className={`w-4 h-4 ${explanationAvailable ? 'text-violet-600' : 'text-slate-400'}`} />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MedGemma Vision Model</span>
                            </div>

                            {explanationAvailable ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {result.explanation}
                                    </p>
                                    <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                                        <p className="text-xs text-violet-700 leading-relaxed">
                                            <span className="font-bold">⚠ AI-generated &amp; experimental.</span>{" "}
                                            MedGemma receives the classifier's label and raw score to explain the result. Its response may contain errors and is not a diagnosis.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
                                    <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-600">Image description unavailable</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {result.explanation_error || "The MedGemma vision model could not be reached. Ensure Ollama is running and the medgemma:4b model is pulled."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Medical Disclaimer */}
                    <Card className="bg-slate-50 border-slate-100 p-6">
                        <div className="flex gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 h-fit">
                                <FileText className="w-6 h-6 text-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900">Research Use Only</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    This system is an experimental research prototype and is not a medical device. The cancer score is a model output, not a calibrated clinical probability. MedGemma uses that score and label to generate an explanation, which may be incomplete or incorrect and does not independently verify the classifier. No bounding-box detection or tumor localization is performed. A qualified medical professional must interpret imaging and make all clinical decisions.
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
