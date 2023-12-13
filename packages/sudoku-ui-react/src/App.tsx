/**
 * TODO:
 * 1. split components
 * 2. extract helper function(s) and hook(s)
 * 3. fix typing
 */

import { useState, useReducer, useEffect, FC, Reducer, Dispatch } from 'react';
import {initDeck, shuffleDeck, TDeck, TGameDeck, toGameDeck} from 'sudoku-core';
import './App.css';
import styles from './Deck.module.css';

const Result: FC<{
  deck: TDeck;
  gameDeck: TGameDeck;
}> = ({deck, gameDeck}) => JSON.stringify(deck) === JSON.stringify(gameDeck) ? 'success' : 'fail';

const deck = shuffleDeck(initDeck());

const INITIAL_DIFFICULTY = 4;

const initialState = {
  difficulty: INITIAL_DIFFICULTY,
  deck,
  gameDeck: toGameDeck(deck, INITIAL_DIFFICULTY)
};

type TAction = 
  | { type: 'regenerate' }
  | { type: 'reveal' }
  | { type: 'set'; payload: { i: number; j: number; num: number } }
  | { type: 'setDifficulty'; payload: number }

const deckReducer: Reducer<typeof initialState, TAction> = (state, action) => {
  const { type } = action;

  switch(type) {
    case 'regenerate':
      // eslint-disable-next-line no-case-declarations
      const newDeck = shuffleDeck(initDeck());
      return {
        ...state,
        deck: newDeck,
        gameDeck: toGameDeck(newDeck, state.difficulty)
      };
    case 'reveal': return {...state, gameDeck: state.deck};
    case 'set': return {...state, gameDeck: state.gameDeck.map((row, i) => row.map((cell, j) => i === action.payload.i && j === action.payload.j ? action.payload.num : cell))};
    case 'setDifficulty': return {...state, difficulty: action.payload, gameDeck: toGameDeck(state.deck, action.payload)};
    default: return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(deckReducer, initialState)
  const [numToHightLight, setNumToHightLight] = useState<null|number>(null);
  const [enterCoords, setEnterCoords] = useState<{i: number; j: number}>({i: -1, j: -1});

  useHandleNumnberEnter(dispatch, enterCoords);

  const handleClick = (cell: null|number, i: number, j: number) => () => {
    if (cell) {
      setEnterCoords({i: -1, j: -1});
      setNumToHightLight(curr => curr === cell ? null : cell);

    }

    if (!cell) {
      setNumToHightLight(null);
      setEnterCoords({ i, j });
    }
  };

  const nullCount = countNulls(state.gameDeck);
  const handleRegenerate = () => {
    dispatch({ type: 'regenerate' });
    setNumToHightLight(null);
    setEnterCoords({i: -1, j: -1});
  };

  return (
    <>
    <input
      type="range"
      min={2}
      max={8}
      value={state.difficulty}
      onChange={e => dispatch({ type: 'setDifficulty', payload: +e.target.value })}
    />
      <h2>{nullCount}</h2>
      {nullCount === 0 && <Result {...state}/>}
      <div>
        {state.gameDeck.map((row, i) => (
          <div key={`row-${i}`} className={styles.deckRow}>
            {row.map((cell, j) => (
              <div
                key={`cell-${i}-${j}`}
                className={`
                  ${styles.deckCell}
                  ${numToHightLight && numToHightLight === cell ? styles.highlighted : ''}
                  ${i === enterCoords.i && j === enterCoords.j ? styles.enter : ''}
                `}
                onClick={handleClick(cell, i, j)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleRegenerate}>regenerate</button>
      <button onClick={() => dispatch({ type: 'reveal' })}>reveal</button>
    </>
  )
}

function useHandleNumnberEnter(dispatch: Dispatch<TAction>, enterCoords: {i: number; j: number}) {
  useEffect(() => {
    const numberEnterListener = (e: KeyboardEvent) => {
      const { key } = e;

      if (key.match(/[1-9]/) && enterCoords.i !== -1) {
        dispatch({ type: 'set', payload: { num: parseInt(key, 10), ...enterCoords } })
      }
    };

    window.addEventListener('keypress', numberEnterListener);

    return () => window.removeEventListener('keypress', numberEnterListener);
  }, [dispatch, enterCoords]);
}

function countNulls (gameDeck: TGameDeck) {
  let nullCount = 0;
  for (let i = 0; i < 81; i++) {
    const cellI = Math.floor(i / 9);
    const cellJ = i % 9;

    if (gameDeck[cellI][cellJ] === null) nullCount++;
  }

  return nullCount;
}

export default App
