import React, { useState, useEffect } from 'react';
import { getWordOfTheDay, setWordIndex } from '../../firebase/config';
import WordView from './WordView';

export default function WordModel() {
  const [word, setWord] = useState('...');

  useEffect(() => {
    // const getWord = async () => {
    //   const data = await getWordOfTheDay();
    //   const json = await data.json();
    //   setWord(json);
    //   console.log(json);
    // };
    // getWord().catch(console.error);
    const fetchWordOfTheDay = async () => {
      try {
        const data = await getWordOfTheDay();
        setWord(data);
      } catch (error) {
        console.error('Error fetching word of the day:', error);
      }
    };

    // setWordIndex();
    fetchWordOfTheDay();
  }, []);

  return <WordView wordData={word} />;
}
