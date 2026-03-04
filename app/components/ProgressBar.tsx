'use client';

interface ProgressBarProps {
    percent: number;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function ProgressBar({ percent, showText = true, size = 'md', className = '' }: ProgressBarProps) {
    const roundedPercent = Math.min(100, Math.max(0, Math.round(percent)));

    // Color logic
    let barColor = 'from-gray-300 to-gray-400';
    let textColor = 'text-gray-600';
    let label = 'Not started';

    if (roundedPercent === 100) {
        barColor = 'from-green-500 to-green-600';
        textColor = 'text-green-600';
        label = '100% complete';
    } else if (roundedPercent > 0) {
        barColor = 'from-blue-500 to-blue-600';
        textColor = 'text-blue-600';
        label = `${roundedPercent}% complete`;
    }

    const heightClass = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    }[size];

    return (
        <div className={`w-full ${className}`}>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
                <div
                    className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500 ease-out`}
                    style={{ width: `${roundedPercent}%` }}
                />
            </div>
            {showText && (
                <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${textColor}`}>
                        {label}
                    </span>
                </div>
            )}
        </div>
    );
}
