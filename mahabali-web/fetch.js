fetch('https://namma-onam.vercel.app/').then(r=>r.text()).then(t=>console.log(t.substring(t.indexOf('August 15') - 100, t.indexOf('August 15') + 100)))
