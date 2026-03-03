import { create } from 'zustand';

interface ILoadingStore {
    zStatusLoading: boolean;
    zStartLoading: () => void;
    zEndLoading: () => void;
}


const useLoadingStore = create<ILoadingStore>((set) => ({
    zStatusLoading: false,
    zStartLoading: () => set((state) => ({ zStatusLoading: true })),
    zEndLoading: () => set((state) => ({ zStatusLoading: false })),
}));

export default useLoadingStore;