import React, {useEffect, useState} from 'react';
import { getTopNews } from '../api/api';

export default function CurrentAffairs(){
  const [news, setNews] = useState([]);
  useEffect(()=>{ (async ()=>{
    try {
      const r = await getTopNews();
      setNews(r.data.articles || []);
    } catch(e){
      setNews([]);
    }
  })() }, []);
  return (
    <div>
      <h2>Current Affairs</h2>
      {news.length ? news.map((a,i)=>(
        <div key={i} style={{border:'1px solid #ddd', padding:8, margin:8}}>
          <a href={a.url} target='_blank' rel='noreferrer'><h4>{a.title}</h4></a>
          <p>{a.description || a.text || ''}</p>
        </div>
      )) : <p>No news or loading...</p>}
    </div>
  );
}
