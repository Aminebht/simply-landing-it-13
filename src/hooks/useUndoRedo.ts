import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoHistoryInfo {
  past: number;
  future: number;
  total: number;
}

export function useUndoRedo<T>(initialState: T) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;
  
  const historyInfo: UndoRedoHistoryInfo = {
    past: state.past.length,
    future: state.future.length,
    total: state.past.length + state.future.length + 1
  };

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(currentState => {
      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future]
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(currentState => {
      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture
      };
    });
  }, [canRedo]);

  const set = useCallback((newPresent: T) => {
    setState(currentState => ({
      past: [...currentState.past, currentState.present],
      present: newPresent,
      future: []
    }));
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: []
    });
  }, []);

  const clearHistory = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  const getHistoryState = useCallback(() => {
    return {
      past: state.past.length,
      future: state.future.length,
      canUndo,
      canRedo
    };
  }, [state.past.length, state.future.length, canUndo, canRedo]);

  return {
    state: state.present,
    set,
    reset,
    undo,
    redo,
    canUndo,
    canRedo,
    historyInfo,
    clearHistory,
    getHistoryState
  };
}
