import "./App.css";
import { useEffect, useState } from "react";

const API_URL = "https://random-word-api.herokuapp.com/word?number=1&length=5";

const wordLength = 5;



  
// Function to check if the word is valid
    async function isValidWords(word) {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
      } catch (error) {
        console.error("Validation word error", error);
        return false;
        
      }
    };
    export default function App() {
      const [guesses, setGuesses] = useState(Array(6).fill(""));
      const [solution, setSolution] = useState("");
      const [currentGuess, setCurrentGuess] = useState("");
      const [gameOver, setGameOver] = useState(false);
      const [error, setError] = useState("");
      const [validwords, setValidWords] = useState(new Set());
  // Keydown event handler for user input
  useEffect(() => {
    const handleType =async (event) => {
      if (gameOver) return;

      if (event.key === "Enter") {
        if (currentGuess.length !== 5) return;
        
        const valid = await isValidWords(currentGuess.toLowerCase());
        if (!valid) {
          setError("Invalid word");
          return;
        }
        setError("");

        const emptyIndex = guesses.findIndex(val => val === "");
        if (emptyIndex === -1) return;

        const newGuesses = [...guesses];
        newGuesses[emptyIndex] = currentGuess;
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess === solution) {
          setGameOver(true);
        }
      } else if (event.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (
        event.key.match(/^[a-zA-Z]$/) &&
        currentGuess.length < wordLength
      ) {
        setCurrentGuess((prev) => prev + event.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleType);
    return () => window.removeEventListener("keydown", handleType);
  }, [currentGuess, guesses, gameOver, solution, validwords]);

  // Fetch the solution word on mount
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const response = await fetch(API_URL);
        const words = await response.json();
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setSolution(randomWord.toLowerCase());
      } catch (error) {
        console.error("Error fetching solution word:", error);
      }
    };
    fetchWord();
  }, []);

  return (
    <div className="board">
      {error && <div className="error">{error}</div>}
      {guesses.map((guess, index) => {
        const isCurrentGuess = index === guesses.findIndex(val => val === "");
        return (
          <Line
            key={index}
            guess={isCurrentGuess ? currentGuess : guess}
            isFinal={!isCurrentGuess && guess !== ""}
            solution={solution}
          />
        );
      })}
    </div>
  );
}

function Line({ guess, isFinal, solution }) {
  const tiles = [];

  for (let i = 0; i < wordLength; i++) {
    const char = guess[i];
    let className = "tile";

    if (isFinal && char) {
      if (char === solution[i]) {
        className += " correct";
      } else if (solution.includes(char)) {
        className += " close";
      } else {
        className += " incorrect";
      }
    }

    tiles.push(
      <div key={i} className={className}>
        {char || " "}
      </div>
    );
  }

  return <div className="line">{tiles}</div>;
}
