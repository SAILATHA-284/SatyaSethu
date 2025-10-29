import React, {useState} from 'react';
import { ocrScan } from '../api/api';

export default function OCRScanner(){
  const [file, setFile] = useState(null);
  const [res, setRes] = useState(null);
  const scan = async () => {
    const r = await ocrScan(file);
    setRes(r.data);
  };
  return (
    <div>
      <h2>OCR Scanner</h2>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <button onClick={scan}>Scan</button>
      <pre>{res ? JSON.stringify(res, null, 2) : 'No OCR result yet'}</pre>
    </div>
  );
}
