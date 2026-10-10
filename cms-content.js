/* Public site: reads content saved by Pages CMS to GitHub. No admin passwords on this site. */
(async function(){
 const get=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Cannot load '+url);return r.json()};
 const text=(selector,value)=>{const e=document.querySelector(selector);if(e&&typeof value==='string')e.textContent=value};
 try{
  const s=await get('data/settings.json');
  text('.hero-copy h1',s.headline);text('.hero-copy > p',s.tagline);
  text('.about-grid > div:last-child p',s.about);
  text('.contact-details a:nth-child(1) strong',s.phone_display+' ↗');
  text('.contact-details a:nth-child(2) strong',s.email+' ↗');
  text('.contact-details > div strong',s.address);
  if(s.business_name)document.title=s.business_name+' | Printing & Packaging';
  if(s.email){const a=document.querySelector('.contact-details a:nth-child(2)');if(a)a.href='mailto:'+s.email}
  const wa=String(s.whatsapp||'').replace(/\D/g,'');
  if(wa){window.printpackWhatsapp=wa;document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{const old=new URL(a.href);a.href='https://wa.me/'+wa+(old.search||'')})}
 }catch(e){console.warn('Business details could not be loaded:',e)}
 try{
  const products=await get('data/products.json');if(!Array.isArray(products))return;
  const shown=products.filter(p=>p&&p.featured!==false&&p.name);
  const gallery=document.getElementById('product-gallery');if(!gallery||!shown.length)return;
  gallery.replaceChildren();
  for(const product of shown){
   const card=document.createElement('article');card.className='product-card';
   if(product.image&&typeof product.image==='string'&&!/^\s*(javascript:|data:)/i.test(product.image)){
    const img=document.createElement('img');img.src=product.image;img.alt=product.name;img.loading='lazy';card.append(img);
   }
   const info=document.createElement('div');info.className='product-info';
   const cat=document.createElement('span');cat.textContent=product.category||'CUSTOM PRINTING';
   const name=document.createElement('h3');name.textContent=product.name;
   const desc=document.createElement('p');desc.textContent=product.description||'';
   const a=document.createElement('a');a.className='product-enquiry';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Enquire on WhatsApp ↗';
   const wa=window.printpackWhatsapp||'917600012424';a.href='https://wa.me/'+wa+'?text='+encodeURIComponent('Hello Print Pack, I want a quotation for '+product.name+'.');
   info.append(cat,name,desc,a);card.append(info);gallery.append(card);
  }
 }catch(e){console.warn('Products could not be loaded:',e)}
})();
