import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const COPPER = "#b87333";
const COPPER_DARK = "#8b5a2b";
const COPPER_LIGHT = "#cd853f";

function LeanHouseIcon() {
	const w = 80;
	const h = 56;
	return (
		<svg
			width={w * 4}
			height={h * 4}
			viewBox={`0 0 ${w} ${h}`}
			className="mb-8"
			style={{ imageRendering: "pixelated" }}
			aria-hidden
		>
			<title>Lean TPS house – Greek temple</title>
			{/* base / steps */}
			<rect x={4} y={44} width={72} height={8} fill={COPPER_DARK} />
			<rect x={8} y={40} width={64} height={6} fill={COPPER} />
			<rect x={12} y={36} width={56} height={6} fill={COPPER_LIGHT} />
			{/* floor */}
			<rect x={12} y={32} width={56} height={6} fill={COPPER_DARK} />
			{/* left pillar (1.5x thicker) */}
			<rect x={12} y={14} width={15} height={20} fill={COPPER} />
			<rect x={15} y={16} width={9} height={16} fill={COPPER_DARK} />
			{/* right pillar (1.5x thicker) */}
			<rect x={53} y={14} width={15} height={20} fill={COPPER} />
			<rect x={56} y={16} width={9} height={16} fill={COPPER_DARK} />
			{/* pediment – filled symmetric triangle (wider) */}
			<rect x={38} y={0} width={4} height={2} fill={COPPER_LIGHT} />
			<rect x={30} y={2} width={4} height={2} fill={COPPER} />
			<rect x={34} y={2} width={4} height={2} fill={COPPER} />
			<rect x={38} y={2} width={4} height={2} fill={COPPER} />
			<rect x={42} y={2} width={4} height={2} fill={COPPER} />
			<rect x={46} y={2} width={4} height={2} fill={COPPER} />
			<rect x={26} y={4} width={4} height={2} fill={COPPER_DARK} />
			<rect x={30} y={4} width={4} height={2} fill={COPPER} />
			<rect x={34} y={4} width={4} height={2} fill={COPPER} />
			<rect x={38} y={4} width={4} height={2} fill={COPPER_DARK} />
			<rect x={42} y={4} width={4} height={2} fill={COPPER} />
			<rect x={46} y={4} width={4} height={2} fill={COPPER} />
			<rect x={50} y={4} width={4} height={2} fill={COPPER_DARK} />
			<rect x={22} y={6} width={4} height={2} fill={COPPER} />
			<rect x={26} y={6} width={4} height={2} fill={COPPER} />
			<rect x={30} y={6} width={4} height={2} fill={COPPER} />
			<rect x={34} y={6} width={4} height={2} fill={COPPER_DARK} />
			<rect x={38} y={6} width={4} height={2} fill={COPPER_DARK} />
			<rect x={42} y={6} width={4} height={2} fill={COPPER_DARK} />
			<rect x={46} y={6} width={4} height={2} fill={COPPER} />
			<rect x={50} y={6} width={4} height={2} fill={COPPER} />
			<rect x={54} y={6} width={4} height={2} fill={COPPER} />
			<rect x={18} y={8} width={4} height={2} fill={COPPER_LIGHT} />
			<rect x={22} y={8} width={4} height={2} fill={COPPER} />
			<rect x={26} y={8} width={4} height={2} fill={COPPER} />
			<rect x={30} y={8} width={4} height={2} fill={COPPER_DARK} />
			<rect x={34} y={8} width={4} height={2} fill={COPPER_DARK} />
			<rect x={38} y={8} width={4} height={2} fill={COPPER_DARK} />
			<rect x={42} y={8} width={4} height={2} fill={COPPER_DARK} />
			<rect x={46} y={8} width={4} height={2} fill={COPPER_DARK} />
			<rect x={50} y={8} width={4} height={2} fill={COPPER} />
			<rect x={54} y={8} width={4} height={2} fill={COPPER} />
			<rect x={58} y={8} width={4} height={2} fill={COPPER_LIGHT} />
			<rect x={14} y={10} width={4} height={2} fill={COPPER} />
			<rect x={18} y={10} width={4} height={2} fill={COPPER} />
			<rect x={22} y={10} width={4} height={2} fill={COPPER} />
			<rect x={26} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={30} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={34} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={38} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={42} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={46} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={50} y={10} width={4} height={2} fill={COPPER_DARK} />
			<rect x={54} y={10} width={4} height={2} fill={COPPER} />
			<rect x={58} y={10} width={4} height={2} fill={COPPER} />
			<rect x={62} y={10} width={4} height={2} fill={COPPER} />
			<rect x={10} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={14} y={12} width={4} height={2} fill={COPPER} />
			<rect x={18} y={12} width={4} height={2} fill={COPPER} />
			<rect x={22} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={26} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={30} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={34} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={38} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={42} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={46} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={50} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={54} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={58} y={12} width={4} height={2} fill={COPPER} />
			<rect x={62} y={12} width={4} height={2} fill={COPPER} />
			<rect x={66} y={12} width={4} height={2} fill={COPPER_DARK} />
			<rect x={8} y={14} width={4} height={2} fill={COPPER_DARK} />
			<rect x={12} y={14} width={4} height={2} fill={COPPER} />
			<rect x={16} y={14} width={4} height={2} fill={COPPER} />
			<rect x={20} y={14} width={4} height={2} fill={COPPER} />
			<rect x={24} y={14} width={4} height={2} fill={COPPER} />
			<rect x={28} y={14} width={4} height={2} fill={COPPER} />
			<rect x={32} y={14} width={4} height={2} fill={COPPER} />
			<rect x={36} y={14} width={4} height={2} fill={COPPER} />
			<rect x={40} y={14} width={4} height={2} fill={COPPER} />
			<rect x={44} y={14} width={4} height={2} fill={COPPER} />
			<rect x={48} y={14} width={4} height={2} fill={COPPER} />
			<rect x={52} y={14} width={4} height={2} fill={COPPER} />
			<rect x={56} y={14} width={4} height={2} fill={COPPER} />
			<rect x={60} y={14} width={4} height={2} fill={COPPER} />
			<rect x={64} y={14} width={4} height={2} fill={COPPER} />
			<rect x={68} y={14} width={4} height={2} fill={COPPER} />
		</svg>
	);
}

function HomePage() {
	return (
		<div className="min-h-screen bg-factory-bg text-text flex flex-col items-center justify-center p-6">
			<LeanHouseIcon />
			<h1 className="text-3xl md:text-4xl font-normal pixel-font text-text mb-4 text-center">
				Lean Flow Simulation
			</h1>
			<p className="text-text-muted mb-8 max-w-xl text-center text-xl">
				Interactive simulation demonstrating Lean production principles: start
				with <span className="font-bold text-accent">Customer Feedback</span>,{" "}
				<span className="font-bold text-accent">Training</span>, and{" "}
				<span className="font-bold text-accent">Andon</span>, then learn about{" "}
				<span className="font-bold text-accent">Jidoka</span>,{" "}
				<span className="font-bold text-accent">Flow</span>,{" "}
				<span className="font-bold text-accent">Pull & Blue Bins</span>,{" "}
				<span className="font-bold text-accent">Bottleneck & Takt</span>, and{" "}
				<span className="font-bold text-accent">One-Piece Flow</span>.
			</p>
			<Link
				to="/sim"
				className="inline-flex items-center gap-2 px-6 py-3 rounded-sm border-2 border-accent-dim bg-[#00c853] hover:bg-[#008f3a] text-factory-bg font-medium transition-colors"
			>
				<PlayCircle size={20} />
				Start simulation
			</Link>
		</div>
	);
}
