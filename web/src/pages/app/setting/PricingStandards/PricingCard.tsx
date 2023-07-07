import React from "react";

interface PricingCardProps {
  color: string;
  title: string;
  value: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ color, title, value }) => {
  const timeFrames = [
    { multiplier: 24, label: "天" },
    { multiplier: 24 * 7, label: "周" },
    { multiplier: 24 * 30, label: "月" },
    { multiplier: 24 * 365, label: "年" },
  ];

  return (
    <div className="mr-2 h-[256px] w-[180px] rounded-lg border border-grayModern-200 bg-[#F8FAFB]">
      <div className="px-4">
        <div className="flex items-center justify-center pt-5">
          <div className={`h-3 w-3 ${color} mr-1`} />
          {title}
        </div>
        <div className="pt-3 text-center text-[24px] text-grayModern-900">￥ {value}</div>
        <div className="pb-5 text-center text-grayModern-900">G/小时</div>
        {timeFrames.map(({ multiplier, label }) => (
          <div
            className="flex w-full justify-between border-t border-dotted py-[6px] text-grayModern-600"
            key={label}
          >
            <span>￥ {(value * multiplier).toFixed(2)}</span>
            <span>G/{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
