import { Home, Menu, PlayCircle, SquarePen, X } from "lucide-react";
import { useState } from "react";

const navLinkClass =
	"flex items-center gap-3 p-3 rounded-sm border-2 border-transparent hover:border-factory-border hover:bg-factory-surface transition-colors mb-2";
const navLinkActiveClass =
	"flex items-center gap-3 p-3 rounded-sm bg-accent border-2 border-accent-dim text-factory-bg mb-2";
const navLinkHomeActiveClass =
	"flex items-center gap-3 p-3 rounded-sm bg-rust border-2 border-rust-light text-text mb-2";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const pathname =
		typeof window !== "undefined" ? window.location.pathname : "/";
	const isHome = pathname === "/";
	const isSim = pathname.startsWith("/sim") && pathname !== "/playground";
	const isPlayground = pathname === "/playground";

	return (
		<>
			<header className="p-4 flex items-center bg-factory-surface text-text border-b-4 border-factory-border shadow-[4px_4px_0_0_var(--color-factory-border)]">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="p-2 hover:bg-factory-panel rounded-sm border-2 border-transparent hover:border-factory-border transition-colors"
					aria-label="Open menu"
				>
					<Menu size={24} />
				</button>
				<h1 className="ml-4 text-xl font-normal pixel-font tracking-tight">
					<a href="/" className="text-text hover:text-accent">
						Lean Production Simulator
					</a>
				</h1>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-factory-panel text-text border-r-4 border-factory-border shadow-[4px_0_0_0_var(--color-factory-border)] z-50 transform transition-transform duration-300 ease-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b-2 border-factory-border">
					<h2 className="text-lg pixel-font">Navigation</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-factory-surface rounded-sm border-2 border-transparent hover:border-factory-border transition-colors"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<a
						href="/"
						onClick={() => setIsOpen(false)}
						className={isHome ? navLinkHomeActiveClass : navLinkClass}
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</a>

					<a
						href="/sim"
						onClick={() => setIsOpen(false)}
						className={isSim ? navLinkActiveClass : navLinkClass}
					>
						<PlayCircle size={20} />
						<span className="font-medium">Simulator</span>
					</a>

					<a
						href="/playground"
						onClick={() => setIsOpen(false)}
						className={isPlayground ? navLinkActiveClass : navLinkClass}
					>
						<SquarePen size={20} />
						<span className="font-medium">Playground</span>
					</a>
				</nav>
			</aside>
		</>
	);
}
