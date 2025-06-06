import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://mnsugeicwtixdenfncni.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc3VnZWljd3RpeGRlbmZuY25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDA4MjMsImV4cCI6MjA2NDYxNjgyM30.t_HE_l-Oi-IiNmHtcgP3-IOXXY_IW5j3HJLMHCbDqt8'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const joinBtn = document.getElementById('joinBtn')
const roomInput = document.getElementById('roomInput')
const nameInput = document.getElementById('nameInput')
const categorySelect = document.getElementById('categorySelect')
const waitingDiv = document.getElementById('waiting')
const playersList = document.getElementById('playersList')
const roleChoice = document.getElementById('roleChoice')
const resultDiv = document.getElementById('result')
const resetBtn = document.getElementById('resetBtn')

let room = ''
let playerName = ''
let category = ''

const wordCategories = {
  Tiere: [
    "Hund", "Katze", "Elefant", "Löwe", "Tiger", "Bär", "Pferd", "Affe", "Giraffe", "Zebra",
    "Pinguin", "Frosch", "Krokodil", "Schlange", "Eule", "Fuchs", "Wolf", "Hase", "Maus", "Ratte",
    "Igel", "Dachs", "Waschbär", "Känguru", "Koala", "Nilpferd", "Nashorn", "Möwe", "Papagei", "Taube",
    "Schwan", "Ente", "Gans", "Storch", "Kranich", "Fisch", "Hai", "Delfin", "Wal", "Qualle",
    "Seestern", "Krabbe", "Tintenfisch", "Ameise", "Biene", "Wespe", "Schmetterling", "Käfer", "Libelle", "Spinne"
  ],
  Allgemein: [
  "Abenteuer", "Anfang", "Ball", "Buch", "Chance", "Dschungel", "Erinnerung", "Fahrrad", "Familie", "Freund",
  "Gedanke", "Haus", "Herbst", "Himmel", "Idee", "Insel", "Kamera", "Kerze", "Licht", "Liebe",
  "Magie", "Mensch", "Musik", "Natur", "Nebel", "Nuss", "Ozean", "Paket", "Papier", "Reise",
  "Riese", "Rose", "Sand", "Schatten", "Stern", "Straße", "Tag", "Tanz", "Tasse", "Traum",
  "Tür", "Uhr", "Versteck", "Wald", "Wasser", "Welle", "Wind", "Wolke", "Wunder", "Zukunft"
],
  Gegenstände: [
    "Tisch", "Stuhl", "Lampe", "Buch", "Laptop", "Handy", "Tastatur", "Maus", "Fernbedienung", "Fernseher",
    "Sofa", "Bett", "Schrank", "Spiegel", "Teppich", "Bild", "Fenster", "Tür", "Kühlschrank", "Ofen",
    "Herd", "Pfanne", "Topf", "Tasse", "Glas", "Teller", "Löffel", "Gabel", "Messer", "Kissen",
    "Decke", "Schreibtisch", "Regal", "Uhr", "Radio", "Ventilator", "Heizung", "Toaster", "Mikrowelle", "Föhn",
    "Waschmaschine", "Staubsauger", "Besen", "Mülleimer", "Batterie", "Kerze", "Lineal", "Stift", "Block", "Schere"
  ],
  Länder: [
    "Deutschland", "Frankreich", "Spanien", "Italien", "Portugal", "Österreich", "Schweiz", "Niederlande", "Belgien", "Dänemark",
    "Schweden", "Norwegen", "Finnland", "Polen", "Tschechien", "Ungarn", "Griechenland", "Türkei", "Russland", "Ukraine",
    "USA", "Kanada", "Mexiko", "Brasilien", "Argentinien", "Chile", "Peru", "Kolumbien", "Venezuela", "Ägypten",
    "Südafrika", "Nigeria", "Kenia", "China", "Japan", "Südkorea", "Indien", "Thailand", "Vietnam", "Indonesien",
    "Australien", "Neuseeland", "Iran", "Irak", "Syrien", "Saudi-Arabien", "Pakistan", "Afghanistan", "Philippinen", "Malaysia"
  ],
  Flaggen: [
    "🇩🇪", "🇯🇴", "🇫🇷", "🇪🇸", "🇮🇹", "🇵🇹", "🇦🇹", "🇨🇭", "🇳🇱", "🇧🇪", "🇩🇰",
    "🇸🇪", "🇳🇴", "🇫🇮", "🇵🇱", "🇨🇿", "🇭🇺", "🇬🇷", "🇹🇷", "🇷🇺", "🇺🇦",
    "🇺🇸", "🇨🇦", "🇲🇽", "🇧🇷", "🇦🇷", "🇨🇱", "🇵🇪", "🇨🇴", "🇻🇪", "🇪🇬",
    "🇿🇦", "🇳🇬", "🇰🇪", "🇨🇳", "🇯🇵", "🇰🇷", "🇮🇳", "🇹🇭", "🇻🇳", "🇮🇩",
    "🇦🇺", "🇳🇿", "🇮🇷", "🇮🇶", "🇸🇾", "🇸🇦", "🇵🇰", "🇦🇫", "🇵🇭", "🇲🇾"
  ]
}


function nowISO() {
  return new Date().toISOString()
}

window.addEventListener('beforeunload', async () => {
  await cleanup()
})

resetBtn.addEventListener('click', async () => {
  await cleanup()
  location.reload()
})

async function cleanup() {
  await supabase.from('rooms').delete().eq('room', room).eq('name', playerName)
  localStorage.clear()
}

window.addEventListener('DOMContentLoaded', async () => {
  const savedRoom = localStorage.getItem('room')
  const savedName = localStorage.getItem('name')
  const savedCategory = localStorage.getItem('category')
  if (savedRoom && savedName && savedCategory) {
    room = savedRoom
    playerName = savedName
    category = savedCategory

    const { data } = await supabase.from('rooms')
      .select('*')
      .eq('room', room)
      .eq('name', playerName)

    if (data && data.length > 0) {
      initUI()
      updatePlayerList()
    }
  }
})

joinBtn.addEventListener('click', async () => {
  room = roomInput.value.trim()
  playerName = nameInput.value.trim()
  category = categorySelect.value
  if (!room || !playerName || !category) return alert('Bitte alles ausfüllen.')

  localStorage.setItem('room', room)
  localStorage.setItem('name', playerName)
  localStorage.setItem('category', category)

  const { error } = await supabase.from('rooms').upsert({
    room, name: playerName, role: null, last_active: nowISO(), word: null
  }, { onConflict: ['room', 'name'] })

  if (error) {
    alert("Fehler beim Beitreten: " + error.message)
    return
  }

  initUI()
  updatePlayerList()
})

function initUI() {
  joinBtn.style.display = 'none'
  roomInput.style.display = 'none'
  nameInput.style.display = 'none'
  categorySelect.style.display = 'none'
  waitingDiv.style.display = 'block'
  resetBtn.style.display = 'block'

  supabase.channel('room-' + room)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'rooms',
      filter: 'room=eq.' + room
    }, updatePlayerList)
    .subscribe()
}

async function updatePlayerList() {
  const { data } = await supabase.from('rooms').select('*').eq('room', room)
  if (!data) return

  playersList.innerHTML = ''
  data.forEach(p => {
    const li = document.createElement('li')
    li.textContent = p.name
    playersList.appendChild(li)
  })

  if (data.length === 2 && data.every(p => p.role === null)) {
    waitingDiv.innerHTML = '<p>✅ Beide Spieler im Raum! Wähle deine Rolle...</p>'
    renderRoleChoice()
    resultDiv.style.display = 'none'
  }
}

function renderRoleChoice() {
  roleChoice.style.display = 'block'
  roleChoice.innerHTML = `
    <p>Wähle deine Rolle:</p>
    <button id="seeWordBtn">🟢 Ich will das Wort sehen</button>
    <button id="bluffBtn">🟡 Ich bluffe</button>
  `
  document.getElementById('seeWordBtn').onclick = () => handleChoice('word')
  document.getElementById('bluffBtn').onclick = () => handleChoice('bluff')
}

async function handleChoice(role) {
  await supabase.from('rooms').update({ role, last_active: nowISO() }).eq('room', room).eq('name', playerName)
  roleChoice.innerHTML = '<p>✅ Rolle gespeichert. Warte auf den anderen Spieler...</p>'
  checkIfBothReady()
}

async function checkIfBothReady() {
  const { data } = await supabase.from('rooms').select('*').eq('room', room)
  if (data.length === 2) {
    if (data.every(p => p.role === null)) {
      resultDiv.style.display = 'none'
      renderRoleChoice()
      return
    }

    const roles = data.map(p => p.role)
    if (roles.every(r => r === 'bluff')) {
      resultDiv.style.display = 'block'
      resultDiv.innerHTML = `
        <h2>🚫 Beide bluffen! Das ergibt keinen Sinn.</h2>
        <p>Bitte entscheidet euch neu:</p>
        <button id="reselectBtn">🔁 Zurück zur Auswahl</button>
      `
      document.getElementById('reselectBtn').onclick = async () => {
        await supabase.from('rooms').update({ role: null, word: null }).eq('room', room)
        resultDiv.style.display = 'none'
        roleChoice.style.display = 'none'
        renderRoleChoice()
      }
      return
    }

    let sharedWord = data[0].word
    if (!sharedWord) {
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name))
      if (sorted[0].name === playerName) {
        const wordPool = wordCategories[category] || []
        sharedWord = wordPool[Math.floor(Math.random() * wordPool.length)]
        await supabase.from('rooms').update({ word: sharedWord }).eq('room', room)
      } else {
        setTimeout(checkIfBothReady, 1000)
        return
      }
    }

    const { data: confirmed } = await supabase.from('rooms').select('*').eq('room', room).eq('name', playerName)
    const me = confirmed[0]
    resultDiv.style.display = 'block'
    resultDiv.innerHTML = me.role === 'word'
      ? `<h2>🔑 Dein Wort: ${sharedWord}</h2>`
      : `<h2>🤫 Du musst bluffen!</h2>`
    resultDiv.innerHTML += `<br><button id="nextRoundBtn">🔄 Neue Runde starten</button>`
    document.getElementById('nextRoundBtn').onclick = async () => {
      await supabase.from('rooms').update({ role: null, word: null }).eq('room', room)
      resultDiv.style.display = 'none'
      roleChoice.style.display = 'none'
      renderRoleChoice()
    }
  } else {
    setTimeout(checkIfBothReady, 1000)
  }
}
