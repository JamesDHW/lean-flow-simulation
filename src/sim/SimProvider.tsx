import { createContext, useMemo, useRef, useContext } from "react";
import type { StepId } from "./step-config";
import type { SimSnapshot, SimStore } from "./store";
import { createSimStore, useSimStoreSnapshot } from "./store";
import type { SimConfig } from "./types";

const SimStoreContext = createContext<SimStore | null>(null);

export interface SimProviderProps {
	children: React.ReactNode;
	initialStepId?: StepId;
}

export function SimProvider({
	children,
	initialStepId = "intro",
}: SimProviderProps) {
	const storeRef = useRef<SimStore | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createSimStore(initialStepId);
	}
	const store = storeRef.current;

	const value = useMemo(() => store, [store]);

	return (
		<SimStoreContext.Provider value={value}>
			{children}
		</SimStoreContext.Provider>
	);
}

export function useSimStore(): SimStore {
	const ctx = useContext(SimStoreContext);
	if (ctx == null) {
		throw new Error("useSimStore must be used within SimProvider");
	}
	return ctx;
}

export function useSimSnapshot<T>(selector: (snap: SimSnapshot) => T): T {
	const store = useSimStore();
	return useSimStoreSnapshot(store, selector);
}

// Re-export for components that need config/state types
export type { SimConfig, SimSnapshot };
