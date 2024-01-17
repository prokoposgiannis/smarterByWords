import React from 'react';
import '../../App.css';

export default function WordView({ wordData }) {
  return (
    <div className='WordContainer'>
      <div>
        <h1 className='WordTitleText'>Η λέξη της ημέρας: </h1>
        <h1 className='WordText'>{wordData.word}</h1>
      </div>
      <div>
        <h1 className='DefTitleText'>Ορισμός: </h1>
        <h1 className='DefText'>
          {wordData.definition} <br />
        </h1>
        <a
          href={`${wordData.link}`}
          target='_blank'
          rel='noopener noreferrer'
          className='my-link '
        >
          πηγή
        </a>
      </div>
    </div>
  );
}
