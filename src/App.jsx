import React, { useState } from 'react';
import './App.css';

function App() {
  const [dProp, setDProp] = useState('');
  const [translatedDProp, setTranslatedDProp] = useState('');
  const [svgContent, setSvgContent] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSvgContent(content);
        extractDProp(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSvgContent(content);
        extractDProp(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDPropChange = (event) => {
    const value = event.target.value;
    setDProp(value);
    setSvgContent(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${value}" /></svg>`);
  };

  const extractDProp = (svgString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const path = doc.querySelector('path');
    if (path) {
      setDProp(path.getAttribute('d'));
    }
  };

  const handleTranslate = () => {
    if (dProp) {
      const translated = translatePathToOrigin(dProp);
      setTranslatedDProp(translated);
    }
  };

  const translatePathToOrigin = (d) => {
    const commands = parsePath(d);
    const xValues = commands.flatMap(command =>
      command.values.filter((_, index) => index % 2 === 0)
    );
    const minX = Math.min(...xValues);
    const dx = -minX;

    const translatedCommands = commands.map(command => {
      const { type, values } = command;
      const newValues = values.map((value, index) => {
        if (index % 2 === 0) {
          // x coordinate
          return Math.round(value + dx);
        }
        return value;
      });
      return { type, values: newValues };
    });

    return translatedCommands.map(commandToString).join(' ');
  };

  const parsePath = (d) => {
    const commands = [];
    const commandTypes = /[a-zA-Z]/g;
    let match;
    let lastIndex = 0;

    while ((match = commandTypes.exec(d)) !== null) {
      if (match.index > lastIndex) {
        const values = d.slice(lastIndex + 1, match.index).trim().split(/[\s,]+/).map(Number);
        commands.push({ type: d[lastIndex], values });
      }
      lastIndex = match.index;
    }

    if (lastIndex < d.length) {
      const values = d.slice(lastIndex + 1).trim().split(/[\s,]+/).map(Number);
      commands.push({ type: d[lastIndex], values });
    }

    return commands;
  };

  const commandToString = (command) => {
    const { type, values } = command;
    return `${type} ${values.join(' ')}`;
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSvgContent(content);
        extractDProp(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="App" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <h1>SVG Path Translator</h1>
      <form>
        <div
          className="drop-zone"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          Drop SVG file here
          <label htmlFor="svgFile">Upload SVG file:</label>
          <input type="file" id="svgFile" accept=".svg" onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="dProp">Paste `d` prop of a path:</label>
          <input type="text" id="dProp" value={dProp} onChange={handleDPropChange} />
        </div>
      </form>
      <button onClick={handleTranslate}>Translate to Origin</button>
      <h2>Original Path:</h2>
      <svg width="200" height="200">
        <path d={dProp} stroke="black" fill="black" />
      </svg>
      <h2>Translated Path:</h2>
      <svg width="200" height="200">
        <path d={translatedDProp} stroke="red" fill="none" />
      </svg>
    </div>
  );
}

export default App;
