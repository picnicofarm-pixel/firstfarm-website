import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight,Check,Leaf,Send} from 'lucide-react';
import {Layout,Link} from './components/Layout';
import {business,solutions,partners} from './data/site';
import {contentRepository,mergeContent} from './services/contentRepository';
import AdminConsole from './admin/AdminConsole';
import './styles.css';

function usePath(){
  const [path,setPath]=useState(location.pathname);
  useEffect(()=>{
    const handle=()=>setPath(location.pathname);
    addEventListener('popstate',handle);
    return()=>removeEventListener('popstate',handle);
  },[]);
  return path;
}

function usePublishedContent(){
  const [content,setContent]=useState(()=>mergeContent());
  useEffect(()=>{
    let alive=true;
    contentRepository.readPublished().then((saved)=>{
      if(alive) setContent(mergeContent(saved));
    });
    return()=>{alive=false};
  },[]);
  return content;
}

function Placeholder(){
  return <div className="placeholder"><Leaf size={25}/><span>자료 입력 필요</span><small>관리자에서 실제 콘텐츠를 추가할 수 있습니다.</small></div>;
}

function Hero({page,eyebrow='FIRSTFARM'}){
  return <section className="page-hero" style={page.image?{backgroundImage:`linear-gradient(#143c32d9,#143c32b3),url(${page.image})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{page.title.split('\n').map((line,index)=><React.Fragment key={index}>{line}{index<page.title.split('\n').length-1&&<br/>}</React.Fragment>)}</h1>
      <p>{page.description}</p>
    </div>
  </section>;
}

function Home({pages}){
  const h=pages.home;
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">AGRICULTURE · TECHNOLOGY · CONNECTION</p>
        <h1>{h.title.split('\n').map((line,index)=><React.Fragment key={index}>{index===1?<em>{line}</em>:line}{index===0&&<br/>}</React.Fragment>)}</h1>
        <p className="lead">{h.description}</p>
        <div className="actions">
          <Link className="primary" to="/business">{h.button}<ArrowRight size={18}/></Link>
          <Link className="text-btn" to="/solutions">교육 솔루션 살펴보기<ArrowRight size={17}/></Link>
        </div>
      </div>
      <div className="farm-art" style={h.image?{backgroundImage:`linear-gradient(#143c3299,#143c3255),url(${h.image})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
        {!h.image&&<><div className="sun"/><div className="window"><i/><i/><i/><i/></div><div className="rack"><b/><b/><b/></div><div className="plants">{Array.from({length:12}).map((_,i)=><span key={i}/>)}</div></>}
        <div className="tag">SMART AGRI<br/><small>{h.alt||'connected farming'}</small></div>
      </div>
    </section>

    {pages.about.visible&&<section className="intro wrap">
      <p className="eyebrow">ABOUT FIRSTFARM</p>
      <div className="split">
        <h2>{pages.about.title}</h2>
        <div><p>{pages.about.description}</p><Link className="under-link" to="/about">{pages.about.button}<ArrowRight size={16}/></Link></div>
      </div>
    </section>}

    {pages.business.visible&&<section className="business wrap">
      <p className="eyebrow">BUSINESS AREAS</p>
      <h2>{pages.business.title}</h2>
      <div className="cards cards-four">{business.map((item,index)=><article key={item.slug}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.summary}</p><Link className="under-link" to="/business">자세히 보기<ArrowRight size={15}/></Link></article>)}</div>
    </section>}

    <section className="effects">
      <div className="wrap">
        <p className="eyebrow">CORE STRENGTHS</p>
        <h2>연결된 구조가 <em>가능성을 만듭니다.</em></h2>
        <div className="benefits benefits-four">{['통합 제공','운영 지속성','데이터 축적','현장 맞춤 설계'].map((item,index)=><article key={item}><span>0{index+1}</span><h3>{item}</h3><p>실제 현장에 맞는 구성과 지속 가능한 사용 흐름을 함께 설계합니다.</p><Check/></article>)}</div>
      </div>
    </section>
  </>;
}

function Listing({page,type}){
  const items=type==='business'?business:type==='solutions'?solutions:type==='partnership'?partners:[];
  return <><Hero page={page} eyebrow={page.name.toUpperCase()}/><section className="wrap section">{items.length?<div className="cards cards-four">{items.map((item,index)=><article key={item.slug||item.title}><span>0{index+1}</span><h3>{item.title}</h3><p>{item.summary||item.text||'현장에 맞는 협력과 운영 구조를 함께 설계합니다.'}</p>{item.items&&<ul>{item.items.map(text=><li key={text}>{text}</li>)}</ul>}</article>)}</div>:<Placeholder/>}</section></>;
}

function Contact({page}){
  const [sent,setSent]=useState(false);
  return <><Hero page={page} eyebrow="CONTACT"/><section className="wrap section contact-grid">
    <div><h2>도입·협업·제휴 문의</h2><p>스마트팜 구축, 교육 프로그램, 공공사업, ESG 협업, 투자와 관련한 문의를 기다립니다.</p></div>
    <form onSubmit={event=>{event.preventDefault();setSent(true)}}>
      <label>기관명<input required/></label>
      <label>담당자명<input required/></label>
      <label>이메일<input required type="email"/></label>
      <label>문의 내용<textarea required/></label>
      <label className="agree"><input required type="checkbox"/> 개인정보 수집 및 이용에 동의합니다.</label>
      <button className="primary">{page.button}<Send size={16}/></button>
      {sent&&<p className="sent">문의가 접수되었습니다.</p>}
    </form>
  </section></>;
}

function App(){
  const path=usePath();
  if(path==='/admin') return <AdminConsole/>;

  const content=usePublishedContent();
  const pages=content.pages;
  const key=path==='/'?'home':path.split('/')[1]||'home';
  const page=pages[key]||pages.contact;
  if(!page.visible&&key!=='home') return <Layout><Hero page={{...page,title:'공개 준비 중',description:'이 페이지는 현재 공개 준비 중입니다.'}}/></Layout>;

  const view=key==='home'?<Home pages={pages}/>:key==='contact'?<Contact page={page}/>:<Listing page={page} type={key}/>;
  return <Layout>{view}</Layout>;
}

createRoot(document.getElementById('root')).render(<App/>);
