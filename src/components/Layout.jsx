import React,{useState} from 'react';
import {Menu,X,ArrowRight} from 'lucide-react';

const nav=[
  ['회사소개','/about'],
  ['사업영역','/business'],
  ['교육 솔루션','/solutions'],
  ['프로젝트','/projects'],
  ['파트너십','/partnership'],
  ['IR','/ir'],
  ['소식','/news']
];

export function Link({to,children,className='',onClick}) {
  return <a className={className} href={to} onClick={event=>{
    event.preventDefault();
    history.pushState({},'',to);
    dispatchEvent(new PopStateEvent('popstate'));
    onClick?.(event);
  }}>{children}</a>;
}

export function Layout({children}){
  const [open,setOpen]=useState(false);
  return <>
    <header className="site-header">
      <Link to="/" className="brand brand-horizontal"><img src="/images/logo/firstfarm-horizontal.png" alt="퍼스트팜 로고"/></Link>
      <nav>{nav.map(([name,path])=><Link key={path} to={path}>{name}</Link>)}</nav>
      <Link className="contact-mini" to="/contact">문의하기 <ArrowRight size={15}/></Link>
      <button className="menu" onClick={()=>setOpen(!open)} aria-label="메뉴 열기">{open?<X/>:<Menu/>}</button>
      {open&&<div className="mobile-nav">{nav.map(([name,path])=><Link key={path} to={path} onClick={()=>setOpen(false)}>{name}</Link>)}<Link to="/contact" onClick={()=>setOpen(false)}>문의하기</Link></div>}
    </header>
    {children}
    <footer>
      <Link to="/" className="brand brand-horizontal"><img src="/images/logo/firstfarm-horizontal.png" alt="퍼스트팜 로고"/></Link>
      <p>농업의 가능성을 기술과 연결합니다</p>
      <small>© FIRSTFARM. All rights reserved.</small>
    </footer>
  </>;
}
