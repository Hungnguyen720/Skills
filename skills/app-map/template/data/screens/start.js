// Screens: Sign in. Example data for a made-up dog walking app. Replace it.
// Screen files load after engine/wireframe.js, in menu order, and push onto S.

S.push({
  id: 'signin', title: 'Sign in', purpose: 'How a walker gets in.',
  desk: solo(`
    <div style="max-width:300px;margin:0 auto">
      <div class="etitle" style="margin-bottom:10px">Dog walks ${pin(1)}</div>
      ${lab('Email')}${field('', '100%')}${lab('Password')}${field('', '100%')}
      <div class="row" style="margin-top:12px">${btn('Sign in', 1, 'identity.signIn')}</div>
    </div>`),
  phones: [
    phone('Settings', `<div class="sec" style="margin-top:6px">Account</div>${lab('Email')}${bar('70%')}<div class="pbar">${btn('Sign out', 0, 'identity.signOut')}</div>`, { tab: 'Settings' }),
  ],
  notes: [
    'Email and password only for the first release (decided 2026-09-27).',
  ],
  questions: ['Should a walker stay signed in on their phone for 30 days?'],
})
