import React, { useState, useEffect } from "react";
import { getWordOfTheDay } from "../../firebase/config";
import WordView from "./WordView";

export default function WordModel() {
  const [word, setWord] = useState("...");

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      try {
        const data = await getWordOfTheDay();
        setWord(data);
      } catch (error) {
        console.error("Error fetching word of the day:", error);
      }
    };

    fetchWordOfTheDay();
  }, []);

  return <WordView wordData={word} />;
}
