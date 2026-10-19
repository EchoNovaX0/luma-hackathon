import React from 'react';
import {
    Brain,
    Target,
    TrendingUp,
    Activity,
    BarChart3,
    Users,
    Shield
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// --- Data Generation ---

const generateGANData = () => {
    const data = [];
    for (let i = 0; i <= 400; i++) {
        // Generator loss: starts high (~9.5), drops fast, stabilizes ~3.3
        let gLoss;
        if (i < 20) {
            gLoss = 9.5 - (6 * (i / 20)) + (Math.random() * 0.5);
        } else {
            gLoss = 3.3 + (Math.sin(i / 5) * 0.2) + (Math.random() * 0.3);
        }

        // Fix the specific point mentioned in tooltip: Epoch 205 (G: 3.327, D: 0.663)
        if (i === 205) {
            gLoss = 3.327;
        }

        // Discriminator loss: remains low and stable ~0.6
        let dLoss = 0.6 + (Math.random() * 0.2);
        if (i === 205) {
            dLoss = 0.663;
        }

        data.push({
            epoch: i,
            generator: gLoss,
            discriminator: dLoss,
        });
    }
    return data;
};

const generateModelData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
        // Train Loss: drops fast to near 0
        const trainLoss = i < 10 ? 0.3 * Math.exp(-i / 3) : 0.01 + Math.random() * 0.01;

        // Val Loss: oscillates between 0.1 and 0.25
        const valLoss = 0.15 + (Math.sin(i / 2) * 0.05) + (Math.random() * 0.05);

        // Train Acc: jumps up to ~0.99
        const trainAcc = i < 5 ? 0.88 + (0.11 * (i / 5)) : 0.985 + Math.random() * 0.005;

        // Val Acc: oscillates between 0.95 and 0.97
        const valAcc = 0.95 + (Math.sin(i / 3) * 0.01) + (Math.random() * 0.01);

        data.push({
            epoch: i,
            trainLoss,
            valLoss,
            trainAcc,
            valAcc,
        });
    }
    return data;
};

const ganData = generateGANData();
const modelData = generateModelData();

// --- Components ---

const MetricCard = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center justify-center space-y-2 shadow-sm">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        <span className="text-slate-500 text-sm font-medium">{label}</span>
    </div>
);

const SubMetricCard = ({ label, value, total }: { label: string, value: number, total: number }) => (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center space-y-1 shadow-sm">
        <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-800">{value}</span>
            <span className="text-slate-400 text-sm">/ {total}</span>
        </div>
        <span className="text-slate-500 text-xs font-medium">{label}</span>
    </div>
);

const InfoCard = ({ icon: Icon, title, content }: { icon: any, title: string, content: string }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
            <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed">
            {content}
        </p>
    </div>
);

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">

                {/* Header Section */}
                <div className="space-y-2">
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Model Dashboard</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">About BoneGuard AI</h1>
                    <p className="text-slate-500 text-lg max-w-4xl">
                        Deep learning–powered bone cancer screening. Below is the final evaluation of our CNN model trained on
                        annotated X-ray datasets.
                    </p>
                </div>

                {/* Final Evaluation Summary Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center space-x-3 mb-8">
                        <Brain className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-800">Final Evaluation Summary</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <MetricCard icon={Target} label="Accuracy" value="96.71%" colorClass="text-blue-500" />
                        <MetricCard icon={TrendingUp} label="Precision" value="96.71%" colorClass="text-sky-500" />
                        <MetricCard icon={Activity} label="Recall" value="95.98%" colorClass="text-green-500" />
                        <MetricCard icon={BarChart3} label="F1 Score" value="96.34%" colorClass="text-amber-500" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SubMetricCard label="False Positives" value={13} total={883} />
                        <SubMetricCard label="False Negatives" value={16} total={883} />
                    </div>
                </div>

                {/* GAN Training Loss Curve Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800">GAN Training Loss Curve</h2>
                        <p className="text-slate-400 text-sm">Generator vs Discriminator loss over 400 epochs</p>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ganData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="epoch"
                                    axisLine={false}
                                    tickLine={true}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    ticks={[3, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 109, 121, 133, 145, 157, 169, 181, 193, 205, 217, 229, 241, 253, 265, 277, 289, 301, 313, 325, 337, 349, 361, 373, 385, 399]}
                                    label={{ value: 'Epoch', position: 'bottom', offset: 0, fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    ticks={[0, 3, 6, 9, 12]}
                                    label={{ value: 'Loss', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                <Line
                                    type="monotone"
                                    dataKey="generator"
                                    name="Generator"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#2563eb' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="discriminator"
                                    name="Discriminator"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: '#0ea5e9' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Final Model Loss & Accuracy Curves Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Final Model Loss & Accuracy Curves</h2>
                        <p className="text-slate-400 text-sm">Training and validation metrics over 100 epochs</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Loss Chart */}
                        <div className="space-y-4">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loss</p>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={modelData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="epoch"
                                            axisLine={false}
                                            tickLine={true}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            ticks={[0, 3, 6, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99]}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            ticks={[0, 0.09, 0.18, 0.27, 0.36]}
                                        />
                                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="#2563eb" strokeWidth={1.5} dot={false} />
                                        <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="#dc2626" strokeWidth={1.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Accuracy Chart */}
                        <div className="space-y-4">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Accuracy (%)</p>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={modelData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="epoch"
                                            axisLine={false}
                                            tickLine={true}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            ticks={[0, 3, 6, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99]}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            ticks={[0.88, 0.91, 0.94, 0.97, 1]}
                                            domain={[0.88, 1]}
                                        />
                                        <Tooltip contentStyle={{ fontSize: '12px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        <Line type="monotone" dataKey="trainAcc" name="Train Acc" stroke="#16a34a" strokeWidth={1.5} dot={false} />
                                        <Line type="monotone" dataKey="valAcc" name="Val Acc" stroke="#d97706" strokeWidth={1.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    <InfoCard
                        icon={Brain}
                        title="How It Works"
                        content="A CNN trained on annotated bone X-ray datasets extracts multi-layer features to classify malignancies with a confidence score."
                    />
                    <InfoCard
                        icon={Users}
                        title="Who It's For"
                        content="Radiologists, orthopedic specialists, diagnostic labs, and hospitals seeking AI-augmented screening as a second-opinion tool."
                    />
                    <InfoCard
                        icon={Shield}
                        title="Important Notice"
                        content="This is an academic research project — not a certified medical device. All predictions must be reviewed by qualified professionals."
                    />
                </div>

            </div>

        </div>
    );
};

export default AboutPage;

