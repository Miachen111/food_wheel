import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRouletteWheel } from '../../hooks/useRouletteWheel';
import { filterCandidates } from '../../utils/filterUtils';
import { FilterPanel } from './FilterPanel';
import RouletteWheel from './RouletteWheel';
import { ResultModal } from './ResultModal';

export function RoulettePage() {
  const { state, dispatch } = useAppContext();
  const { currentAngle, isSpinning, spin, selectedIndex } = useRouletteWheel();

  const candidates = filterCandidates(state.restaurants, state.filters);
  const wheelCandidates = candidates.map((r) => ({ id: r.id, name: r.name }));

  const prevIsSpinning = useRef(isSpinning);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync isSpinning state to UI (to disable nav during spin)
  useEffect(() => {
    if (isSpinning && !prevIsSpinning.current) {
      dispatch({ type: 'SET_UI', payload: { isSpinning: true } });
    }
    if (!isSpinning && prevIsSpinning.current) {
      dispatch({ type: 'SET_UI', payload: { isSpinning: false } });
    }
    prevIsSpinning.current = isSpinning;
  }, [isSpinning, dispatch]);

  // When spin completes, wait 500ms then open ResultModal
  useEffect(() => {
    if (!isSpinning && selectedIndex !== null) {
      const selected = candidates[selectedIndex];
      if (selected) {
        timerRef.current = setTimeout(() => {
          dispatch({ type: 'SET_UI', payload: { resultRestaurantId: selected.id } });
        }, 500);
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSpinning, selectedIndex, candidates, dispatch]);

  const handleSpin = useCallback(() => {
    if (candidates.length === 1) {
      // Skip animation, directly show result
      const single = candidates[0];
      if (single) {
        dispatch({ type: 'SET_UI', payload: { resultRestaurantId: single.id } });
      }
    } else if (candidates.length > 1) {
      spin(candidates.length);
    }
  }, [candidates, spin, dispatch]);

  const handleSpinAgain = useCallback(() => {
    dispatch({ type: 'SET_UI', payload: { resultRestaurantId: null } });
    // Small delay to let modal close before triggering spin
    setTimeout(() => {
      handleSpin();
    }, 100);
  }, [dispatch, handleSpin]);

  const handleCloseResult = useCallback(() => {
    dispatch({ type: 'SET_UI', payload: { resultRestaurantId: null } });
  }, [dispatch]);

  // Resolve result restaurant
  const resultRestaurant = state.ui.resultRestaurantId
    ? state.restaurants.find((r) => r.id === state.ui.resultRestaurantId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-6">
      <FilterPanel
        filters={state.filters}
        onChange={(filters) => dispatch({ type: 'SET_FILTERS', payload: filters })}
        onReset={() => dispatch({ type: 'RESET_FILTERS' })}
        candidateCount={candidates.length}
        allTags={state.tags}
      />

      <RouletteWheel
        candidates={wheelCandidates}
        currentAngle={currentAngle}
        isSpinning={isSpinning}
        onSpin={handleSpin}
      />

      {resultRestaurant && (
        <ResultModal
          restaurant={resultRestaurant}
          tags={state.tags}
          onClose={handleCloseResult}
          onSpinAgain={handleSpinAgain}
        />
      )}
    </div>
  );
}
