// TODO: provide better type modeling.

type TRow = [number,number,number,number,number,number,number,number,number]
export type TNullableRow = [number|null,number|null,number|null,number|null,number|null,number|null,number|null,number|null,number|null]

export type TDeck = TRow[];

export type TGameDeck = TNullableRow[];

type TDeckIndex = 0 | 1 | 2;

type TDeckTransformation = (deck: TDeck) => TDeck;

const GOLDEN_ROW = [1,2,3,4,5,6,7,8,9] as const;

const deepCopyDeck = (deck: TDeck): TDeck => deck.map(row => [...row]);

const getRandom = (max = 3) => Math.floor(Math.random() * max);

const getRandomIndexes = (attempts = 4): number[] => {
    const set = new Set<number>();

    for (let i = attempts; i > 0; i--) set.add(getRandom(9));

    return [...set];
};

export const initDeck = () => {
    const deck: TDeck = [];

    for (let i = 0; i < 9; i++) {
        const row = [...GOLDEN_ROW] as TRow;

        for (let j = i * 3 + Math.floor(i / 3); j > 0; j--) row.push(row.shift()!)

        deck.push(row);
    }

    return deck;
};

const rotateGlobalRows: TDeckTransformation = (deck) => {
    const deckCopy = deepCopyDeck(deck);

    const firstRow = deckCopy.splice(0, 3);
    const secondRow = deckCopy.splice(0, 3);
    const thirdRow = deckCopy.splice(0, 3);

    return [...secondRow, ...thirdRow, ...firstRow];
};

const rotateGlobalCols: TDeckTransformation = (deck) => {
    const deckCopy = deepCopyDeck(deck);

    const firstCol = deckCopy.map(row => row.splice(0, 3));
    const secondCol = deckCopy.map(row => row.splice(0, 3));
    const thirdCol = deckCopy.map(row => row.splice(0, 3));

    return secondCol.map((col, index) => [...col, ...thirdCol[index], ...firstCol[index]]) as TDeck;
};

const rotateLocalRows = (globalRowIndex: TDeckIndex): TDeckTransformation => (deck) => {
    const deckCopy = deepCopyDeck(deck);

    const firstRow = deckCopy.splice(0, 3);
    const secondRow = deckCopy.splice(0, 3);
    const thirdRow = deckCopy.splice(0, 3);

    if (globalRowIndex === 0) {
        const row = firstRow.splice(0, 1)[0];
        firstRow.splice(2, 0, row);
    }

    if (globalRowIndex === 1) {
        const row = secondRow.splice(0, 1)[0];
        secondRow.splice(2, 0, row);
    }

    if (globalRowIndex === 2) {
        const row = thirdRow.splice(0, 1)[0];
        thirdRow.splice(2, 0, row);
    }

    return [...firstRow, ...secondRow, ...thirdRow];
};

const rotateLocalCols = (globalColIndex: TDeckIndex): TDeckTransformation => (deck) => {
    const deckCopy = deepCopyDeck(deck);

    const firstCol = deckCopy.map(row => row.splice(0, 3));
    const secondCol = deckCopy.map(row => row.splice(0, 3));
    const thirdCol = deckCopy.map(row => row.splice(0, 3));

    if (globalColIndex === 0) {
        firstCol.forEach(row => row.push(row.shift()!));
    }

    if (globalColIndex === 1) {
        secondCol.forEach(row => row.push(row.shift()!));
    }

    if (globalColIndex === 2) {
        thirdCol.forEach(row => row.push(row.shift()!));
    }

    return firstCol.map((col, index) => [...col, ...secondCol[index], ...thirdCol[index]]) as TDeck;
};

export const shuffleDeck: TDeckTransformation = (deck) => {
    const operations: TDeckTransformation[] = [];

    const globalRowsRotationTimes = getRandom();
    for (let i = globalRowsRotationTimes; i > 0; i--) operations.push(rotateGlobalRows);

    const globalColsRotationTimes = getRandom();
    for (let i = globalColsRotationTimes; i > 0; i--) operations.push(rotateGlobalCols);

    const localRowsAt0RotationTimes = getRandom();
    if (localRowsAt0RotationTimes > 0) {
        const rotateLocalRows0 = rotateLocalRows(0);
        for (let i = localRowsAt0RotationTimes; i > 0; i--) operations.push(rotateLocalRows0);
    }

    const localRowsAt1RotationTimes = getRandom();
    if (localRowsAt1RotationTimes > 0) {
        const rotateLocalRows1 = rotateLocalRows(1);
        for (let i = localRowsAt1RotationTimes; i > 0; i--) operations.push(rotateLocalRows1);
    }

    const localRowsAt2RotationTimes = getRandom();
    if (localRowsAt2RotationTimes > 0) {
        const rotateLocalRows2 = rotateLocalRows(2);
        for (let i = localRowsAt2RotationTimes; i > 0; i--) operations.push(rotateLocalRows2);
    }

    const localColsAt0RotationTimes = getRandom();
    if (localColsAt0RotationTimes > 0) {
        const rotateLocalCols0 = rotateLocalCols(0);
        for (let i = localColsAt0RotationTimes; i > 0; i--) operations.push(rotateLocalCols0);
    }

    const localColsAt1RotationTimes = getRandom();
    if (localColsAt1RotationTimes > 0) {
        const rotateLocalCols1 = rotateLocalCols(1);
        for (let i = localColsAt1RotationTimes; i > 0; i--) operations.push(rotateLocalCols1);
    }

    const localColsAt2RotationTimes = getRandom();
    if (localColsAt2RotationTimes > 0) {
        const rotateLocalCols2 = rotateLocalCols(2);
        for (let i = localColsAt2RotationTimes; i > 0; i--) operations.push(rotateLocalCols2);
    }

    return operations.reduce((_deck, transformation) => transformation(_deck), deck);
}

export const toGameDeck = (deck: TDeck, difficulty: number): TGameDeck => deck.map(row => {
    const indexesToHide = getRandomIndexes(difficulty);

    return row.map((num, index) => indexesToHide.includes(index) ? null : num) as TNullableRow;
});