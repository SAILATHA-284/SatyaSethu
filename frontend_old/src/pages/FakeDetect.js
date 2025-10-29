import React, {useState} from 'react';
import { detectText, uploadImage } from '../api/api';

export default function FakeDetect(){
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const submitText = async () => {
    const r = await detectText(text);
    setResult(r.data);
  };
  const submitFile = async () => {
    const r = await uploadImage(file);
    setResult(r.data);
  };

  return (
    <div>
      <h2>Fake News Detection</h2>
      <div>
        <h3>Text</h3>
        <textarea rows={8} cols={80} value={text} onChange={e=>setText(e.target.value)} />
        <br/>
        <button onClick={submitText}>Analyze Text</button>
      </div>
      <div>
        <h3>Image</h3>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
        <button onClick={submitFile}>Upload Image</button>
      </div>
      <div><h3>Result</h3><pre>{result ? JSON.stringify(result, null, 2) : 'No result yet'}</pre></div>
    </div>
  );
}
