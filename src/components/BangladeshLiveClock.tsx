'use client';
import {useEffect,useState} from 'react';
export default function BangladeshLiveClock(){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer)},[]);
 return <time dateTime={now?.toISOString()} className="text-sm tabular-nums">{now?new Intl.DateTimeFormat('bn-BD',{timeZone:'Asia/Dhaka',dateStyle:'full',timeStyle:'medium'}).format(now):'বাংলাদেশ সময়'}</time>;
}
