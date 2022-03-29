
import { createContext, useContext } from 'react';

export const GUIContext = createContext();

export function useGUI() {
    return useContext(GUIContext);
}