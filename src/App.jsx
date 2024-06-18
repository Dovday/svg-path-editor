import React, { useState } from 'react';
import './App.css';

function App() {
  const [dProps, setDProps] = useState([]);
  const [svgContent, setSvgContent] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setSvgContent(content);
        extractDProps(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDPropChange = (event) => {
    setDProps([event.target.value]);
    setSvgContent(`<svg><path d="${event.target.value}" /></svg>`);
  };

  const extractDProps = (svgString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');
    const dValues = Array.from(paths).map(path => path.getAttribute('d'));
    setDProps(dValues);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  const parsePath = (d, precision = 0) => {
    // Split the d prop into commands
    let cmdRegEx = /[a-z][^a-z]*/ig;
    let commands = d.match(cmdRegEx);

    // round the numbers to 0 decimal places
    commands = commands.map((command) => {
      // get the command letter
      console.log('🪩 command', command);
      const cmd = command[0];
      if (cmd === 'z' || cmd === 'Z') return cmd;
      // get the numbers
      const numbers = command.slice(1).trim().split(/\s|,/);
      // round the numbers to 0 decimal places
      const roundedNumbers = numbers.map((num) => {
        return Number(num).toFixed(precision);
      });
      // join the rounded numbers
      return cmd + roundedNumbers.join(' ');
      });

    return commands;
  };

  const handleNormalization = () => {
  // Normalize the d props
  // 1. calculate the bounding box of the path
  // 2. translate the path to the origin
  // 3. scale the path to fit the bounding box into a 100x100 box
  // 4. translate the path to the center of the box
  // 5. round the numbers to 3 decimal places
  // 6. remove unnecessary symbols to minify the path

  // 1. calculate the bounding box of the path
  const path = document.querySelector('path');
  console.log('🪩 path', path);
  const boundingBox = path.getBBox();
  console.log('🪩 boundingBox', boundingBox);

  const d = dProps[0];
  console.log('🪩 d', d);
  let commands = parsePath(d);
  // get all x values from commands
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  commands.forEach((command) => {
    const cmd = command[0];
    if (cmd === 'z' || cmd === 'Z') return;

    const numbers = command.slice(1).trim().split(/\s|,/);
    let xValues = numbers.filter((num, index) => index % 2 === 0);
    let yValues = numbers.filter((num, index) => index % 2 === 1);

    // clear x and y values from NaN
    xValues = xValues.filter(num => !isNaN(num));
    yValues = yValues.filter(num => !isNaN(num));

    minX = Math.min(...xValues, minX);
    maxX = Math.max(...xValues, maxX);
    minY = Math.min(...yValues, minY);
    maxY = Math.max(...yValues, maxY);

    return command;
  });

  console.log('🔥 commands', commands);

  // translate the path to the origin
  const translateX = -minX;
  const translateY = -minY;
  commands = commands.map((command) => {
    const cmd = command[0];
    if (cmd === 'z' || cmd === 'Z') return cmd;
    const numbers = command.slice(1).trim().split(/\s|,/);
    const translatedNumbers = numbers.map((num, index) => {
      if (index % 2 === 0) {
        return Number(num) + translateX;
      } else {
        return Number(num) + translateY;
      }
    });
    return cmd + translatedNumbers.join(' ');
  });

  console.log('🧊 commands', commands);

  // unify the path commands into a single string
  const normalizedD = commands.join(' ');
  setSvgContent(`<svg width="100" height="100"><path d="${normalizedD}" /></svg>`);
  };

  return (
    <div className="App">
      <h1>SVG Evaluator</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="svgFile">Upload SVG file:</label>
          <input type="file" id="svgFile" accept=".svg" onChange={handleFileChange} />
        </div>
        <div>
          <label htmlFor="dProp">Paste `d` prop of a path:</label>
          <input type="text" id="dProp" onChange={handleDPropChange} />
        </div>
        <button type="submit">Evaluate</button>
        <button onClick={handleNormalization}>Normalize</button>
      </form>
      <div className="svg-container" dangerouslySetInnerHTML={{ __html: svgContent }} />
    </div>
  );
}

export default App;
