/* Public site: reads content saved by Pages CMS to GitHub. No admin passwords on this site. */
(async function(){
 const get=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('Cannot load '+url);return r.json()};
 const text=(selector,value)=>{const e=document.querySelector(selector);if(e&&typeof value==='string')e.textContent=value};
 try{
  const s=await get('data/settings.json');
  const b=await get('data/business.json').catch(()=>({}));
  text('.hero-copy h1',s.headline);text('.hero-copy > p',s.tagline);
  text('.about-grid > div:last-child p',s.about);
  text('.contact-details a:nth-child(1) strong',(b.phone||s.phone_display)+' ↗');
  text('.contact-details a:nth-child(2) strong',(b.email||s.email)+' ↗');
  text('.contact-details > div strong',b.address||s.address);
  if(s.business_name)document.title=s.business_name+' | Printing & Packaging';
  if(b.email||s.email){const a=document.querySelector('.contact-details a:nth-child(2)');if(a)a.href='mailto:'+(b.email||s.email)}
  const wa=String(b.phone||s.whatsapp||'').replace(/\D/g,'');
  if(wa){window.printpackWhatsapp=wa;document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{const old=new URL(a.href);a.href='https://wa.me/'+wa+(old.search||'')})}
 }catch(e){console.warn('Business details could not be loaded:',e)}
 try{
  const data = await get('data/products.json');
const products = data.products || [];
if (!Array.isArray(products)) return;
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

 
 // Load Services from Pages CMS
 try {
  const data = await get('data/services.json');
  const services = data.services;
  const grid = document.querySelector('#services .service-grid');

  if (grid && Array.isArray(services) && services.length) {
   const cards = [...grid.querySelectorAll('.service-card')];

   services.slice(0, cards.length).forEach((service, index) => {
    if (!service) return;

    const card = cards[index];
    const name = card.querySelector('h3');
    const description = card.querySelector('p');
    const art = card.querySelector('.service-art');

    if (name && typeof service.name === 'string') {
     name.textContent = service.name;
    }

    if (description && typeof service.description === 'string') {
     description.textContent = service.description;
    }

    if (art && typeof service.image === 'string' && service.image.trim()) {
     const imagePath = service.image.trim();

     if (!/^\s*(javascript:|data:)/i.test(imagePath)) {
      const img = document.createElement('img');
      img.src = imagePath;
      img.alt = service.name || 'Printing service';
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';

      art.replaceChildren(img);
     }
    }
   });
  }
 } catch (e) {
  console.warn('Services could not be loaded:', e);
 }
})();

/* Clickable service photo galleries */
(async function () {
  try {
    const response = await fetch('data/services.json', { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    const services = data.services || [];
    const cards = document.querySelectorAll('#services .service-card');

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px;box-sizing:border-box';

    overlay.innerHTML = `
      <button type="button" aria-label="Close gallery" style="position:absolute;top:15px;right:20px;color:white;background:none;border:0;font-size:36px;cursor:pointer">×</button>
      <button type="button" aria-label="Previous photo" style="color:white;background:none;border:0;font-size:36px;cursor:pointer;padding:10px">❮</button>
      <div style="text-align:center;max-width:85vw">
        <img style="max-width:100%;max-height:75vh;object-fit:contain;border-radius:10px" alt="Service photo">
        <p style="color:white;margin:12px 0"></p>
      </div>
      <button type="button" aria-label="Next photo" style="color:white;background:none;border:0;font-size:36px;cursor:pointer;padding:10px">❯</button>
    `;

    document.body.appendChild(overlay);

    const buttons = overlay.querySelectorAll('button');
    const image = overlay.querySelector('img');
    const caption = overlay.querySelector('p');

    let photos = [];
    let current = 0;
    let title = '';

    function showPhoto() {
      image.src = photos[current];
      image.alt = title;
      caption.textContent = title + ' — ' + (current + 1) + ' / ' + photos.length;
    }

    function closeGallery() {
      overlay.style.display = 'none';
      image.removeAttribute('src');
    }

    buttons[0].onclick = closeGallery;
    buttons[1].onclick = function () {
      current = (current - 1 + photos.length) % photos.length;
      showPhoto();
    };
    buttons[2].onclick = function () {
      current = (current + 1) % photos.length;
      showPhoto();
    };

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeGallery();
    });

    document.addEventListener('keydown', function (event) {
      if (overlay.style.display !== 'flex') return;
      if (event.key === 'Escape') closeGallery();
      if (event.key === 'ArrowRight') buttons[2].click();
      if (event.key === 'ArrowLeft') buttons[1].click();
    });

    cards.forEach(function (card, index) {
      const service = services[index];
      if (!service) return;

      card.style.cursor = 'pointer';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View ' + service.name + ' photos');

      function openGallery() {
        const gallery = Array.isArray(service.gallery) ? service.gallery : [];
        photos = [service.image, ...gallery]
          .filter(path => typeof path === 'string' && path.trim() && !/^\s*(javascript|data):/i.test(path));

        if (!photos.length) return;

        title = service.name || 'Service Photos';
        current = 0;
        showPhoto();
        overlay.style.display = 'flex';
      }

      card.addEventListener('click', openGallery);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openGallery();
        }
      });
    });
  } catch (error) {
    console.warn('Service gallery could not load:', error);
  }
})();
