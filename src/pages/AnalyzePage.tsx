import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Info } from 'lucide-react';
import { Button, Card } from '../components/UI';

const AnalyzePage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                body: formData,
            });

            const text = await response.text();
            console.log("Raw response:", text);

            if (!response.ok) {
                let errorMsg = "An error occurred during analysis.";
                try {
                    const errData = JSON.parse(text);
                    errorMsg = errData.detail || errorMsg;
                } catch {
                    // use default message
                }
                alert("Analysis error: " + errorMsg);
                return;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("JSON parse error:", err);
                alert("Invalid JSON received from backend.");
                return;
            }

            console.log("Parsed data:", data);

            // Pass full backend response to results page
            const result = {
                prediction: data.prediction,        // "CANCER" or "NORMAL"
                cancer_score: data.cancer_score,     // raw sigmoid score
                explanation: data.explanation || "",
                explanation_status: data.explanation_status || "unavailable",
                explanation_error: data.explanation_error || "",
                fileName: file.name
            };

            navigate("/results", { state: { result, image: preview } });

        } catch (err) {
            console.error("Error connecting to backend:", err);
            alert("Failed to analyze image. Make sure the backend is running on http://localhost:8000.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Upload X-Ray Image</h1>
                <p className="text-slate-500 text-lg">
                    Upload a bone X-ray image for AI-powered cancer screening analysis.
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                {!preview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-[2rem] p-20 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex flex-col items-center gap-4 relative z-10 transition-transform group-hover:-translate-y-1">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-xl font-semibold text-slate-900">Drag & drop your X-ray image here</p>
                                <p className="text-slate-500">or click to browse files</p>
                            </div>
                            <div className="bg-slate-100 px-3 py-1 rounded-md mt-4 group-hover:bg-blue-100 transition-colors">
                                <span className="text-slate-500 text-xs font-medium uppercase tracking-wider group-hover:text-blue-700">Supported formats: PNG, JPG</span>
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Card className="relative overflow-hidden p-4 group">
                            <button
                                onClick={clearFile}
                                className="absolute top-6 right-6 z-20 bg-slate-900/10 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <img
                                src={preview}
                                alt="X-ray Preview"
                                className="w-full aspect-[4/3] object-cover rounded-xl"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-6 pt-12">
                                <p className="text-white text-sm font-medium truncate">{file?.name}</p>
                            </div>
                        </Card>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-4 text-lg relative overflow-hidden h-[60px]"
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Analyzing with AI…</span>
                                    </div>
                                ) : (
                                    "Analyze Image"
                                )}
                            </Button>

                            <Card padding="normal" className="bg-blue-50 border-blue-100 p-4">
                                <div className="flex gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                                        <Info className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-blue-900">Instructions</h4>
                                        <p className="text-blue-700/80 text-xs leading-relaxed">
                                            Ensure the X-ray is clearly visible and centered. The model works best with standard clinical diagnostic images. Multiple scans should be uploaded individually. Analysis may take longer when the AI description model is running.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyzePage;
