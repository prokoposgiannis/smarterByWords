import './App.css';
import WordModel from './components/word/WordModel';
import SidePanelModel from './components/sidePanel/SidePanelModel';

function App() {
  return (
    <div className='App'>
      <div className='AppLayout'>
        <WordModel />
        <SidePanelModel />
      </div>
    </div>
  );
}

export default App;
