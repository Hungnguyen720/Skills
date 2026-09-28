// Screens: Walks, Clients and Invoices. Example data for a made-up dog walking app. Replace it.

const walkCols = [{ h: 'Time', k: 't', w: '70px' }, { h: 'Dog', k: 't', w: '1.2fr' }, { h: 'Owner', k: 't', w: '1.2fr' }, { h: 'Status', k: 's', w: '1fr' }]

S.push({
  id: 'walks', title: 'Walks', purpose: 'Today\'s walks first, then the rest of the week. The walker\'s home page.',
  desk: shell('Walks', `
    <div class="phead"><span class="h">Walks</span>${btn('Book a walk', 1, 'walks.bookWalk')} ${pin(1)}</div>
    <div class="grp">Today ${pin(2)}</div>
    ${table(walkCols, [['=9:00', '=Biscuit', '=Ana Lopez', '=Booked'], ['=11:30', '=Mo', '=Sam Reid', '=Booked']])}
    <div class="grp">This week</div>
    ${table(walkCols, 3, { head: false, seed: 2 })}`),
  phone: phone('Walks', `<div class="sec">Today</div>${prows(2)}<div class="sec" style="margin-top:12px">This week</div>${prows(3, 2)}`, { act: '+' }),
  notes: [
    'Book a walk picks a dog, a day and a time. The owner comes from the dog.',
    'Today sits on top because a walker opens the app between walks (decided 2026-09-27).',
  ],
  questions: [],
})

S.push({
  id: 'walk', title: 'Walks: a walk', purpose: 'One walk. On a phone, Done is the only thing a walker presses.',
  desk: '',
  phones: [
    phone('Biscuit', `${head({ title: 'Biscuit', meta: 'Today 9:00 · Ana Lopez' })}${lab('Notes from the owner')}<div class="note">Pulls toward squirrels ${pin(1)}</div><div class="pbar">${btn('Cancel', 0, 'walks.cancelWalk')}${btn('Done', 1, 'walks.completeWalk')}</div>`, { back: 1 }),
  ],
  notes: [
    'Done adds a charge to the owner\'s month and emails them that the walk happened.',
  ],
  questions: ['Should Done ask for a photo?'],
})

S.push({
  id: 'clients', title: 'Clients', purpose: 'Owners and their dogs.',
  desk: shell('Clients', `
    <div class="phead"><span class="h">Clients</span>${btn('Add a client', 1, 'clients.addClient')}</div>
    ${table([{ h: 'Owner', k: 't', w: '1.4fr' }, { h: 'Dogs', k: 't', w: '1.4fr' }, { h: '', k: 'a', w: '40px' }], [['=Ana Lopez', `<span class="t">Biscuit</span> ${on('<span class="tag">+ dog</span>', 'clients.addDog')}`]])}`),
  notes: [],
  questions: [],
})

S.push({
  id: 'invoices', title: 'Invoices', purpose: 'What each client owes this month. Invoices go out on the 1st by themselves.',
  desk: shell('Invoices', `
    <div class="phead"><span class="h">Invoices</span></div>
    ${table([{ h: 'Client', k: 't', w: '1.4fr' }, { h: 'Walks', k: 'n', w: '70px' }, { h: 'Owed', k: 'n', w: '90px' }, { h: '', k: 't', w: '140px' }], [['=Ana Lopez', '#12', '#$240', btn('Send now', 0, 'invoices.sendInvoice')]])}`),
  notes: [],
  questions: [],
})
