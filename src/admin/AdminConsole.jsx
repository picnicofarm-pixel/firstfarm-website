import React,{useEffect,useState} from 'react';
import {ImagePlus,LayoutTemplate,Palette,Search,Settings2,Save,Trash2,UploadCloud} from 'lucide-react';
import {Link} from '../components/Layout';
import {contentRepository,mergeContent} from '../services/contentRepository';

const menus=[
  ['대시보드',LayoutTemplate],
  ['브랜드 디자인',Palette],
  ['페이지 콘텐츠',Settings2],
  ['이미지 관리',ImagePlus],
  ['SEO 설정',Search]
];

function optimize(file,done){
  const image=new Image();
  image.onload=()=>{
    const max=1920;
    const ratio=Math.min(1,max/Math.max(image.width,image.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.round(image.width*ratio);
    canvas.height=Math.round(image.height*ratio);
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    done(canvas.toDataURL('image/webp',0.82));
    URL.revokeObjectURL(image.src);
  };
  image.src=URL.createObjectURL(file);
}

function Media({value,alt,onChange}){
  return <div className="media-upload">
    {value?<>
      <img src={value} alt={alt||'업로드 이미지 미리보기'}/>
      <button type="button" onClick={()=>onChange('')}><Trash2 size={15}/>이미지 삭제</button>
    </>:<div className="media-empty"><ImagePlus size={28}/><span>이미지 없음</span></div>}
    <label className="upload">사진 선택<input type="file" accept="image/*" onChange={event=>event.target.files?.[0]&&optimize(event.target.files[0],onChange)}/></label>
    <small>용량 제한 없이 업로드하면 1920px WebP로 자동 압축합니다.</small>
  </div>;
}

export default function AdminConsole(){
  const [tab,setTab]=useState(0);
  const [selected,setSelected]=useState('home');
  const [data,setData]=useState(()=>mergeContent(contentRepository.readLocal()));
  const [password,setPassword]=useState('');
  const [status,setStatus]=useState('로컬 임시 저장 상태');
  const [publishing,setPublishing]=useState(false);

  useEffect(()=>{
    contentRepository.readPublished().then((published)=>{
      const local=contentRepository.readLocal();
      setData(mergeContent(Object.keys(local).length?local:published));
    });
  },[]);

  const save=(next)=>{
    setData(next);
    contentRepository.writeLocal(next);
    setStatus('로컬 저장 완료');
  };

  const publish=async()=>{
    setPublishing(true);
    setStatus('GitHub에 게시 중...');
    try{
      const result=await contentRepository.publish(data,password);
      setStatus(result.message||'게시 완료');
    }catch(error){
      setStatus(error.message);
    }finally{
      setPublishing(false);
    }
  };

  const page=data.pages[selected];
  const pageUpdate=(key,value)=>save({...data,pages:{...data.pages,[selected]:{...page,[key]:value}}});
  const themeUpdate=(key,value)=>save({...data,theme:{...data.theme,[key]:value}});

  return <div className="admin-console">
    <aside>
      <Link className="brand brand-horizontal" to="/"><img src="/images/logo/firstfarm-horizontal.png" alt="퍼스트팜 로고"/></Link>
      <p className="eyebrow">SITE MANAGEMENT</p>
      {menus.map(([label,Icon],index)=><button className={tab===index?'active':''} key={label} onClick={()=>setTab(index)}><Icon size={17}/>{label}</button>)}
      <Link className="preview" to="/">사이트 미리보기</Link>
    </aside>

    <main className="console-main">
      <div className="console-heading">
        <div><p className="eyebrow">{menus[tab][0].toUpperCase()}</p><h1>{menus[tab][0]}</h1></div>
        <span><Save size={14}/>{status}</span>
      </div>

      {tab===0&&<div className="dashboard">
        <article><b>전체 페이지</b><strong>{Object.keys(data.pages).length}</strong><span>페이지별 콘텐츠 편집 가능</span></article>
        <article><b>저장 방식</b><strong>2</strong><span>로컬 저장 + 공개 게시</span></article>
        <article><b>이미지</b><strong>WebP</strong><span>자동 압축 적용</span></article>
        <article><b>배포</b><strong>GitHub</strong><span>게시 후 Vercel 자동 반영</span></article>
        <div className="dashboard-note">
          <h2>공개 홈페이지에 반영</h2>
          <p>편집 내용은 먼저 이 브라우저에 임시 저장됩니다. 공개 홈페이지에 반영하려면 아래에서 게시를 누르세요.</p>
          <label>관리자 비밀번호<input type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="Vercel 환경변수 ADMIN_PASSWORD 사용 시 입력"/></label>
          <button className="primary" type="button" disabled={publishing} onClick={publish}><UploadCloud size={17}/>{publishing?'게시 중':'공개 홈페이지에 게시'}</button>
        </div>
      </div>}

      {tab===1&&<div className="settings-grid">
        <section>
          <h2>컬러 시스템</h2>
          {[['ink','기본 녹색'],['accent','포인트 색상'],['surface','배경 색상']].map(([key,label])=><label key={key}>{label}<input type="color" value={data.theme[key]} onChange={event=>themeUpdate(key,event.target.value)}/><code>{data.theme[key]}</code></label>)}
          <label>모서리 둥글기<input type="range" min="0" max="24" value={data.theme.radius} onChange={event=>themeUpdate('radius',event.target.value)}/></label>
        </section>
        <section>
          <h2>공식 로고</h2>
          <img className="logo-preview" src="/images/logo/firstfarm-symbol.png" alt="퍼스트팜 로고 심볼"/>
          <p>제공해주신 공식 로고를 적용하고 있습니다.</p>
        </section>
      </div>}

      {tab===2&&<div className="content-editor">
        <div className="page-list">{Object.entries(data.pages).map(([key,item])=><button className={key===selected?'selected':''} key={key} onClick={()=>setSelected(key)}><span>{item.visible?'●':'○'}</span>{item.name}</button>)}</div>
        <section className="page-edit">
          <div className="edit-title">
            <div><p className="eyebrow">PAGE SETTINGS</p><h2>{page.name}</h2></div>
            <label className="switch"><input type="checkbox" checked={page.visible} onChange={event=>pageUpdate('visible',event.target.checked)}/><span/>페이지 표시</label>
          </div>
          <label>페이지 제목<textarea value={page.title} onChange={event=>pageUpdate('title',event.target.value)}/></label>
          <label>소개 문구<textarea value={page.description} onChange={event=>pageUpdate('description',event.target.value)}/></label>
          <label>버튼 문구<input value={page.button} onChange={event=>pageUpdate('button',event.target.value)}/></label>
          <label>이미지 대체 텍스트<input value={page.alt} onChange={event=>pageUpdate('alt',event.target.value)} placeholder="이미지를 설명해 주세요"/></label>
          <Media value={page.image} alt={page.alt} onChange={value=>pageUpdate('image',value)}/>
        </section>
      </div>}

      {tab===3&&<div className="media-grid">{Object.entries(data.pages).map(([key,item])=><section className="media-card" key={key}><h2>{item.name}</h2><Media value={item.image} alt={item.alt} onChange={value=>save({...data,pages:{...data.pages,[key]:{...item,image:value}}})}/></section>)}</div>}

      {tab===4&&<section className="seo-editor">
        <label>사이트 제목<input value={data.seo.title} onChange={event=>save({...data,seo:{...data.seo,title:event.target.value}})}/></label>
        <label>사이트 설명<textarea value={data.seo.description} onChange={event=>save({...data,seo:{...data.seo,description:event.target.value}})}/></label>
        <label>검색 키워드<input placeholder="예: 스마트농업, 스마트팜, 애그리테크"/></label>
        <p className="help">게시하면 저장된 SEO 항목도 콘텐츠 데이터에 함께 반영됩니다.</p>
      </section>}
    </main>
  </div>;
}
